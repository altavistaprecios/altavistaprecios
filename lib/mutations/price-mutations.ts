import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { pricingKeys } from '@/lib/queries/use-pricing'
import type { ClientPrice } from '@/lib/models/client-price'

export function useOptimisticPriceUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      clientId,
      customPrice,
      discountPercentage,
    }: {
      productId: string
      clientId: string
      customPrice: number
      discountPercentage: number
    }) => {
      const supabase = createClient()

      // Check if price exists
      const { data: existing } = await supabase
        .from('client_prices')
        .select('id')
        .eq('product_id', productId)
        .eq('client_id', clientId)
        .maybeSingle()

      const priceData = {
        product_id: productId,
        client_id: clientId,
        custom_price_usd: customPrice,
        discount_percentage: discountPercentage,
      }

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('client_prices')
          .update(priceData)
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        return data as ClientPrice
      } else {
        // Create new
        const { data, error } = await supabase
          .from('client_prices')
          .insert(priceData)
          .select()
          .single()

        if (error) throw error
        return data as ClientPrice
      }
    },
    onMutate: async ({ productId, clientId, customPrice, discountPercentage }) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({
        queryKey: pricingKeys.productPrice(productId, clientId),
      })
      await queryClient.cancelQueries({
        queryKey: pricingKeys.clientPrices(clientId),
      })

      // Snapshot previous values
      const previousPrice = queryClient.getQueryData<ClientPrice | null>(
        pricingKeys.productPrice(productId, clientId)
      )
      const previousPrices = queryClient.getQueryData<ClientPrice[]>(
        pricingKeys.clientPrices(clientId)
      )

      // Optimistically update the single price
      const optimisticPrice: Partial<ClientPrice> = {
        product_id: productId,
        client_id: clientId,
        custom_price_usd: customPrice,
        discount_percentage: discountPercentage,
      }

      queryClient.setQueryData<ClientPrice | null>(
        pricingKeys.productPrice(productId, clientId),
        (old) => ({
          ...old,
          ...optimisticPrice,
        } as ClientPrice)
      )

      // Optimistically update the list
      if (previousPrices) {
        queryClient.setQueryData<ClientPrice[]>(
          pricingKeys.clientPrices(clientId),
          (old) => {
            if (!old) return []
            const index = old.findIndex(
              (p) => p.product_id === productId && p.client_id === clientId
            )
            if (index >= 0) {
              const updated = [...old]
              updated[index] = { ...updated[index], ...optimisticPrice }
              return updated
            } else {
              return [...old, optimisticPrice as ClientPrice]
            }
          }
        )
      }

      // Return context for rollback
      return { previousPrice, previousPrices }
    },
    onError: (err, { productId, clientId }, context) => {
      // Rollback on error
      if (context?.previousPrice !== undefined) {
        queryClient.setQueryData(
          pricingKeys.productPrice(productId, clientId),
          context.previousPrice
        )
      }
      if (context?.previousPrices) {
        queryClient.setQueryData(
          pricingKeys.clientPrices(clientId),
          context.previousPrices
        )
      }
    },
    onSettled: (data, error, { productId, clientId }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({
        queryKey: pricingKeys.productPrice(productId, clientId),
      })
      queryClient.invalidateQueries({
        queryKey: pricingKeys.clientPrices(clientId),
      })
      queryClient.invalidateQueries({
        queryKey: pricingKeys.history(),
      })
    },
  })
}

export function useOptimisticBulkPriceUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      updates: Array<{
        productId: string
        clientId: string
        customPrice: number
        discountPercentage: number
      }>
    ) => {
      const supabase = createClient()

      const results = await Promise.all(
        updates.map(async ({ productId, clientId, customPrice, discountPercentage }) => {
          // Check if price exists
          const { data: existing } = await supabase
            .from('client_prices')
            .select('id')
            .eq('product_id', productId)
            .eq('client_id', clientId)
            .maybeSingle()

          const priceData = {
            product_id: productId,
            client_id: clientId,
            custom_price_usd: customPrice,
            discount_percentage: discountPercentage,
          }

          if (existing) {
            return supabase
              .from('client_prices')
              .update(priceData)
              .eq('id', existing.id)
              .select()
              .single()
          } else {
            return supabase
              .from('client_prices')
              .insert(priceData)
              .select()
              .single()
          }
        })
      )

      // Check for errors
      const errors = results.filter((r) => r.error)
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} prices`)
      }

      return results.map((r) => r.data as ClientPrice)
    },
    onMutate: async (updates) => {
      // Cancel queries for all affected clients
      const clientIds = [...new Set(updates.map((u) => u.clientId))]
      await Promise.all(
        clientIds.map((clientId) =>
          queryClient.cancelQueries({
            queryKey: pricingKeys.clientPrices(clientId),
          })
        )
      )

      // Store previous values
      const previousData = clientIds.reduce((acc, clientId) => {
        acc[clientId] = queryClient.getQueryData<ClientPrice[]>(
          pricingKeys.clientPrices(clientId)
        )
        return acc
      }, {} as Record<string, ClientPrice[] | undefined>)

      // Optimistic update for each client
      updates.forEach(({ productId, clientId, customPrice, discountPercentage }) => {
        queryClient.setQueryData<ClientPrice[]>(
          pricingKeys.clientPrices(clientId),
          (old) => {
            if (!old) return []
            const index = old.findIndex(
              (p) => p.product_id === productId && p.client_id === clientId
            )
            const optimisticPrice: Partial<ClientPrice> = {
              product_id: productId,
              client_id: clientId,
              custom_price_usd: customPrice,
              discount_percentage: discountPercentage,
            }

            if (index >= 0) {
              const updated = [...old]
              updated[index] = { ...updated[index], ...optimisticPrice }
              return updated
            } else {
              return [...old, optimisticPrice as ClientPrice]
            }
          }
        )
      })

      return { previousData }
    },
    onError: (err, updates, context) => {
      // Rollback all changes
      if (context?.previousData) {
        Object.entries(context.previousData).forEach(([clientId, data]) => {
          if (data) {
            queryClient.setQueryData(pricingKeys.clientPrices(clientId), data)
          }
        })
      }
    },
    onSettled: (data, error, updates) => {
      // Invalidate all affected queries
      const clientIds = [...new Set(updates.map((u) => u.clientId))]
      clientIds.forEach((clientId) => {
        queryClient.invalidateQueries({
          queryKey: pricingKeys.clientPrices(clientId),
        })
      })
      queryClient.invalidateQueries({
        queryKey: pricingKeys.history(),
      })
    },
  })
}

export function useOptimisticPriceDelete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, clientId, productId }: { id: string; clientId: string; productId: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('client_prices').delete().eq('id', id)

      if (error) throw error
      return { id, clientId, productId }
    },
    onMutate: async ({ id, clientId, productId }) => {
      // Cancel queries
      await queryClient.cancelQueries({
        queryKey: pricingKeys.clientPrices(clientId),
      })
      await queryClient.cancelQueries({
        queryKey: pricingKeys.productPrice(productId, clientId),
      })

      // Snapshot previous values
      const previousPrices = queryClient.getQueryData<ClientPrice[]>(
        pricingKeys.clientPrices(clientId)
      )
      const previousPrice = queryClient.getQueryData<ClientPrice | null>(
        pricingKeys.productPrice(productId, clientId)
      )

      // Optimistically remove from list
      queryClient.setQueryData<ClientPrice[]>(
        pricingKeys.clientPrices(clientId),
        (old) => (old || []).filter((p) => p.id !== id)
      )

      // Optimistically set single price to null
      queryClient.setQueryData<ClientPrice | null>(
        pricingKeys.productPrice(productId, clientId),
        null
      )

      return { previousPrices, previousPrice }
    },
    onError: (err, { clientId, productId }, context) => {
      // Rollback
      if (context?.previousPrices) {
        queryClient.setQueryData(
          pricingKeys.clientPrices(clientId),
          context.previousPrices
        )
      }
      if (context?.previousPrice !== undefined) {
        queryClient.setQueryData(
          pricingKeys.productPrice(productId, clientId),
          context.previousPrice
        )
      }
    },
    onSettled: (data, error, { clientId, productId }) => {
      // Refetch
      queryClient.invalidateQueries({
        queryKey: pricingKeys.clientPrices(clientId),
      })
      queryClient.invalidateQueries({
        queryKey: pricingKeys.productPrice(productId, clientId),
      })
      queryClient.invalidateQueries({
        queryKey: pricingKeys.history(),
      })
    },
  })
}