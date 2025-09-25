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

interface AdminStats {
  stockLenses: number
  laboratoryLenses: number
  clearViewProducts: number
  totalClients: number
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    stockLenses: 0,
    laboratoryLenses: 0,
    clearViewProducts: 0,
    totalClients: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      // Fetch data from APIs
      const [productsRes, categoriesRes, clientsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/auth/clients'),
      ])

      const products = await productsRes.json().catch(() => ({ products: [] }))
      const categories = await categoriesRes.json().catch(() => ({ categories: [] }))
      const clients = await clientsRes.json().catch(() => ({ data: [] }))

      // Find category IDs
      const stockCategory = categories.categories?.find((c: any) => c.slug === 'monofocales-future-x-stock')
      const labCategory = categories.categories?.find((c: any) => c.slug === 'monofocales-future-x-laboratory')
      const clearViewCategory = categories.categories?.find((c: any) => c.slug === 'monofocales-terminados')

      // Count products by category
      const stockCount = products.products?.filter((p: any) => p.category_id === stockCategory?.id).length || 0
      const labCount = products.products?.filter((p: any) => p.category_id === labCategory?.id).length || 0
      const clearViewCount = products.products?.filter((p: any) => p.category_id === clearViewCategory?.id).length || 0

      setStats({
        stockLenses: stockCount,
        laboratoryLenses: labCount,
        clearViewProducts: clearViewCount,
        totalClients: clients.data?.length || 0,
      })
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2">
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
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2">
      <Link href="/admin/monofocales-future-x" className="transition-transform hover:scale-[1.02]">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-t from-primary/5 to-card">
          <CardHeader className="relative">
            <CardDescription>MONOFOCALES FUTURE-X</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {stats.stockLenses + stats.laboratoryLenses}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                productos
              </span>
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Package className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="flex gap-4 font-medium">
              <span>{stats.stockLenses} Lentes de Stock</span>
              <span className="text-muted-foreground">•</span>
              <span>{stats.laboratoryLenses} Lentes de Laboratorio</span>
            </div>
            <div className="text-muted-foreground">
              Click para gestionar productos Future-X
            </div>
          </CardFooter>
        </Card>
      </Link>

      <Link href="/admin/monofocales-terminados" className="transition-transform hover:scale-[1.02]">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-t from-primary/5 to-card">
          <CardHeader className="relative">
            <CardDescription>MONOFOCALES TERMINADOS</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {stats.clearViewProducts}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                productos
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
              Click para gestionar productos terminados
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  )
}