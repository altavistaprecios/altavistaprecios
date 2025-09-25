import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupAdmin() {
  const adminEmail = 'admin@altavista.com'
  const adminPassword = 'Admin123!@#'

  try {
    // Check if admin exists by listing all users
    const { data: usersList, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      return
    }

    const existingUser = usersList.users.find(u => u.email === adminEmail)

    if (existingUser) {
      console.log('Admin user already exists')

      // Update to ensure is_admin is true
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: {
            is_admin: true,
            company_name: 'AltaVista Admin'
          }
        }
      )

      if (updateError) {
        console.error('Error updating admin user:', updateError)
      } else {
        console.log('Admin user updated successfully')
      }
    } else {
      // Create admin user
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          is_admin: true,
          company_name: 'AltaVista Admin'
        }
      })

      if (error) {
        console.error('Error creating admin user:', error)
      } else {
        console.log('Admin user created successfully')
        console.log('Email:', adminEmail)
        console.log('Password:', adminPassword)
      }
    }

    // List all users to verify
    const { data: allUsers, error: allUsersError } = await supabase.auth.admin.listUsers()
    if (!allUsersError) {
      console.log('\nAll users:')
      allUsers.users.forEach(user => {
        console.log(`- ${user.email} (admin: ${user.user_metadata?.is_admin || false})`)
      })
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

setupAdmin()