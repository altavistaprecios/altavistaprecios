import { z } from 'zod'
import type { Tables } from '@/lib/database.types'

export const ClientPriceSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  product_id: z.string().uuid(),
  custom_price_usd: z.number().positive('Custom price must be positive'),
  markup_percentage: z.number().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export const CreateClientPriceSchema = ClientPriceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).refine(
  (data) => {
    if (data.markup_percentage !== null && data.markup_percentage !== undefined) {
      return data.markup_percentage >= -50 && data.markup_percentage <= 500
    }
    return true
  },
  {
    message: 'Markup percentage must be between -50% and 500%',
    path: ['markup_percentage'],
  }
)

export const UpdateClientPriceSchema = ClientPriceSchema.partial().omit({
  id: true,
  user_id: true,
  product_id: true,
  created_at: true,
})

export const BulkClientPriceSchema = z.object({
  prices: z.array(CreateClientPriceSchema),
})

export type ClientPrice = Tables<'client_prices'>
export type CreateClientPriceInput = z.infer<typeof CreateClientPriceSchema>
export type UpdateClientPriceInput = z.infer<typeof UpdateClientPriceSchema>
export type BulkClientPriceInput = z.infer<typeof BulkClientPriceSchema>