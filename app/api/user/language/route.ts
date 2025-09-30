import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { language } = body

    // Validate language
    if (!language || !['en', 'es'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be "en" or "es"' },
        { status: 400 }
      )
    }

    // Update user profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ preferred_language: language })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating language preference:', updateError)
      return NextResponse.json(
        { error: 'Failed to update language preference' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, language })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}