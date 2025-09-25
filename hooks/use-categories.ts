'use client'

import { useQuery } from '@tanstack/react-query'
import { ProductCategory } from '@/lib/models/product-category'

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
}

interface CategoriesResponse {
  categories: ProductCategory[]
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const data: CategoriesResponse = await response.json()
      return data.categories || []
    },
  })
}