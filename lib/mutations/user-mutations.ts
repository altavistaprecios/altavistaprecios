import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/user-store'
import type { User } from '@/lib/models/user'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  current: () => [...userKeys.all, 'current'] as const,
}

export function useInviteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, role = 'client' }: { email: string; role?: 'admin' | 'client' }) => {
      const response = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send invitation')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  const updateUserRole = useUserStore((state) => state.updateUserRole)

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'client' }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data as User
    },
    onSuccess: (data) => {
      // Update current user if it's the same user
      const currentUser = useUserStore.getState().currentUser
      if (currentUser?.id === data.id) {
        updateUserRole(data.role)
      }
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data as User
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useReactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data as User
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send password reset')
      }

      return response.json()
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setCurrentUser = useUserStore((state) => state.setCurrentUser)

  return useMutation({
    mutationFn: async (updates: Partial<Pick<User, 'email'>>) => {
      const supabase = createClient()

      // Get current user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) throw new Error('Not authenticated')

      // Update user profile
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', authUser.id)
        .select()
        .single()

      if (error) throw error

      // Update auth email if changed
      if (updates.email && updates.email !== authUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: updates.email,
        })
        if (emailError) throw emailError
      }

      return data as User
    },
    onSuccess: (data) => {
      setCurrentUser(data)
      queryClient.invalidateQueries({ queryKey: userKeys.current() })
    },
  })
}

export function useBulkInviteClients() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (emails: string[]) => {
      const results = await Promise.all(
        emails.map(async (email) => {
          try {
            const response = await fetch('/api/auth/invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, role: 'client' }),
            })

            if (!response.ok) {
              const error = await response.json()
              return { email, success: false, error: error.message }
            }

            return { email, success: true }
          } catch (error) {
            return {
              email,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            }
          }
        })
      )

      const failed = results.filter(r => !r.success)
      if (failed.length === results.length) {
        throw new Error('All invitations failed')
      }

      return {
        successful: results.filter(r => r.success).length,
        failed: failed.length,
        results,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}