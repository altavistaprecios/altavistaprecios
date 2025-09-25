'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Product } from '@/lib/models/product'
import { ClientPrice } from '@/lib/models/client-price'
import { toast } from 'sonner'
import { DollarSign, Percent } from 'lucide-react'

interface PriceEditDialogProps {
  open: boolean
  onClose: () => void
  product: Product | null
  currentPrice?: ClientPrice | null
  onSave?: () => void
}

export function PriceEditDialog({
  open,
  onClose,
  product,
  currentPrice,
  onSave
}: PriceEditDialogProps) {
  const [priceType, setPriceType] = useState<'custom' | 'discount'>('custom')
  const [customPrice, setCustomPrice] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product && open) {
      // Set initial values based on current price
      if (currentPrice) {
        if (currentPrice.custom_price_usd > 0) {
          setPriceType('custom')
          setCustomPrice(currentPrice.custom_price_usd.toString())
          setDiscountPercentage('')
        } else if (currentPrice.discount_percentage > 0) {
          setPriceType('discount')
          setDiscountPercentage(currentPrice.discount_percentage.toString())
          setCustomPrice('')
        }
      } else {
        // Default to base price as custom price
        setPriceType('custom')
        setCustomPrice(product.base_price_usd.toString())
        setDiscountPercentage('')
      }
    }
  }, [product, currentPrice, open])

  const handleSave = async () => {
    if (!product) return

    const price = parseFloat(customPrice)
    const discount = parseFloat(discountPercentage)

    // Validate inputs
    if (priceType === 'custom') {
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price')
        return
      }
      if (price < Number(product.base_price_usd)) {
        toast.error(`Price cannot be below base price of $${product.base_price_usd}`)
        return
      }
    } else {
      if (isNaN(discount) || discount < 0 || discount > 100) {
        toast.error('Please enter a valid discount percentage (0-100)')
        return
      }
    }

    setSaving(true)
    try {
      const body: any = { product_id: product.id }

      if (priceType === 'custom') {
        body.custom_price = price
        body.discount_percentage = 0
      } else {
        body.discount_percentage = discount
        body.custom_price = 0
      }

      // Create or update the price
      const url = currentPrice
        ? `/api/client-prices/${currentPrice.id}`
        : '/api/client-prices'

      const method = currentPrice ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save price')
      }

      toast.success('Price updated successfully')
      onSave?.()
      onClose()
    } catch (error) {
      console.error('Failed to save price:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save price')
    } finally {
      setSaving(false)
    }
  }

  const calculateFinalPrice = () => {
    if (!product) return 0

    if (priceType === 'custom') {
      const price = parseFloat(customPrice)
      return isNaN(price) ? 0 : price
    } else {
      const discount = parseFloat(discountPercentage)
      if (isNaN(discount)) return Number(product.base_price_usd)
      return Number(product.base_price_usd) * (1 - discount / 100)
    }
  }

  const calculateSavings = () => {
    if (!product) return 0
    const final = calculateFinalPrice()
    return Number(product.base_price_usd) - final
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Custom Price</DialogTitle>
          <DialogDescription>
            Set your custom pricing for {product.name} ({product.code})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Base Price:</span>
            <span className="font-semibold">${Number(product.base_price_usd).toFixed(2)}</span>
          </div>

          <RadioGroup value={priceType} onValueChange={(v) => setPriceType(v as 'custom' | 'discount')}>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="custom" id="custom" className="mt-1" />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="custom" className="font-medium cursor-pointer">
                    Set Custom Price
                  </Label>
                  {priceType === 'custom' && (
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        placeholder="Enter custom price"
                        className="pl-9"
                        step="0.01"
                        min={product.base_price_usd}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <RadioGroupItem value="discount" id="discount" className="mt-1" />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="discount" className="font-medium cursor-pointer">
                    Apply Discount Percentage
                  </Label>
                  {priceType === 'discount' && (
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        placeholder="Enter discount percentage"
                        className="pl-9"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </RadioGroup>

          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm">Your Price:</span>
              <span className="font-semibold text-lg">
                ${calculateFinalPrice().toFixed(2)}
              </span>
            </div>
            {calculateSavings() > 0 && (
              <div className="flex justify-between items-center text-emerald-600">
                <span className="text-sm">Savings:</span>
                <span className="font-medium">
                  ${calculateSavings().toFixed(2)} ({((calculateSavings() / Number(product.base_price_usd)) * 100).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Price'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}