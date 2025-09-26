import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the current user to check if they're an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error or no user:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.is_admin === true
    console.log('User metadata:', user.user_metadata)
    console.log('Is admin?', isAdmin)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all user profiles with emails using the function
    const { data: profiles, error } = await supabase
      .rpc('get_clients_with_email')

    if (error) {
      console.error('Error fetching profiles:', error)
      return NextResponse.json({
        error: 'Failed to fetch clients',
        details: error.message
      }, { status: 500 })
    }

    // Map the profile data to the expected format
    const enrichedClients = profiles?.map(profile => {
      return {
        id: profile.id,
        email: profile.email || 'email@unknown.com', // Now we have real emails from the view
        company_name: profile.company_name || 'Unknown Company',
        contact_name: profile.contact_name || 'Unknown Contact',
        role: 'client',
        created_at: profile.created_at,
        last_sign_in_at: profile.last_sign_in_at || null, // Now available from the view
        discount_tier: profile.discount_tier || 0,
        total_orders: 0, // This would come from an orders table if it exists
        active: profile.status === 'approved',
        status: profile.status
      }
    }) || []

    return NextResponse.json({ data: enrichedClients })
  } catch (error) {
    console.error('Error in clients API:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Add POST method to create a new pre-authorized client
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

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

    const body = await request.json()
    const { email, company_name, contact_name, discount_tier = 0 } = body

    // Create user with Supabase Auth Admin API using admin client
    const adminSupabase = await createAdminClient()
    const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        company_name,
        contact_name,
        full_name: contact_name,
        discount_tier,
        is_admin: false
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Create user profile using admin client
    if (newUser.user) {
      const { error: profileError } = await adminSupabase
        .from('user_profiles')
        .insert({
          id: newUser.user.id,
          company_name,
          status: 'approved', // Pre-authorized by admin
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Don't fail the whole operation if profile creation fails
      }
    }

    return NextResponse.json({
      success: true,
      user: newUser.user
    })

  } catch (error) {
    console.error('Error in POST /api/auth/clients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}