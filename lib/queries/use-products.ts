import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useProductStore } from '@/lib/stores/product-store'
import type { Product } from '@/lib/models/product'
import type { ProductCategory } from '@/lib/models/product-category'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  categories: ['categories'] as const,
}

export function useProducts(filters?: { categoryId?: string; isActive?: boolean }) {
  const setProducts = useProductStore((state) => state.setProducts)
  const setLoading = useProductStore((state) => state.setLoading)
  const setError = useProductStore((state) => state.setError)

  return useQuery({
    queryKey: productKeys.list(filters || {}),
    queryFn: async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        let query = supabase.from('products').select(`
          *,
          product_categories (*)
        `)

        if (filters?.categoryId) {
          query = query.eq('category_id', filters.categoryId)
        }
        if (filters?.isActive !== undefined) {
          query = query.eq('is_active', filters.isActive)
        }

        const { data, error } = await query.order('name')

        if (error) throw error

        const products = (data || []) as Product[]
        setProducts(products)
        setError(null)
        return products
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch products')
        throw error
      } finally {
        setLoading(false)
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useProduct(id: string) {
  const setSelectedProduct = useProductStore((state) => state.setSelectedProduct)

  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (*),
          product_specifications (*),
          product_treatments (
            *,
            treatments (*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      const product = data as Product
      setSelectedProduct(product)
      return product
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useProductCategories() {
  const setCategories = useProductStore((state) => state.setCategories)

  return useQuery({
    queryKey: productKeys.categories,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('display_order')

      if (error) throw error

      const categories = (data || []) as ProductCategory[]
      setCategories(categories)
      return categories
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const addProduct = useProductStore((state) => state.addProduct)

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (error) throw error
      return data as Product
    },
    onSuccess: (data) => {
      addProduct(data)
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const updateProduct = useProductStore((state) => state.updateProduct)

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Product
    },
    onSuccess: (data) => {
      updateProduct(data.id, data)
      queryClient.invalidateQueries({ queryKey: productKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const deleteProduct = useProductStore((state) => state.deleteProduct)

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: (id) => {
      deleteProduct(id)
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}