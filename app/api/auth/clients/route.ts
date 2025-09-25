import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Get the current user to check if they're an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.is_admin === true
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all approved clients
    const { data: clients, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        company_name,
        phone,
        status,
        created_at,
        updated_at
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    // Get additional user data from auth.users
    const userIds = clients?.map(c => c.id) || []

    if (userIds.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Get auth user data
    const { data: { users: authUsers }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error('Error fetching auth users:', usersError)
      // Continue with partial data if we can't get auth users
    }

    // Combine the data
    const enrichedClients = clients?.map(client => {
      const authUser = authUsers?.find(u => u.id === client.id)
      const isClient = authUser?.user_metadata?.is_admin !== true

      // Only include actual clients (not admins)
      if (!isClient) return null

      return {
        id: client.id,
        email: authUser?.email || '',
        company_name: client.company_name || authUser?.user_metadata?.company_name || '',
        contact_name: authUser?.user_metadata?.contact_name || authUser?.email?.split('@')[0] || '',
        role: 'client',
        created_at: client.created_at,
        last_sign_in_at: authUser?.last_sign_in_at || null,
        discount_tier: authUser?.user_metadata?.discount_tier || 0,
        total_orders: 0, // This would come from an orders table if it exists
        active: client.status === 'approved'
      }
    }).filter(Boolean) || []

    return NextResponse.json({ data: enrichedClients })
  } catch (error) {
    console.error('Error in clients API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}