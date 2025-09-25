'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { ClientStats } from '@/components/client-stats'

export default function ClientDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 lg:px-6 pb-4">
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          {user?.company_name} - View your custom pricing and place orders
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <ClientStats />
      </div>
    </div>
  )
}