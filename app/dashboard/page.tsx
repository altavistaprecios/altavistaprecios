'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/components/providers/auth-provider'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const { user } = useAuth()
  const t = useTranslations()

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.replace('/admin')
      } else {
        router.replace('/client')
      }
    }
  }, [user, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground">{t('dashboard.redirecting')}</p>
    </div>
  )
}