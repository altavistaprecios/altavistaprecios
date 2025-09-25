import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
    const productId = searchParams.get('product_id')
    const userId = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '100')

    const userService = new UserService()
    const isAdmin = await userService.checkIsAdmin(user.id)

    let query = supabase
      .from('price_history')
      .select(`
        *,
        product:products(name, code)
      `)
      .order('changed_at', { ascending: false })
      .limit(limit)

    // Non-admin users can only see their own price history
    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    if (productId) {
      query = query.eq('product_id', productId)
    }

    const { data: history, error } = await query

    if (error) throw error

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Error fetching price history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}