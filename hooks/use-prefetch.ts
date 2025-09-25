'use client'

import { useQueryClient } from '@tanstack/react-query'
import { productKeys } from './use-products'
import { categoryKeys } from './use-categories'

export function usePrefetchData() {
  const queryClient = useQueryClient()

  const prefetchProducts = async () => {
    await queryClient.prefetchQuery({
      queryKey: productKeys.lists(),
      queryFn: async () => {
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        return data.products
      },
      staleTime: 60 * 1000, // 1 minute
    })
  }

  const prefetchCategories = async () => {
    await queryClient.prefetchQuery({
      queryKey: categoryKeys.lists(),
      queryFn: async () => {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('Failed to fetch categories')
        const data = await response.json()
        return data.categories || []
      },
      staleTime: 60 * 1000, // 1 minute
    })
  }

  const prefetchAll = async () => {
    await Promise.all([prefetchProducts(), prefetchCategories()])
  }

  return { prefetchProducts, prefetchCategories, prefetchAll }
}