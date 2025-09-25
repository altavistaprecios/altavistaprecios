'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/components/products/product-card'
import { ProductTable } from '@/components/products/product-table'
import { DataTableSkeleton } from '@/components/products/data-table-skeleton'
import { Product } from '@/lib/models/product'
import { Grid, List, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'

export default function ClientMonofocalesTerminadosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const { user } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ])

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()

      // Find Terminados category
      const terminadosCategory = (categoriesData.categories || []).find((c: any) =>
        c.slug === 'monofocales-terminados'
      )

      if (terminadosCategory) {
        // Filter only active Terminados products for clients
        const terminadosProducts = (productsData.products || productsData.data || []).filter((p: Product) =>
          p.is_active && p.category_id === terminadosCategory.id
        )
        setProducts(terminadosProducts)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load Terminados products')
    } finally {
      setLoading(false)
    }
  }

  const handleViewProduct = (product: Product) => {
    toast.info(`Product: ${product.name}\nBase Price: $${Number(product.base_price_usd).toFixed(2)}\nCode: ${product.code}`)
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="px-4 lg:px-6 pb-4">
          <h1 className="text-2xl font-bold">MONOFOCALES TERMINADOS</h1>
          <p className="text-muted-foreground">
            Finished single vision lenses ready for immediate delivery
          </p>
        </div>
        <div className="px-4 lg:px-6">
          <DataTableSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 lg:px-6 pb-4">
        <h1 className="text-2xl font-bold">MONOFOCALES TERMINADOS</h1>
        <p className="text-muted-foreground">
          Finished single vision lenses ready for immediate delivery
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <div>
                  <CardTitle>Terminados Collection</CardTitle>
                  <CardDescription>
                    {products.length} finished products ready for delivery
                  </CardDescription>
                </div>
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
                <TabsList>
                  <TabsTrigger value="grid">
                    <Grid className="h-4 w-4 mr-2" />
                    Grid
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No Terminados products available at the moment
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onView={handleViewProduct}
                    isAdmin={false}
                  />
                ))}
              </div>
            ) : (
              <ProductTable
                products={products}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}