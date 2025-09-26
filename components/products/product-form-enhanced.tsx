'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Product, productSchema } from '@/lib/models/product'
import { ProductCategory } from '@/lib/models/product-category'
import { useState, useEffect } from 'react'
import { z } from 'zod'

// Extended schema for products with specifications
const extendedProductSchema = productSchema.extend({
  specifications: z.object({
    spherical_range: z.string().optional(),
    cylindrical_range: z.string().optional(),
    spherical_min: z.number().optional(),
    spherical_max: z.number().optional(),
    cylindrical_min: z.number().optional(),
    cylindrical_max: z.number().optional(),
    bases: z.string().optional(),
    diameter: z.string().optional(),
    materials: z.array(z.string()).optional(),
    treatment: z.string().optional(),
    features: z.array(z.string()).optional(),
    delivery_time: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['stock', 'laboratory']).optional(),
  }).optional()
})

type ExtendedProduct = z.infer<typeof extendedProductSchema>

interface ProductFormEnhancedProps {
  product?: Partial<ExtendedProduct>
  categories: ProductCategory[]
  onSubmit: (data: ExtendedProduct) => Promise<void>
  onCancel: () => void
}

// Pre-defined options for Future-X products
const treatmentOptions = [
  { value: 'steel', label: 'Steel (Super hidrofóbico, oleofóbico, antiestático)' },
  { value: 'blusteel', label: 'BluSteel (Protección luz azul 380-500nm)' },
  { value: 'paladin', label: 'Paladin (AR cerámico, hidrofílico, antiempañante)' },
  { value: 'x-treme', label: 'X-Treme (Atoric asphericity)' },
]

const materialOptions = [
  { value: '1.56', label: '1.56' },
  { value: '1.61', label: '1.61' },
  { value: '1.67', label: '1.67' },
]

const baseOptions = [
  '0.50', '2.00', '3.50', '4.00', '6.00', '8.00', '9.00', '10.00'
]

const featureOptions = [
  'Resistente', 'Antirreflejo', 'Protección UV', '2x Resistente',
  'Asférico', 'Mayor campo visual', 'Blue Light', 'Anti-fatigue',
  'Clear Vision', 'AR Cerámico', 'Antiempañante', '2x Rayado',
  'Alta graduación', 'Asférico atórico', 'Espesor optimizado',
  'Laboratorio', 'Múltiples índices', 'Amplio rango', 'Alta positiva'
]

