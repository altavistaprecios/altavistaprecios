import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClientPriceService } from '@/lib/services/client-price-service'
import { ProductService } from '@/lib/services/product-service'
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
    const clientId = searchParams.get('client_id')
    const productId = searchParams.get('product_id')

    const userService = new UserService()
    const isAdmin = await userService.checkIsAdmin(user.id)
    const clientPriceService = new ClientPriceService()

    // Non-admin users can only see their own prices
    if (!isAdmin && clientId && clientId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot access other client prices' },
        { status: 403 }
      )
    }

    const targetUserId = clientId || user.id

    let prices
    if (productId) {
      const price = await clientPriceService.findByUserAndProduct(targetUserId, productId)
      prices = price ? [price] : []
    } else {
      prices = await clientPriceService.findByUser(targetUserId)
    }

    return NextResponse.json({ prices })
  } catch (error) {
    console.error('Error fetching client prices:', error)
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

    const body = await request.json()
    const userService = new UserService()
    const isAdmin = await userService.checkIsAdmin(user.id)

    // Determine target user
    const targetUserId = isAdmin && body.user_id ? body.user_id : user.id

    // Validate product exists
    const productService = new ProductService()
    const product = await productService.findById(body.product_id)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Validate price is not below base price
    if (body.custom_price_usd < product.base_price_usd) {
      return NextResponse.json(
        { error: `Price cannot be below base price of $${product.base_price_usd}` },
        { status: 400 }
      )
    }

    const clientPriceService = new ClientPriceService()

    // Check if updating existing price
    const existingPrice = await clientPriceService.findByUserAndProduct(
      targetUserId,
      body.product_id
    )

    const price = await clientPriceService.create({
      ...body,
      user_id: targetUserId,
    })

    return NextResponse.json(
      {
        price,
        historyCreated: true,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid price data' },
          { status: 400 }
        )
      }
      if (error.message.includes('below base price')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    console.error('Error creating client price:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}