import { z } from 'zod'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  company_name: z.string().nullable().optional(),
  is_admin: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  company_name: z.string().min(1, 'Company name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
})

export const UpdateUserSchema = UserProfileSchema.partial().omit({
  id: true,
  created_at: true,
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const UpdatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type UserProfile = z.infer<typeof UserProfileSchema>
export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type User = SupabaseUser & {
  user_metadata?: {
    company_name?: string
    is_admin?: boolean
  }
}