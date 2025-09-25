'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, DollarSign, ArrowRight, TrendingDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { ClientStats } from '@/components/client-stats'

export default function ClientDashboardPage() {
  const router = useRouter()
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-between" variant="outline" onClick={() => router.push('/client/products')}>
              <span className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                Browse Products
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button className="w-full justify-between" variant="outline" onClick={() => router.push('/client/pricing')}>
              <span className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                View Your Pricing
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button className="w-full justify-between" variant="outline" onClick={() => router.push('/client/history')}>
              <span className="flex items-center">
                <TrendingDown className="mr-2 h-4 w-4" />
                Price History
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Price Updates</CardTitle>
            <CardDescription>Latest changes to your custom pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <p className="font-medium">Premium AR Coating</p>
                <p className="text-muted-foreground">New discount: 15% off - Yesterday</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Standard Lens Package</p>
                <p className="text-muted-foreground">Price updated: $42.50 - 3 days ago</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">UV Protection Coating</p>
                <p className="text-muted-foreground">Volume discount applied - 1 week ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}