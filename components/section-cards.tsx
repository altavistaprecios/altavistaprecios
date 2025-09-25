"use client"

import { useEffect, useState } from "react"
import { TrendingDownIcon, TrendingUpIcon, Package, Users, DollarSign, Activity } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DashboardStats {
  totalProducts: number
  totalClients: number
  averageDiscount: number
  recentPriceChanges: number
}

export function SectionCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalClients: 0,
    averageDiscount: 0,
    recentPriceChanges: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      // Fetch multiple endpoints in parallel
      const [productsRes, clientsRes, pricesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/auth/clients'),
        fetch('/api/price-history?limit=7'), // Last 7 days
      ])

      const products = await productsRes.json().catch(() => ({ data: [] }))
      const clients = await clientsRes.json().catch(() => ({ data: [] }))
      const priceHistory = await pricesRes.json().catch(() => ({ data: [] }))

      // Calculate average discount from client prices
      const clientPricesRes = await fetch('/api/client-prices')
      const clientPrices = await clientPricesRes.json().catch(() => ({ data: [] }))

      let avgDiscount = 0
      if (clientPrices.data && clientPrices.data.length > 0) {
        const discounts = clientPrices.data
          .filter((p: any) => p.discount_percentage > 0)
          .map((p: any) => p.discount_percentage)
        avgDiscount = discounts.length > 0
          ? discounts.reduce((a: number, b: number) => a + b, 0) / discounts.length
          : 0
      }

      setStats({
        totalProducts: products.data?.length || 0,
        totalClients: clients.data?.length || 0,
        averageDiscount: avgDiscount,
        recentPriceChanges: priceHistory.data?.length || 0,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 lg:px-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-8 w-32 bg-muted animate-pulse rounded mt-2"></div>
            </CardHeader>
            <CardFooter>
              <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Products</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.totalProducts}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Package className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active in catalog
          </div>
          <div className="text-muted-foreground">
            Optical products and coatings
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>B2B Clients</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.totalClients}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Users className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Registered clients
          </div>
          <div className="text-muted-foreground">
            With custom pricing
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Average Discount</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.averageDiscount.toFixed(1)}%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <DollarSign className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Client pricing benefit
          </div>
          <div className="text-muted-foreground">Across all products</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Recent Changes</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.recentPriceChanges}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <Activity className="size-3" />
              This week
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Price updates <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Last 7 days activity</div>
        </CardFooter>
      </Card>
    </div>
  )
}