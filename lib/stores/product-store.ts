import { create } from 'zustand'
import type { Product } from '@/lib/models/product'
import type { ProductCategory } from '@/lib/models/product-category'

interface ProductState {
  products: Product[]
  categories: ProductCategory[]
  selectedProduct: Product | null
  isLoading: boolean
  error: string | null
  filters: {
    categoryId?: string
    isActive?: boolean
    searchQuery?: string
  }
  setProducts: (products: Product[]) => void
  setCategories: (categories: ProductCategory[]) => void
  setSelectedProduct: (product: Product | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<ProductState['filters']>) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getFilteredProducts: () => Product[]
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  filters: {},
  setProducts: (products) => set({ products, error: null }),
  setCategories: (categories) => set({ categories }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      selectedProduct:
        state.selectedProduct?.id === id
          ? { ...state.selectedProduct, ...updates }
          : state.selectedProduct,
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      selectedProduct:
        state.selectedProduct?.id === id ? null : state.selectedProduct,
    })),
  getFilteredProducts: () => {
    const { products, filters } = get()
    return products.filter((product) => {
      if (filters.categoryId && product.category_id !== filters.categoryId) {
        return false
      }
      if (filters.isActive !== undefined && product.is_active !== filters.isActive) {
        return false
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        return (
          product.name.toLowerCase().includes(query) ||
          product.code.toLowerCase().includes(query)
        )
      }
      return true
    })
  },
}))