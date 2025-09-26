'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ProductCard } from '@/components/products/product-card'
import { ProductTable } from '@/components/products/product-table'
import { DataTableSkeleton } from '@/components/products/data-table-skeleton'
import { PriceEditDialog } from '@/components/products/price-edit-dialog'
import { Product } from '@/lib/models/product'
import { ClientPrice } from '@/lib/models/client-price'
import { Grid3x3, List, Download, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'

export default function ClientMonofocalesFutureXPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [clientPrices, setClientPrices] = useState<ClientPrice[]>([])
  const [filter, setFilter] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchProducts()
    fetchClientPrices()
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

      // Store all categories for display
      setCategories(categoriesData.categories || [])

      // Find Future-X categories
      const futureXCategories = (categoriesData.categories || []).filter((c: any) =>
        c.slug === 'monofocales-future-x-stock' ||
        c.slug === 'monofocales-future-x-laboratory'
      )

      const futureXCategoryIds = futureXCategories.map((c: any) => c.id)

      // Filter only active Future-X products for clients
      const futureXProducts = (productsData.products || productsData.data || []).filter((p: Product) =>
        p.is_active && futureXCategoryIds.includes(p.category_id)
      )

      setProducts(futureXProducts)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load Future-X products')
    } finally {
      setLoading(false)
    }
  }

  const fetchClientPrices = async () => {
    try {
      const response = await fetch('/api/client-prices')
      const data = await response.json()
      setClientPrices(data.data || [])
    } catch (error) {
      console.error('Failed to fetch client prices:', error)
    }
  }

  const handleViewProduct = (product: Product) => {
    toast.info(`Product: ${product.name}\nBase Price: $${Number(product.base_price_usd).toFixed(2)}\nCode: ${product.code}`)
  }

  const handleEditPrice = (product: Product) => {
    setEditingProduct(product)
  }

  const handlePriceSaved = () => {
    fetchClientPrices()
    fetchProducts()
  }

  const getCurrentPrice = (productId: string) => {
    return clientPrices.find(p => p.product_id === productId) || null
  }

  // Filter products based on search
  const filteredProducts = products.filter(product => {
    const searchLower = filter.toLowerCase()
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.code.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex flex-1 flex-col space-y-6">
        <div className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Monofocales Future-X
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5">
              Loading...
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Premium single vision lenses - Stock and Laboratory options
          </p>
        </div>
        <div className="px-6">
          <DataTableSkeleton />
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="px-6 pt-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/client">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/client/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Monofocales Future-X</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Enhanced Header */}
        <div className="px-6 space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Monofocales Future-X
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5">
              {filteredProducts.length} products
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Premium single vision lenses - Stock and Laboratory options
          </p>
        </div>

        <Separator className="mx-6" />

        {/* Main Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(v) => v && setViewMode(v as 'grid' | 'list')}
                className="h-9"
              >
                <ToggleGroupItem value="grid" aria-label="Grid view" className="h-9 px-3">
                  <Grid3x3 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view" className="h-9 px-3">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Download className="h-4 w-4 mr-2" />
                    Export Catalog
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download product catalog as CSV</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Product Display */}
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center text-muted-foreground">
                  {filter ? 'No products found matching your search' : 'No Future-X products available at the moment'}
                </div>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={handleViewProduct}
                  isAdmin={false}
                />
              ))}
            </div>
          ) : (
            <Card>
              <ProductTable
                products={filteredProducts}
                categories={categories}
                onEdit={handleEditPrice}
              />
            </Card>
          )}
        </div>

        <PriceEditDialog
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
          currentPrice={editingProduct ? getCurrentPrice(editingProduct.id) : null}
          onSave={handlePriceSaved}
        />
      </div>
    </TooltipProvider>
  )
}