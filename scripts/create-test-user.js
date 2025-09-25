const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  const adminEmail = 'anibalin@gmail.com'
  const adminPassword = '1234Petunias'

  console.log('Creating admin user...')

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true
  })

  if (error) {
    console.error('Error creating user:', error.message)
    if (error.message.includes('already registered')) {
      console.log('\nAdmin user already exists!')
      console.log('You can login with:')
      console.log('Email:', adminEmail)
      console.log('Password:', adminPassword)
    }
  } else {
    console.log('Admin user created successfully!')
    console.log('\nYou can now login at http://localhost:3001/login with:')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
  }
}

createTestUser()