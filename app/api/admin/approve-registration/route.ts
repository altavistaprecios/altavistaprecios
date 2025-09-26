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

    // IMPORTANT: Create or update user_profiles record with approved status
    // This is critical for the middleware to recognize the user as approved
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        status: 'approved',
        company_name: registrationRequest.company_name,
        phone: registrationRequest.phone,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating/updating user profile:', profileError)
      // This is critical - if we can't create the profile, the user will be stuck
      // Try to clean up the created user
      if (!userAlreadyExists) {
        await adminSupabase.auth.admin.deleteUser(userId)
      }
      return NextResponse.json(
        { error: 'Failed to create user profile: ' + profileError.message },
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

    // Send approval email via Resend
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

    // Create a password reset link using the magic link
    const resetLink = magicLink.properties?.action_link ||
                     `${siteUrl}/auth/reset-password?email=${encodeURIComponent(registrationRequest.email)}`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Welcome to AltaVista Precios</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Welcome to AltaVista Precios!</h1>

          <p>Dear ${registrationRequest.company_name},</p>

          <p>Your registration request has been approved! You can now access our pricing platform.</p>

          <p>To get started, please set up your password by clicking the link below:</p>

          <div style="margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Set Up Your Password
            </a>
          </div>

          <p><small>Or copy and paste this link into your browser:</small><br>
          <small style="color: #666;">${resetLink}</small></p>

          <p>This link will expire in 24 hours for security reasons.</p>

          <p>If you didn't request this account, please ignore this email.</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            The AltaVista Precios Team
          </p>
        </body>
      </html>
    `

    const emailText = `
Welcome to AltaVista Precios!

Dear ${registrationRequest.company_name},

Your registration request has been approved! You can now access our pricing platform.

To get started, please set up your password by clicking the link below:

${resetLink}

This link will expire in 24 hours for security reasons.

If you didn't request this account, please ignore this email.

Best regards,
The AltaVista Precios Team
    `.trim()

    try {
      // Send email via our Resend API route
      const emailResponse = await fetch(`${siteUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: registrationRequest.email,
          subject: 'Welcome to AltaVista Precios - Account Approved',
          html: emailHtml,
          text: emailText,
        }),
      })

      const emailResult = await emailResponse.json()

      if (!emailResponse.ok) {
        console.error('Error sending email via Resend:', emailResult)

        // Try fallback to Supabase email as last resort
        const { error: fallbackError } = await adminSupabase.auth.resetPasswordForEmail(
          registrationRequest.email,
          {
            redirectTo: `${siteUrl}/setup-password`,
          }
        )

        if (fallbackError) {
          console.error('Fallback email also failed:', fallbackError)
          return NextResponse.json({
            success: true,
            warning: 'User approved but email could not be sent. User can use "Forgot Password" to set up their account.',
            email: registrationRequest.email
          })
        }

        return NextResponse.json({
          success: true,
          message: 'Registration approved and invitation email sent (via backup service)',
          email: registrationRequest.email
        })
      }

      console.log('Email sent successfully via Resend:', emailResult.id)

    } catch (emailError) {
      console.error('Error sending email:', emailError)

      // Try fallback to Supabase email
      const { error: fallbackError } = await adminSupabase.auth.resetPasswordForEmail(
        registrationRequest.email,
        {
          redirectTo: `${siteUrl}/setup-password`,
        }
      )

      if (fallbackError) {
        console.error('Fallback email also failed:', fallbackError)
        return NextResponse.json({
          success: true,
          warning: 'User approved but email could not be sent. User can use "Forgot Password" to set up their account.',
          email: registrationRequest.email
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Registration approved and invitation email sent (via backup service)',
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