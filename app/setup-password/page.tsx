'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from 'next-intl'

export default function SetupPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)
  const t = useTranslations('setupPassword')

  useEffect(() => {
    // Check if we have a valid session/token
    checkSession()
  }, [])

  const checkSession = async () => {
    // First check if we already have a session
    const { data: { session } } = await supabase.auth.getSession()

    // Check for recovery/magic link tokens in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')

    // Accept both recovery (password reset) and magiclink tokens
    if (!session && (!accessToken || (type !== 'recovery' && type !== 'magiclink'))) {
      setIsValidToken(false)
    }

    // If we have a token but no session, exchange it for a session
    if (accessToken && !session) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || ''
      })

      if (error) {
        console.error('Error setting session:', error)
        setIsValidToken(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t('errors.mismatch'))
      return
    }

    if (password.length < 8) {
      setError(t('errors.minLength'))
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Get the current user to ensure profile exists
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Ensure user_profiles record exists with approved status
        // This is a safety check in case the admin approval didn't create it
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            status: 'approved',
            company_name: user.user_metadata?.company_name || '',
            phone: user.user_metadata?.phone || '',
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (profileError) {
          console.error('Error ensuring user profile:', profileError)
        }

        // Refresh the session to ensure metadata is up to date
        await supabase.auth.refreshSession()
      }

      setSuccess(true)
      toast({
        title: t('toast.title'),
        description: t('toast.description'),
      })

      // Determine the redirect path based on user role
      const isAdmin = user?.user_metadata?.is_admin === true
      const redirectPath = isAdmin ? '/admin' : '/client'

      // Redirect to appropriate dashboard after 1.5 seconds
      setTimeout(() => {
        router.push(redirectPath)
      }, 1500)
    }
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>{t('invalid.title')}</CardTitle>
            <CardDescription className="mt-2">
              {t('invalid.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push('/login')}
            >
              {t('invalid.action')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{t('success.title')}</CardTitle>
            <CardDescription className="mt-2">{t('success.description')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('intro.title')}</CardTitle>
          <CardDescription>{t('intro.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('form.passwordLabel')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('form.passwordPlaceholder')}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  {t('form.passwordHelper')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('form.confirmLabel')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('form.confirmPlaceholder')}
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('form.submitting') : t('form.submit')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
