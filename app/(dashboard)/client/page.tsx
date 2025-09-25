'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, DollarSign, ShoppingCart, TrendingDown, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'

interface ClientStats {
  availableProducts: number
  customPrices: number
  totalOrders: number
  averageSavings: number
}

export default function ClientDashboardPage() {
  const [stats, setStats] = useState<ClientStats>({
    availableProducts: 0,
    customPrices: 0,
    totalOrders: 0,
    averageSavings: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    fetchClientStats()
  }, [])

  const fetchClientStats = async () => {
    try {
      setLoading(true)
      // Fetch client-specific data
      const [productsRes, pricesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/client-prices'),
      ])

      const products = await productsRes.json()
      const prices = await pricesRes.json()

      // Calculate average savings from custom prices
      let totalSavings = 0
      let customPriceCount = 0

      if (prices.data && Array.isArray(prices.data)) {
        prices.data.forEach((price: any) => {
          if (price.discount_percentage > 0) {
            totalSavings += price.discount_percentage
            customPriceCount++
          }
        })
      }

      setStats({
        availableProducts: products.data?.length || 0,
        customPrices: customPriceCount,
        totalOrders: 0, // This would come from orders API
        averageSavings: customPriceCount > 0 ? totalSavings / customPriceCount : 0,
      })
    } catch (error) {
      console.error('Failed to fetch client stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    href,
  }: {
    title: string
    value: string | number
    description: string
    icon: React.ElementType
    href?: string
  }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => href && router.push(href)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">
          {user?.company_name} - View your custom pricing and place orders
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Available Products"
          value={stats.availableProducts}
          description="Products you can order"
          icon={Package}
          href="/client/products"
        />
        <StatCard
          title="Custom Prices"
          value={stats.customPrices}
          description="Products with special pricing"
          icon={DollarSign}
          href="/client/pricing"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          description="Orders placed this month"
          icon={ShoppingCart}
        />
        <StatCard
          title="Avg. Savings"
          value={`${stats.averageSavings.toFixed(1)}%`}
          description="Your discount rate"
          icon={TrendingDown}
        />
      </div>

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