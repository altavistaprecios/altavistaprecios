import { z } from 'zod'
import type { Tables } from '@/lib/database.types'

export const PriceHistorySchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  old_price: z.number().nullable().optional(),
  new_price: z.number().positive('New price must be positive'),
  change_type: z.enum(['admin_update', 'client_custom', 'bulk_update', 'initial']),
  changed_by: z.string().uuid().nullable().optional(),
  changed_at: z.string().datetime().optional(),
})

export const CreatePriceHistorySchema = PriceHistorySchema.omit({
  id: true,
  changed_at: true,
})

export const PriceHistoryFilterSchema = z.object({
  product_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  change_type: z.enum(['admin_update', 'client_custom', 'bulk_update', 'initial']).optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  limit: z.number().int().positive().default(100),
  offset: z.number().int().nonnegative().default(0),
})

export type PriceHistory = Tables<'price_history'>
export type CreatePriceHistoryInput = z.infer<typeof CreatePriceHistorySchema>
export type PriceHistoryFilter = z.infer<typeof PriceHistoryFilterSchema>