import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, email, company_name, phone } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Registration request ID is required' },
        { status: 400 }
      )
    }

    // Verify the current user is an admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase
      .rpc('is_admin')

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    // Get the registration request details from database
    // If table doesn't exist yet, fall back to data from frontend
    let registrationRequest

    try {
      const { data, error } = await supabase
        .from('registration_requests')
        .select('*')
        .eq('id', requestId)
        .eq('status', 'pending')
        .single()

      if (!error && data) {
        registrationRequest = data
      }
    } catch (e) {
      console.log('Registration requests table might not exist yet, using frontend data')
    }

    // Fall back to frontend data if no record found
    if (!registrationRequest) {
      if (!email || !company_name) {
        return NextResponse.json(
          { error: 'Registration request not found. Email and company name are required.' },
          { status: 400 }
        )
      }

      registrationRequest = {
        id: requestId,
        email: email,
        company_name: company_name,
        phone: phone || null,
        status: 'pending'
      }
    }

    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { error: 'Server configuration error: Service role key not found' },
        { status: 500 }
      )
    }

    // Use admin client to create user with email pre-confirmed
    const adminSupabase = await createAdminClient()

    // First, check if a user already exists with this email
    const { data: existingUsers, error: listError } = await adminSupabase.auth.admin.listUsers({
      page: 1,
      perPage: 10
    })

    let userId: string | null = null
    let userAlreadyExists = false

    if (!listError && existingUsers) {
      const existingUser = existingUsers.users.find(u => u.email === registrationRequest.email)
      if (existingUser) {
        userId = existingUser.id
        userAlreadyExists = true
        console.log(`User already exists with email ${registrationRequest.email}, ID: ${userId}`)
      }
    }

    // If user doesn't exist, create them
    if (!userAlreadyExists) {
      // Generate a secure random password that the user will never use
      const tempPassword = Math.random().toString(36).slice(2) + 'Aa1!'

      // Create the user with email already confirmed
      const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
        email: registrationRequest.email,
        password: tempPassword,
        email_confirm: true, // This bypasses email confirmation
        user_metadata: {
          company_name: registrationRequest.company_name,
          phone: registrationRequest.phone,
          is_admin: false
        }
      })

      if (createError) {
        console.error('Error creating user:', createError)

        // Check if user already exists error
        if (createError.message?.includes('already been registered')) {
          // Try to find the existing user
          const { data: existingUsers2, error: listError2 } = await adminSupabase.auth.admin.listUsers({
            page: 1,
            perPage: 50
          })

          if (!listError2 && existingUsers2) {
            const existingUser = existingUsers2.users.find(u => u.email === registrationRequest.email)
            if (existingUser) {
              userId = existingUser.id
              userAlreadyExists = true
              console.log(`Found existing user after creation error: ${userId}`)
            }
          }
        }

        if (!userId) {
          return NextResponse.json(
            { error: 'Failed to create user account: ' + createError.message },
            { status: 500 }
          )
        }
      } else if (newUser) {
        userId = newUser.user.id
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Failed to get user ID' },
        { status: 500 }
      )
    }

    // Update user metadata with approval information
    const { error: updateUserError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          company_name: registrationRequest.company_name,
          phone: registrationRequest.phone,
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          is_admin: false
        }
      }
    )

    if (updateUserError) {
      console.error('Error updating user metadata:', updateUserError)

      // If user was just created and metadata update failed, delete the user
      if (!userAlreadyExists) {
        await adminSupabase.auth.admin.deleteUser(userId)
      }

      return NextResponse.json(
        { error: 'Failed to update user metadata: ' + updateUserError.message },
        { status: 500 }
      )
    }

    // IMPORTANT: Update the registration request to approved BEFORE sending email
    // This ensures UI shows correct status even if email fails
    const { error: updateError } = await supabase
      .from('registration_requests')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating registration request:', updateError)
      // Don't fail the whole process if this update fails
      // The user is already created at this point
    }

    // Generate a magic link for password setup
    const { data: magicLink, error: magicLinkError } = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: registrationRequest.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/setup-password`,
      }
    })

    if (magicLinkError || !magicLink) {
      console.error('Error generating magic link:', magicLinkError)
      // User is created but they'll need to use forgot password
      return NextResponse.json({
        success: true,
        warning: 'User created but email could not be sent. User should use forgot password.',
      })
    }

    // Send custom email with the magic link
    // For now, we'll use Supabase's email service via a password reset
    // In production, you'd want to use a proper email service like SendGrid/Resend
    const { error: emailError } = await adminSupabase.auth.resetPasswordForEmail(
      registrationRequest.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/setup-password`,
      }
    )

    if (emailError) {
      console.error('Error sending email:', emailError)

      // Check if it's a rate limit error
      if (emailError.message?.includes('rate') || emailError.message?.includes('429')) {
        return NextResponse.json({
          success: true,
          warning: 'User approved but email rate limited. Please wait 60 seconds and use "Resend Invite" or user can use "Forgot Password".',
          email: registrationRequest.email
        })
      }

      return NextResponse.json({
        success: true,
        warning: 'User approved but email could not be sent. User can use "Forgot Password" to set up their account.',
        email: registrationRequest.email
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Registration approved and invitation email sent',
      email: registrationRequest.email
    })

  } catch (error) {
    console.error('Error in approve-registration:', error)

    // Return more specific error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}