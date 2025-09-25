import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminDashboardPage from '@/app/(dashboard)/admin/page'

// Mock the Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            {
              id: '1',
              code: 'LENS-001',
              name: 'Progressive Lens',
              base_price_usd: 150.00,
              category_id: 'cat-1',
              is_active: true,
              product_categories: {
                id: 'cat-1',
                name: 'Lenses',
                slug: 'lenses'
              }
            },
            {
              id: '2',
              code: 'COAT-001',
              name: 'Anti-Reflective Coating',
              base_price_usd: 75.00,
              category_id: 'cat-2',
              is_active: true,
              product_categories: {
                id: 'cat-2',
                name: 'Coatings',
                slug: 'coatings'
              }
            }
          ],
          error: null
        })),
        eq: vi.fn().mockReturnThis(),
        count: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({
          data: { count: 2 },
          error: null
        }))
      }))
    }))
  }))
}))

describe('Admin Dashboard Data Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
  })

  it('should display products table instead of documents table', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminDashboardPage />
      </QueryClientProvider>
    )

    // Should NOT display document-related headers
    await waitFor(() => {
      expect(screen.queryByText('Section Type')).not.toBeInTheDocument()
      expect(screen.queryByText('Reviewer')).not.toBeInTheDocument()
    })

    // Should display product-related headers
    await waitFor(() => {
      expect(screen.getByText('Product Code')).toBeInTheDocument()
      expect(screen.getByText('Product Name')).toBeInTheDocument()
      expect(screen.getByText('Base Price')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })
  })

  it('should display actual product data in the table', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminDashboardPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('LENS-001')).toBeInTheDocument()
      expect(screen.getByText('Progressive Lens')).toBeInTheDocument()
      expect(screen.getByText('$150.00')).toBeInTheDocument()
      expect(screen.getByText('Lenses')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('COAT-001')).toBeInTheDocument()
      expect(screen.getByText('Anti-Reflective Coating')).toBeInTheDocument()
      expect(screen.getByText('$75.00')).toBeInTheDocument()
      expect(screen.getByText('Coatings')).toBeInTheDocument()
    })
  })

  it('should show correct product count in stats card', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminDashboardPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const totalProductsCard = screen.getByText('Total Products').closest('div')
      expect(totalProductsCard).toHaveTextContent('2')
    })
  })

  it('should show B2B clients count from database', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminDashboardPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const clientsCard = screen.getByText('B2B Clients').closest('div')
      expect(clientsCard).not.toHaveTextContent('0')
    })
  })

  it('should have action buttons for products', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminDashboardPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Product')).toBeInTheDocument()
      expect(screen.getByText('Import Products')).toBeInTheDocument()
      expect(screen.getByText('Export Catalog')).toBeInTheDocument()
    })
  })

  it('should display pricing chart with actual data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminDashboardPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      // Chart should show pricing trends, not visitor data
      expect(screen.getByText('Average Price Trends')).toBeInTheDocument()
      expect(screen.queryByText('Total Visitors')).not.toBeInTheDocument()
    })
  })
})