'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClientPrice, clientPriceSchema } from '@/lib/models/client-price'
import { Product } from '@/lib/models/product'

interface PricingFormProps {
  price?: Partial<ClientPrice>
  products: Product[]
  onSubmit: (data: ClientPrice) => Promise<void>
  onCancel: () => void
  clientId?: string
}

export function PricingForm({
  price,
  products,
  onSubmit,
  onCancel,
  clientId
}: PricingFormProps) {
  const form = useForm<ClientPrice>({
    resolver: zodResolver(clientPriceSchema),
    defaultValues: {
      product_id: price?.product_id || '',
      client_id: price?.client_id || clientId || '',
      custom_price: price?.custom_price || 0,
      discount_percentage: price?.discount_percentage || 0,
      effective_from: price?.effective_from || new Date().toISOString().split('T')[0],
      effective_to: price?.effective_to,
      notes: price?.notes || '',
    },
  })

  const selectedProduct = products.find(p => p.id === form.watch('product_id'))
  const customPrice = form.watch('custom_price')
  const discountPercentage = form.watch('discount_percentage')

  const calculateFinalPrice = () => {
    if (!selectedProduct) return 0
    if (customPrice > 0) return customPrice
    const discount = selectedProduct.base_price * (discountPercentage / 100)
    return selectedProduct.base_price - discount
  }

  const handleSubmit = async (data: ClientPrice) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Failed to save pricing:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="product_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id!}>
                      {product.code} - {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the product to set pricing for
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedProduct && (
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-medium">Product Details</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Base Price:</span>
              <span className="font-medium">${selectedProduct.base_price.toFixed(2)}</span>
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{selectedProduct.category}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="custom_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value) || 0)
                      if (parseFloat(e.target.value) > 0) {
                        form.setValue('discount_percentage', 0)
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Override base price (leave 0 to use discount)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Percentage (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value) || 0)
                      if (parseFloat(e.target.value) > 0) {
                        form.setValue('custom_price', 0)
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Apply percentage discount to base price
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedProduct && (
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Final Price:</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 dark:text-emerald-500 dark:text-emerald-400">
                ${calculateFinalPrice().toFixed(2)}
              </span>
            </div>
            {discountPercentage > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {discountPercentage}% discount applied
              </p>
            )}
            {customPrice > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Custom price override
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="effective_from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Effective From</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="effective_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Effective To (Optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  Leave empty for indefinite pricing
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Add any notes about this pricing..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {price?.id ? 'Update Pricing' : 'Set Pricing'}
          </Button>
        </div>
      </form>
    </Form>
  )
}