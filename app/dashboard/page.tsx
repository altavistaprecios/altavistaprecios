'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const { user } = useAuth()

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
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}