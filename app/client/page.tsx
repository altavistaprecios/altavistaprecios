'use client'

import { useTranslations } from 'next-intl'

import { useAuth } from '@/components/providers/auth-provider'
import { ClientStats } from '@/components/client-stats'

export default function ClientDashboardPage() {
  const { user } = useAuth()
  const t = useTranslations('clientDashboard')
  const companyName = user?.company_name ?? t('defaultCompany')

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 lg:px-6 pb-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle', { company: companyName })}
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <ClientStats />
      </div>
    </div>
  )
}
