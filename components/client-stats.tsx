"use client"

import { useEffect, useState } from "react"
import { Package, Sparkles } from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ClientStats {
  futureXProducts: number
  terminadosProducts: number
  stockLenses: number
  laboratoryLenses: number
}

export function ClientStats() {
  const [stats, setStats] = useState<ClientStats>({
    futureXProducts: 0,
    terminadosProducts: 0,
    stockLenses: 0,
    laboratoryLenses: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClientStats()
  }, [])

  const fetchClientStats = async () => {
    try {
      setLoading(true)
      // Fetch data from APIs
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ])

      const products = await productsRes.json().catch(() => ({ products: [] }))
      const categories = await categoriesRes.json().catch(() => ({ categories: [] }))

      // Find category IDs
      const stockCategory = categories.categories?.find((c: any) => c.slug === 'monofocales-future-x-stock')
      const labCategory = categories.categories?.find((c: any) => c.slug === 'monofocales-future-x-laboratory')
      const clearViewCategory = categories.categories?.find((c: any) => c.slug === 'monofocales-terminados')

      // Count products by category - only active products for clients
      const activeProducts = products.products?.filter((p: any) => p.is_active) || []

      const stockCount = activeProducts.filter((p: any) => p.category_id === stockCategory?.id).length || 0
      const labCount = activeProducts.filter((p: any) => p.category_id === labCategory?.id).length || 0
      const clearViewCount = activeProducts.filter((p: any) => p.category_id === clearViewCategory?.id).length || 0

      setStats({
        futureXProducts: stockCount + labCount,
        terminadosProducts: clearViewCount,
        stockLenses: stockCount,
        laboratoryLenses: labCount,
      })
    } catch (error) {
      console.error('Failed to fetch client stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-t from-primary/5 to-card">
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Link href="/client/monofocales-future-x" className="transition-transform hover:scale-[1.02]">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-t from-primary/5 to-card">
          <CardHeader className="relative">
            <CardDescription>MONOFOCALES FUTURE-X</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {stats.futureXProducts}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                available products
              </span>
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Package className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="flex gap-4 font-medium">
              <span>{stats.stockLenses} Stock Lenses</span>
              <span className="text-muted-foreground">•</span>
              <span>{stats.laboratoryLenses} Laboratory Lenses</span>
            </div>
            <div className="text-muted-foreground">
              Click to view available Future-X products
            </div>
          </CardFooter>
        </Card>
      </Link>

      <Link href="/client/monofocales-terminados" className="transition-transform hover:scale-[1.02]">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-t from-primary/5 to-card">
          <CardHeader className="relative">
            <CardDescription>MONOFOCALES TERMINADOS</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {stats.terminadosProducts}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                available products
              </span>
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Sparkles className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="flex gap-2 font-medium">
              ClearView 1.60 DuraVision
            </div>
            <div className="text-muted-foreground">
              Click to view available finished products
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  )
}