import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClientPriceService } from '@/lib/services/client-price-service'
import { UserService } from '@/lib/services/user-service'

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
    const { prices } = body

    if (!Array.isArray(prices)) {
      return NextResponse.json(
        { error: 'Invalid request - prices must be an array' },
        { status: 400 }
      )
    }

    const userService = new UserService()
    const isAdmin = await userService.checkIsAdmin(user.id)
    const targetUserId = isAdmin && body.user_id ? body.user_id : user.id

    const clientPriceService = new ClientPriceService()
    const result = await clientPriceService.bulkCreate(targetUserId, prices)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error bulk creating prices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}