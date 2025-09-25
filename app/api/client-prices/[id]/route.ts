import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClientPriceService } from '@/lib/services/client-price-service'
import { ProductService } from '@/lib/services/product-service'
import { UserService } from '@/lib/services/user-service'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const clientPriceService = new ClientPriceService()
    const userService = new UserService()

    // Get existing price to verify ownership
    const existingPrice = await clientPriceService.findById(params.id)

    if (!existingPrice) {
      return NextResponse.json(
        { error: 'Price not found' },
        { status: 404 }
      )
    }

    // Check if user owns this price or is admin
    const isAdmin = await userService.checkIsAdmin(user.id)
    if (!isAdmin && existingPrice.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot modify other client prices' },
        { status: 403 }
      )
    }

    // Validate product exists
    const productService = new ProductService()
    const product = await productService.findById(body.product_id || existingPrice.product_id)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Validate custom price is not below base price
    if (body.custom_price && body.custom_price < product.base_price_usd) {
      return NextResponse.json(
        { error: `Price cannot be below base price of $${product.base_price_usd}` },
        { status: 400 }
      )
    }

    // Update the price
    const updatedPrice = await clientPriceService.update(params.id, {
      custom_price_usd: body.custom_price || 0,
      discount_percentage: body.discount_percentage || 0,
    })

    return NextResponse.json({ price: updatedPrice })
  } catch (error) {
    console.error('Error updating client price:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clientPriceService = new ClientPriceService()
    const userService = new UserService()

    // Get existing price to verify ownership
    const existingPrice = await clientPriceService.findById(params.id)

    if (!existingPrice) {
      return NextResponse.json(
        { error: 'Price not found' },
        { status: 404 }
      )
    }

    // Check if user owns this price or is admin
    const isAdmin = await userService.checkIsAdmin(user.id)
    if (!isAdmin && existingPrice.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot delete other client prices' },
        { status: 403 }
      )
    }

    await clientPriceService.delete(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client price:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}