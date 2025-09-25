'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Product } from '@/lib/models/product'
import { ClientPrice } from '@/lib/models/client-price'
import { TrendingDown, DollarSign, Package, Edit2, Save, X, Percent } from 'lucide-react'
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
  const [globalAdjustment, setGlobalAdjustment] = useState('')
  const [applyingGlobal, setApplyingGlobal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    custom_price: string
    discount_percentage: string
  }>({ custom_price: '', discount_percentage: '' })
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

  const handleGlobalAdjustment = async () => {
    const percentage = parseFloat(globalAdjustment)
    if (isNaN(percentage)) {
      toast.error('Please enter a valid percentage')
      return
    }

    setApplyingGlobal(true)
    try {
      const response = await fetch('/api/client-prices/bulk-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentage }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to apply adjustment')
      }

      const action = percentage > 0 ? 'discount' : 'markup'
      toast.success(`Applied ${Math.abs(percentage)}% ${action} to all prices`)
      setGlobalAdjustment('')
      await fetchPricingData()
    } catch (error) {
      console.error('Failed to apply global adjustment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to apply adjustment')
    } finally {
      setApplyingGlobal(false)
    }
  }

  const startEditing = (item: PricingData) => {
    setEditingId(item.id)
    setEditValues({
      custom_price: item.custom_price?.toString() || item.final_price?.toString() || '',
      discount_percentage: item.discount_percentage?.toString() || '',
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditValues({ custom_price: '', discount_percentage: '' })
  }

  const savePrice = async (item: PricingData) => {
    try {
      const customPrice = parseFloat(editValues.custom_price)
      const discountPercentage = parseFloat(editValues.discount_percentage)

      if (!isNaN(customPrice) && item.product && customPrice < item.product.base_price) {
        toast.error(`Price cannot be below base price of $${item.product.base_price.toFixed(2)}`)
        return
      }

      const body: any = { product_id: item.product_id }

      if (!isNaN(customPrice)) {
        body.custom_price = customPrice
        body.discount_percentage = 0
      } else if (!isNaN(discountPercentage)) {
        body.discount_percentage = discountPercentage
        body.custom_price = 0
      } else {
        toast.error('Please enter a valid price or discount')
        return
      }

      const response = await fetch(`/api/client-prices/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update price')
      }

      toast.success('Price updated successfully')
      cancelEditing()
      await fetchPricingData()
    } catch (error) {
      console.error('Failed to save price:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save price')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="px-4 lg:px-6 pb-4">
          <h1 className="text-2xl font-bold">Your Custom Pricing</h1>
          <p className="text-muted-foreground">
            View your negotiated prices and discounts
          </p>
        </div>
        <div className="flex items-center justify-center h-96 px-4 lg:px-6">
          <p className="text-muted-foreground">Loading pricing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 lg:px-6 pb-4">
        <h1 className="text-2xl font-bold">Your Custom Pricing</h1>
        <p className="text-muted-foreground">
          View your negotiated prices and discounts
        </p>
      </div>

      <div className="px-4 lg:px-6 space-y-6">

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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Global Price Adjustment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-sm">
              <Label htmlFor="global-adjustment">Bulk adjust all prices by percentage</Label>
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  <Input
                    id="global-adjustment"
                    type="number"
                    value={globalAdjustment}
                    onChange={(e) => setGlobalAdjustment(e.target.value)}
                    placeholder="e.g., -10 for 10% increase or 5 for 5% discount"
                    className="pr-8"
                  />
                  <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button
                  onClick={handleGlobalAdjustment}
                  disabled={applyingGlobal || !globalAdjustment}
                >
                  {applyingGlobal ? 'Applying...' : 'Apply to All'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Enter a negative number to increase prices (markup) or positive to decrease (discount)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

        <DataTableShell
          title="Product Pricing Details"
          description="Your custom pricing compared to standard rates. Click edit to modify individual prices."
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricingData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
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
                    {editingId === item.id ? (
                      <Input
                        type="number"
                        value={editValues.custom_price}
                        onChange={(e) => setEditValues({ ...editValues, custom_price: e.target.value })}
                        className="w-24 text-right"
                        placeholder="Price"
                      />
                    ) : (
                      `$${item.final_price?.toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <Input
                          type="number"
                          value={editValues.discount_percentage}
                          onChange={(e) => setEditValues({ ...editValues, discount_percentage: e.target.value })}
                          className="w-20 text-right"
                          placeholder="%"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    ) : (
                      item.discount_percentage > 0 ? (
                        <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-900 dark:bg-emerald-950 dark:text-emerald-100 dark:text-emerald-200">
                          {item.discount_percentage}%
                        </Badge>
                      ) : item.custom_price > 0 ? (
                        <Badge variant="secondary">Custom</Badge>
                      ) : (
                        '-'
                      )
                    )}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600 dark:text-emerald-400 dark:text-emerald-500 dark:text-emerald-400">
                    ${item.savings?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => savePrice(item)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </DataTableShell>
      </div>
    </div>
  )
}
