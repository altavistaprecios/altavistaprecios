'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/models/product'
import { ClientPrice } from '@/lib/models/client-price'
import { TrendingDown, DollarSign, Package } from 'lucide-react'
import { toast } from 'sonner'
import { DataTableShell } from '@/components/ui/data-table-shell'

interface PricingData extends ClientPrice {
  product?: Product
  final_price?: number
  savings?: number
}

export default function ClientPricingPage() {
  const [pricingData, setPricingData] = useState<PricingData[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchPricingData()
  }, [])

  const fetchPricingData = async () => {
    try {
      setLoading(true)
      const [productsRes, pricesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/client-prices'),
      ])

      const products = await productsRes.json()
      const prices = await pricesRes.json()

      // Combine product and pricing data
      const combinedData: PricingData[] = []

      if (prices.data && Array.isArray(prices.data)) {
        prices.data.forEach((price: ClientPrice) => {
          const product = products.data?.find((p: Product) => p.id === price.product_id)
          if (product) {
            const finalPrice = price.custom_price > 0
              ? price.custom_price
              : product.base_price * (1 - price.discount_percentage / 100)

            const savings = product.base_price - finalPrice

            combinedData.push({
              ...price,
              product,
              final_price: finalPrice,
              savings,
            })
          }
        })
      }

      setPricingData(combinedData)
    } catch (error) {
      console.error('Failed to fetch pricing data:', error)
      toast.error('Failed to load pricing')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalSavings = () => {
    return pricingData.reduce((total, item) => total + (item.savings || 0), 0)
  }

  const calculateAverageDiscount = () => {
    if (pricingData.length === 0) return 0
    const totalDiscount = pricingData.reduce((total, item) => {
      if (item.discount_percentage > 0) return total + item.discount_percentage
      if (item.product && item.final_price) {
        const discount = ((item.product.base_price - item.final_price) / item.product.base_price) * 100
        return total + discount
      }
      return total
    }, 0)
    return totalDiscount / pricingData.length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading pricing...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Custom Pricing</h1>
        <p className="text-muted-foreground">
          View your negotiated prices and discounts
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Prices</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pricingData.length}</div>
            <p className="text-xs text-muted-foreground">Products with special pricing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateTotalSavings().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per unit savings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Discount</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateAverageDiscount().toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>
      </div>

      <DataTableShell
        title="Product Pricing Details"
        description="Your custom pricing compared to standard rates"
        footerLeft={
          pricingData.length > 0 ? (
            <span className="text-sm text-muted-foreground">
              Showing {pricingData.length} product{pricingData.length === 1 ? '' : 's'}
            </span>
          ) : undefined
        }
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/80">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Base Price</TableHead>
              <TableHead className="text-right">Your Price</TableHead>
              <TableHead className="text-right">Discount</TableHead>
              <TableHead className="text-right">Savings</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricingData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No custom pricing configured yet
                </TableCell>
              </TableRow>
            ) : (
              pricingData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{item.product?.code}</span>
                      <p className="text-sm text-muted-foreground">
                        {item.product?.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.product?.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.product?.base_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${item.final_price?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.discount_percentage > 0 ? (
                      <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-900 dark:bg-emerald-950 dark:text-emerald-100 dark:text-emerald-200">
                        {item.discount_percentage}%
                      </Badge>
                    ) : item.custom_price > 0 ? (
                      <Badge variant="secondary">Custom</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600 dark:text-emerald-400 dark:text-emerald-500 dark:text-emerald-400">
                    ${item.savings?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTableShell>
    </div>
  )
}
