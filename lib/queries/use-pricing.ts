import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ClientPrice } from '@/lib/models/client-price'
import type { PriceHistory } from '@/lib/models/price-history'

export const pricingKeys = {
  all: ['pricing'] as const,
  clientPrices: (clientId?: string) => [...pricingKeys.all, 'client', clientId || 'all'] as const,
  productPrice: (productId: string, clientId: string) =>
    [...pricingKeys.all, 'product', productId, 'client', clientId] as const,
  history: (filters?: { productId?: string; clientId?: string }) =>
    [...pricingKeys.all, 'history', filters || {}] as const,
}

export function useClientPrices(clientId?: string) {
  return useQuery({
    queryKey: pricingKeys.clientPrices(clientId),
    queryFn: async () => {
      const supabase = createClient()
      let query = supabase
        .from('client_prices')
        .select(`
          *,
          products (*),
          users (*)
        `)

      if (clientId) {
        query = query.eq('client_id', clientId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as ClientPrice[]
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  })
}

export function useProductClientPrice(productId: string, clientId: string) {
  return useQuery({
    queryKey: pricingKeys.productPrice(productId, clientId),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('client_prices')
        .select('*')
        .eq('product_id', productId)
        .eq('client_id', clientId)
        .maybeSingle()

      if (error) throw error
      return data as ClientPrice | null
    },
    enabled: !!productId && !!clientId,
  })
}

export function usePriceHistory(filters?: { productId?: string; clientId?: string; limit?: number }) {
  return useQuery({
    queryKey: pricingKeys.history(filters),
    queryFn: async () => {
      const supabase = createClient()
      let query = supabase
        .from('price_history')
        .select(`
          *,
          products (*),
          users (*)
        `)

      if (filters?.productId) {
        query = query.eq('product_id', filters.productId)
      }
      if (filters?.clientId) {
        query = query.eq('changed_by', filters.clientId)
      }

      query = query.order('created_at', { ascending: false })

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as PriceHistory[]
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useCreateClientPrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (price: Omit<ClientPrice, 'id' | 'created_at' | 'updated_at'>) => {
      const supabase = createClient()

      // First, check if a price already exists for this client-product combo
      const { data: existing } = await supabase
        .from('client_prices')
        .select('id')
        .eq('product_id', price.product_id)
        .eq('client_id', price.client_id)
        .maybeSingle()

      if (existing) {
        // Update existing price
        const { data, error } = await supabase
          .from('client_prices')
          .update({
            custom_price_usd: price.custom_price_usd,
            discount_percentage: price.discount_percentage,
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        return data as ClientPrice
      } else {
        // Create new price
        const { data, error } = await supabase
          .from('client_prices')
          .insert(price)
          .select()
          .single()

        if (error) throw error
        return data as ClientPrice
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.clientPrices(data.client_id) })
      queryClient.invalidateQueries({
        queryKey: pricingKeys.productPrice(data.product_id, data.client_id)
      })
      // Also log to price history
      queryClient.invalidateQueries({ queryKey: pricingKeys.history() })
    },
  })
}

export function useUpdateClientPrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ClientPrice> }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('client_prices')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as ClientPrice
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.clientPrices(data.client_id) })
      queryClient.invalidateQueries({
        queryKey: pricingKeys.productPrice(data.product_id, data.client_id)
      })
      queryClient.invalidateQueries({ queryKey: pricingKeys.history() })
    },
  })
}

export function useDeleteClientPrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('client_prices')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { id, clientId }
    },
    onSuccess: ({ clientId }) => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.clientPrices(clientId) })
      queryClient.invalidateQueries({ queryKey: pricingKeys.history() })
    },
  })
}

export function useBulkUpdatePrices() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Array<Omit<ClientPrice, 'id' | 'created_at' | 'updated_at'>>) => {
      const supabase = createClient()

      // Process each update
      const results = await Promise.all(
        updates.map(async (price) => {
          // Check if price exists
          const { data: existing } = await supabase
            .from('client_prices')
            .select('id')
            .eq('product_id', price.product_id)
            .eq('client_id', price.client_id)
            .maybeSingle()

          if (existing) {
            // Update
            return supabase
              .from('client_prices')
              .update({
                custom_price_usd: price.custom_price_usd,
                discount_percentage: price.discount_percentage,
              })
              .eq('id', existing.id)
              .select()
              .single()
          } else {
            // Insert
            return supabase
              .from('client_prices')
              .insert(price)
              .select()
              .single()
          }
        })
      )

      // Check for errors
      const errors = results.filter(r => r.error)
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} prices`)
      }

      return results.map(r => r.data as ClientPrice)
    },
    onSuccess: (data) => {
      // Invalidate all relevant queries
      const uniqueClientIds = [...new Set(data.map(d => d.client_id))]
      uniqueClientIds.forEach(clientId => {
        queryClient.invalidateQueries({ queryKey: pricingKeys.clientPrices(clientId) })
      })
      queryClient.invalidateQueries({ queryKey: pricingKeys.history() })
    },
  })
}