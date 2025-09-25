import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClientPriceService } from '@/lib/services/client-price-service'
import { ProductService } from '@/lib/services/product-service'

export async function POST(request: NextRequest) {
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
    const { percentage } = body

    if (typeof percentage !== 'number') {
      return NextResponse.json(
        { error: 'Invalid percentage value' },
        { status: 400 }
      )
    }

    const clientPriceService = new ClientPriceService()
    const productService = new ProductService()

    // Get all products
    const products = await productService.findAll()

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: 'No products found' },
        { status: 404 }
      )
    }

    // Get existing client prices
    const existingPrices = await clientPriceService.findByUser(user.id)
    const existingPriceMap = new Map(
      existingPrices.map(p => [p.product_id, p])
    )

    const adjustmentMultiplier = 1 + (percentage / 100)
    const updatedPrices = []
    const errors = []

    // Process each product
    for (const product of products) {
      const existingPrice = existingPriceMap.get(product.id)

      // Calculate new price based on existing custom price or base price
      const currentPrice = existingPrice?.custom_price_usd ||
                          (existingPrice?.discount_percentage
                            ? product.base_price_usd * (1 - existingPrice.discount_percentage / 100)
                            : product.base_price_usd)

      const newPrice = currentPrice * adjustmentMultiplier

      // Skip if new price would be below base price
      if (newPrice < product.base_price_usd) {
        errors.push(`${product.code}: Cannot set price below base price of $${product.base_price_usd}`)
        continue
      }

      try {
        if (existingPrice) {
          // Update existing price
          const updated = await clientPriceService.update(existingPrice.id, {
            custom_price_usd: newPrice,
            discount_percentage: 0, // Clear discount when setting custom price
          })
          updatedPrices.push(updated)
        } else {
          // Create new price entry
          const created = await clientPriceService.create({
            user_id: user.id,
            product_id: product.id,
            custom_price_usd: newPrice,
            discount_percentage: 0,
          })
          updatedPrices.push(created)
        }
      } catch (error) {
        console.error(`Error updating price for product ${product.code}:`, error)
        errors.push(`${product.code}: Failed to update price`)
      }
    }

    if (errors.length > 0 && updatedPrices.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update any prices', details: errors },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      updated: updatedPrices.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully updated ${updatedPrices.length} price(s) with ${percentage}% adjustment`
    })
  } catch (error) {
    console.error('Error applying bulk adjustment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}