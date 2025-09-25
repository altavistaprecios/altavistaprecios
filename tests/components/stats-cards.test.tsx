import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatsCards } from '@/components/dashboard/stats-cards'

// Mock the queries
vi.mock('@/lib/queries/use-products', () => ({
  useProducts: vi.fn(() => ({
    data: [
      { id: '1', is_active: true },
      { id: '2', is_active: true },
      { id: '3', is_active: false }
    ],
    isLoading: false
  })),
  useProductCategories: vi.fn(() => ({
    data: [
      { id: 'cat-1', name: 'Lenses' },
      { id: 'cat-2', name: 'Coatings' }
    ],
    isLoading: false
  }))
}))

vi.mock('@/lib/queries/use-pricing', () => ({
  useClientPrices: vi.fn(() => ({
    data: [
      { discount_percentage: 10 },
      { discount_percentage: 15 },
      { discount_percentage: 20 }
    ],
    isLoading: false
  })),
  usePriceHistory: vi.fn(() => ({
    data: [
      { created_at: new Date().toISOString() },
      { created_at: new Date().toISOString() }
    ],
    isLoading: false
  }))
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          count: vi.fn(() => Promise.resolve({
            count: 5,
            error: null
          }))
        }))
      }))
    }))
  }))
}))

describe('Dashboard Stats Cards', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
  })

  it('should display total products count', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <StatsCards />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const card = screen.getByTestId('stats-total-products')
      expect(card).toHaveTextContent('Total Products')
      expect(card).toHaveTextContent('2') // 2 active products
      expect(card).toHaveTextContent('Active in catalog')
    })
  })

  it('should display B2B clients count', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <StatsCards />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const card = screen.getByTestId('stats-b2b-clients')
      expect(card).toHaveTextContent('B2B Clients')
      expect(card).toHaveTextContent('5') // From mock
      expect(card).toHaveTextContent('Registered clients')
    })
  })

  it('should calculate and display average discount', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <StatsCards />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const card = screen.getByTestId('stats-average-discount')
      expect(card).toHaveTextContent('Average Discount')
      expect(card).toHaveTextContent('15.0%') // Average of 10, 15, 20
      expect(card).toHaveTextContent('Client pricing benefit')
    })
  })

  it('should display recent price changes', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <StatsCards />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const card = screen.getByTestId('stats-recent-changes')
      expect(card).toHaveTextContent('Recent Changes')
      expect(card).toHaveTextContent('2') // 2 price history items
      expect(card).toHaveTextContent('This week')
      expect(card).toHaveTextContent('Price updates')
    })
  })

  it('should show product categories count', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <StatsCards />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const card = screen.getByTestId('stats-categories')
      expect(card).toHaveTextContent('Product Categories')
      expect(card).toHaveTextContent('2') // 2 categories
      expect(card).toHaveTextContent('Lenses, Coatings')
    })
  })

  it('should show loading state while fetching data', () => {
    const { useProducts } = vi.mocked(await import('@/lib/queries/use-products'))
    useProducts.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <StatsCards />
      </QueryClientProvider>
    )

    expect(screen.getAllByTestId('stats-skeleton')).toHaveLength(4)
  })

  it('should handle error states gracefully', async () => {
    const { useProducts } = vi.mocked(await import('@/lib/queries/use-products'))
    useProducts.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch')
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <StatsCards />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const card = screen.getByTestId('stats-total-products')
      expect(card).toHaveTextContent('--')
    })
  })

  it('should update counts when data changes', async () => {
    const { useProducts } = vi.mocked(await import('@/lib/queries/use-products'))
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <StatsCards />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('stats-total-products')).toHaveTextContent('2')
    })

    // Update mock to return more products
    useProducts.mockReturnValueOnce({
      data: [
        { id: '1', is_active: true },
        { id: '2', is_active: true },
        { id: '3', is_active: true },
        { id: '4', is_active: true }
      ],
      isLoading: false
    } as any)

    rerender(
      <QueryClientProvider client={queryClient}>
        <StatsCards />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('stats-total-products')).toHaveTextContent('4')
    })
  })
})