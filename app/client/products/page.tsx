'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/components/products/product-card'
import { ProductTable } from '@/components/products/product-table'
import { DataTableSkeleton } from '@/components/products/data-table-skeleton'
import { PriceEditDialog } from '@/components/products/price-edit-dialog'
import { ProductSpecificationsDialog } from '@/components/products/product-specifications-dialog'
import { Product } from '@/lib/models/product'
import { ClientPrice } from '@/lib/models/client-price'
import { Grid, List } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'

export default function ClientProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [clientPrices, setClientPrices] = useState<ClientPrice[]>([])
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    fetchProducts()
    fetchClientPrices()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      const data = await response.json()
      
      // Filter only active products for clients
      const activeProducts = (data.products || []).filter((p: Product) => p.is_active)
      setProducts(activeProducts)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
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
    setViewingProduct(product)
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
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.code.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="px-4 lg:px-6 pb-4">
          <h1 className="text-2xl font-bold">Product Catalog</h1>
          <p className="text-muted-foreground">
            Browse available products and view your custom pricing
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
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <p className="text-muted-foreground">
          Browse available products and view your custom pricing
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Available Products</CardTitle>
                <CardDescription>
                  {filteredProducts.length} products available for ordering
                </CardDescription>
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
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No products found matching your search' : 'No products available at the moment'}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <ProductTable
                products={filteredProducts}
                onEdit={handleEditPrice}
              />
            )}
          </CardContent>
        </Card>

        <PriceEditDialog
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
          currentPrice={editingProduct ? getCurrentPrice(editingProduct.id) : null}
          onSave={handlePriceSaved}
        />

        <ProductSpecificationsDialog
          product={viewingProduct}
          open={!!viewingProduct}
          onOpenChange={(open) => !open && setViewingProduct(null)}
        />
      </div>
    </div>
  )
}