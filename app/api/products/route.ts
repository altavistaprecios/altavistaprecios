import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ProductService } from '@/lib/services/product-service'
import { ClientPriceService } from '@/lib/services/client-price-service'
import { UserService } from '@/lib/services/user-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const categoryId = searchParams.get('category_id')

    const productService = new ProductService()
    const products = await productService.findAll({
      category_id: categoryId || undefined,
      is_active: true,
    })

    console.log('Products fetched:', products.length)

    // For client users, include their custom prices
    const userService = new UserService()
    const isAdmin = await userService.checkIsAdmin(user.id)

    if (!isAdmin) {
      const clientPriceService = new ClientPriceService()
      const clientPrices = await clientPriceService.findByUser(user.id)

      const productsWithPrices = products.map(product => {
        const clientPrice = clientPrices.find(cp => cp.product_id === product.id)
        return {
          ...product,
          client_price: clientPrice?.custom_price_usd,
          markup_percentage: clientPrice?.markup_percentage,
        }
      })

      return NextResponse.json({ products: productsWithPrices })
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userService = new UserService()
    const isAdmin = await userService.checkIsAdmin(user.id)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Check if product code already exists
    const productService = new ProductService()
    const existingProduct = await productService.findByCode(body.code)

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product code already exists' },
        { status: 400 }
      )
    }

    const product = await productService.create(body)

    return NextResponse.json(
      { product },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid product data' },
        { status: 400 }
      )
    }

    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}