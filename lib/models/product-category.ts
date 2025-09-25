import { z } from 'zod'
import type { Tables } from '@/lib/database.types'

export const ProductCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Category slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().nullable().optional(),
  display_order: z.number().int().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export const CreateProductCategorySchema = ProductCategorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const UpdateProductCategorySchema = ProductCategorySchema.partial().omit({
  id: true,
  created_at: true,
})

export type ProductCategory = Tables<'product_categories'>
export type CreateProductCategoryInput = z.infer<typeof CreateProductCategorySchema>
export type UpdateProductCategoryInput = z.infer<typeof UpdateProductCategorySchema>