export function ProductFormEnhanced({
  product,
  categories,
  onSubmit,
  onCancel
}: ProductFormEnhancedProps) {
  const [showSpecifications, setShowSpecifications] = useState(false)
  const [isFutureX, setIsFutureX] = useState(false)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    product?.specifications?.features || []
  )
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    product?.specifications?.materials || []
  )
  const [selectedBases, setSelectedBases] = useState<string[]>([])

  const form = useForm<ExtendedProduct>({
    resolver: zodResolver(extendedProductSchema),
    defaultValues: {
      code: product?.code || '',
      name: product?.name || '',
      category_id: product?.category_id || '',
      base_price_usd: product?.base_price_usd || 0,
      is_active: product?.is_active ?? true,
      specifications: {
        spherical_range: product?.specifications?.spherical_range || '',
        cylindrical_range: product?.specifications?.cylindrical_range || '',
        spherical_min: product?.specifications?.spherical_min || -4,
        spherical_max: product?.specifications?.spherical_max || 4,
        cylindrical_min: product?.specifications?.cylindrical_min || -2,
        cylindrical_max: product?.specifications?.cylindrical_max || 0,
        bases: product?.specifications?.bases || '',
        diameter: product?.specifications?.diameter || '70mm',
        materials: product?.specifications?.materials || [],
        treatment: product?.specifications?.treatment || '',
        features: product?.specifications?.features || [],
        delivery_time: product?.specifications?.delivery_time || '',
        description: product?.specifications?.description || '',
        type: product?.specifications?.type || 'stock',
      }
    },
  })

  const categoryId = form.watch('category_id')

  useEffect(() => {
    const category = categories.find(c => c.id === categoryId)
    const isFutureXCategory = category?.slug?.includes('future-x') || false
    setIsFutureX(isFutureXCategory)
    setShowSpecifications(isFutureXCategory)
  }, [categoryId, categories])

  useEffect(() => {
    if (product?.specifications?.bases) {
      setSelectedBases(product.specifications.bases.split('/'))
    }
  }, [product])

  const handleSubmit = async (data: ExtendedProduct) => {
    try {
      // Format specifications data
      if (isFutureX && data.specifications) {
        // Build ranges from min/max values
        const sphMin = data.specifications.spherical_min || -4
        const sphMax = data.specifications.spherical_max || 4
        const cylMin = data.specifications.cylindrical_min || -2
        const cylMax = data.specifications.cylindrical_max || 0

        data.specifications.spherical_range = `Sph ${sphMin > 0 ? '+' : ''}${sphMin.toFixed(2)} to ${sphMax > 0 ? '+' : ''}${sphMax.toFixed(2)}`
        data.specifications.cylindrical_range = `Cyl ${cylMin.toFixed(2)}${cylMax !== cylMin ? ` to ${cylMax.toFixed(2)}` : ''}`
        data.specifications.bases = selectedBases.join('/')
        data.specifications.materials = selectedMaterials
        data.specifications.features = selectedFeatures
      } else {
        // Clear specifications if not Future-X
        data.specifications = undefined
      }

      await onSubmit(data)
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    )
  }

  const toggleBase = (base: string) => {
    setSelectedBases(prev =>
      prev.includes(base)
        ? prev.filter(b => b !== base)
        : [...prev, base]
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential product details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., FVSG2" {...field} />
                    </FormControl>
                    <FormDescription>
                      Unique identifier (e.g., FVTS, FVTG25, FVSG2)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Future-X G2 Stock" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="base_price_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? 0 : parseFloat(value))
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Standard price before client discounts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Active</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications (for Future-X products) */}
        {isFutureX && (
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setShowSpecifications(!showSpecifications)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Technical Specifications</CardTitle>
                  <CardDescription>Detailed lens specifications for Future-X products</CardDescription>
                </div>
                {showSpecifications ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>

            {showSpecifications && (
              <CardContent className="space-y-6">
                {/* Prescription Ranges */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Prescription Ranges</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Spherical Range</label>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="specifications.spherical_min"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.25"
                                  placeholder="-4.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="text-sm">to</span>
                        <FormField
                          control={form.control}
                          name="specifications.spherical_max"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.25"
                                  placeholder="+4.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Cylindrical Range</label>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="specifications.cylindrical_min"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.25"
                                  placeholder="-2.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span className="text-sm">to</span>
                        <FormField
                          control={form.control}
                          name="specifications.cylindrical_max"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.25"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Physical Properties */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Physical Properties</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="specifications.diameter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diameter</FormLabel>
                          <FormControl>
                            <Input placeholder="70mm" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specifications.type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="stock">Stock</SelectItem>
                              <SelectItem value="laboratory">Laboratory</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Base Curves */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Base Curves</h4>
                  <div className="flex flex-wrap gap-2">
                    {baseOptions.map((base) => (
                      <Badge
                        key={base}
                        variant={selectedBases.includes(base) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleBase(base)}
                      >
                        {base}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Materials</h4>
                  <div className="flex flex-wrap gap-2">
                    {materialOptions.map((material) => (
                      <Badge
                        key={material.value}
                        variant={selectedMaterials.includes(material.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleMaterial(material.value)}
                      >
                        {material.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Treatment */}
                <FormField
                  control={form.control}
                  name="specifications.treatment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select treatment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {treatmentOptions.map((treatment) => (
                            <SelectItem key={treatment.value} value={treatment.value}>
                              {treatment.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Features */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {featureOptions.map((feature) => (
                      <Badge
                        key={feature}
                        variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFeature(feature)}
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="specifications.delivery_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Time</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 24-48 hours" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specifications.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Features Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 2x más resistente a impactos, totalmente asférico"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {product?.id ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  )
}