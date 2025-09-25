import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ProductService } from '@/lib/services/product-service'
import { UserService } from '@/lib/services/user-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { treatment_ids, additional_costs } = body

    if (!Array.isArray(treatment_ids)) {
      return NextResponse.json(
        { error: 'treatment_ids must be an array' },
        { status: 400 }
      )
    }

    const productService = new ProductService()

    // Check if product exists
    const product = await productService.findById(id)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const treatments = treatment_ids.map((id: string, index: number) => ({
      treatment_id: id,
      additional_cost: additional_costs?.[index],
    }))

    await productService.addTreatments(id, treatments)

    return NextResponse.json(
      { message: 'Treatments added successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding treatments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}