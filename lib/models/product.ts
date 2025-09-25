import { z } from 'zod'
import type { Tables } from '@/lib/database.types'

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Product name is required'),
  code: z.string().min(1, 'Product code is required').regex(/^[A-Z0-9-]+$/, 'Product code must be uppercase alphanumeric with hyphens'),
  base_price_usd: z.number().positive('Price must be positive'),
  category_id: z.string().uuid().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

// Export lowercase alias for backward compatibility
export const productSchema = ProductSchema

export const ProductSpecificationSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  spherical_range: z.string().nullable().optional(),
  cylindrical_range: z.string().nullable().optional(),
  materials: z.array(z.string()).nullable().optional(),
  diameters: z.array(z.string()).nullable().optional(),
  delivery_time: z.string().nullable().optional(),
  additional_specs: z.record(z.any()).nullable().optional(),
})

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  specifications: ProductSpecificationSchema.omit({
    id: true,
    product_id: true
  }).optional(),
})

export const UpdateProductSchema = ProductSchema.partial().omit({
  id: true,
  created_at: true,
})

export type Product = Tables<'products'>
export type ProductSpecification = Tables<'product_specifications'>
export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>