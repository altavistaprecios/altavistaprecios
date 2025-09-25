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

    const userService = new UserService()
    const isAdmin = await userService.checkIsAdmin(user.id)

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('client_id')

    // Non-admin users can only see their own summary
    const targetUserId = !isAdmin ? user.id : (clientId || user.id)

    if (!isAdmin && clientId && clientId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { data: prices, error } = await supabase
      .from('client_prices')
      .select('markup_percentage, custom_price_usd')
      .eq('user_id', targetUserId)

    if (error) throw error

    const totalProducts = prices.length
    const averageMarkup = prices.length > 0
      ? prices.reduce((acc, p) => acc + (p.markup_percentage || 0), 0) / prices.length
      : 0

    const totalValue = prices.reduce((acc, p) => acc + p.custom_price_usd, 0)

    return NextResponse.json({
      totalProducts,
      averageMarkup: Math.round(averageMarkup * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
    })
  } catch (error) {
    console.error('Error fetching price summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}