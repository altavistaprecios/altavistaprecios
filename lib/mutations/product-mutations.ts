import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { productKeys } from '@/lib/queries/use-products'
import { useProductStore } from '@/lib/stores/product-store'
import type { Product, ProductSpecification } from '@/lib/models/product'

interface CreateProductInput {
  product: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  specifications?: Omit<ProductSpecification, 'id' | 'product_id'>
  treatments?: string[]
}

export function useCreateProductWithDetails() {
  const queryClient = useQueryClient()
  const addProduct = useProductStore((state) => state.addProduct)

  return useMutation({
    mutationFn: async ({ product, specifications, treatments }: CreateProductInput) => {
      const supabase = createClient()

      // Start a transaction
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (productError) throw productError

      const newProduct = productData as Product

      // Add specifications if provided
      if (specifications) {
        const { error: specError } = await supabase
          .from('product_specifications')
          .insert({
            ...specifications,
            product_id: newProduct.id,
          })

        if (specError) {
          // Rollback product creation
          await supabase.from('products').delete().eq('id', newProduct.id)
          throw specError
        }
      }

      // Add treatments if provided
      if (treatments && treatments.length > 0) {
        const treatmentData = treatments.map(treatmentId => ({
          product_id: newProduct.id,
          treatment_id: treatmentId,
        }))

        const { error: treatmentError } = await supabase
          .from('product_treatments')
          .insert(treatmentData)

        if (treatmentError) {
          // Rollback
          await supabase.from('product_specifications').delete().eq('product_id', newProduct.id)
          await supabase.from('products').delete().eq('id', newProduct.id)
          throw treatmentError
        }
      }

      return newProduct
    },
    onSuccess: (data) => {
      addProduct(data)
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useUpdateProductWithDetails() {
  const queryClient = useQueryClient()
  const updateProduct = useProductStore((state) => state.updateProduct)

  return useMutation({
    mutationFn: async ({
      id,
      product,
      specifications,
      treatments,
    }: {
      id: string
      product?: Partial<Product>
      specifications?: Partial<ProductSpecification>
      treatments?: string[]
    }) => {
      const supabase = createClient()

      // Update product if changes provided
      if (product) {
        const { data, error } = await supabase
          .from('products')
          .update(product)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
      }

      // Update specifications if provided
      if (specifications) {
        const { error } = await supabase
          .from('product_specifications')
          .upsert({
            ...specifications,
            product_id: id,
          })
          .eq('product_id', id)

        if (error) throw error
      }

      // Update treatments if provided
      if (treatments !== undefined) {
        // Delete existing treatments
        await supabase.from('product_treatments').delete().eq('product_id', id)

        // Insert new treatments
        if (treatments.length > 0) {
          const treatmentData = treatments.map(treatmentId => ({
            product_id: id,
            treatment_id: treatmentId,
          }))

          const { error } = await supabase.from('product_treatments').insert(treatmentData)
          if (error) throw error
        }
      }

      // Fetch updated product with relations
      const { data: updatedProduct, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          product_specifications (*),
          product_treatments (
            *,
            treatments (*)
          )
        `)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      return updatedProduct as Product
    },
    onSuccess: (data) => {
      updateProduct(data.id, data)
      queryClient.invalidateQueries({ queryKey: productKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
    onMutate: async ({ id, product }) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) })

      // Optimistically update the store
      if (product) {
        updateProduct(id, product)
      }

      // Return context for rollback
      return { previousProduct: useProductStore.getState().products.find(p => p.id === id) }
    },
    onError: (err, { id }, context) => {
      // Rollback optimistic update
      if (context?.previousProduct) {
        updateProduct(id, context.previousProduct)
      }
    },
  })
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient()
  const store = useProductStore()

  return useMutation({
    mutationFn: async (productIds: string[]) => {
      const supabase = createClient()

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .in('id', productIds)

      if (error) throw error
      return productIds
    },
    onSuccess: (productIds) => {
      // Update store
      productIds.forEach(id => store.deleteProduct(id))

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useBulkUpdateProductPrices() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      updates: Array<{ id: string; base_price_usd: number }>
    ) => {
      const supabase = createClient()

      // Process each update
      const results = await Promise.all(
        updates.map(({ id, base_price_usd }) =>
          supabase
            .from('products')
            .update({ base_price_usd })
            .eq('id', id)
            .select()
            .single()
        )
      )

      // Check for errors
      const errors = results.filter(r => r.error)
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} product prices`)
      }

      return results.map(r => r.data as Product)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}