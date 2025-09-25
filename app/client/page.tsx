'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { ClientStats } from '@/components/client-stats'

export default function ClientDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-4 px-4 md:gap-6 md:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">
          {user?.company_name} - View your custom pricing and place orders
        </p>
      </div>

      <ClientStats />
    </div>
  )
}