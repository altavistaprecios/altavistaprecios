import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductTable } from '@/components/products/product-table'
import type { Product } from '@/lib/models/product'

const mockProducts: Product[] = [
  {
    id: '1',
    code: 'LENS-001',
    name: 'Progressive Lens',
    base_price_usd: 150.00,
    category_id: 'cat-1',
    image_url: null,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    code: 'COAT-001',
    name: 'Anti-Reflective Coating',
    base_price_usd: 75.00,
    category_id: 'cat-2',
    image_url: null,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '3',
    code: 'TREAT-001',
    name: 'UV Protection Treatment',
    base_price_usd: 50.00,
    category_id: 'cat-3',
    image_url: null,
    is_active: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
]

describe('ProductTable Component', () => {
  it('should render correct column headers', () => {
    render(<ProductTable products={mockProducts} />)

    expect(screen.getByText('Product Code')).toBeInTheDocument()
    expect(screen.getByText('Product Name')).toBeInTheDocument()
    expect(screen.getByText('Base Price')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('should display product data correctly', () => {
    render(<ProductTable products={mockProducts} />)

    // First product
    expect(screen.getByText('LENS-001')).toBeInTheDocument()
    expect(screen.getByText('Progressive Lens')).toBeInTheDocument()
    expect(screen.getByText('$150.00')).toBeInTheDocument()

    // Second product
    expect(screen.getByText('COAT-001')).toBeInTheDocument()
    expect(screen.getByText('Anti-Reflective Coating')).toBeInTheDocument()
    expect(screen.getByText('$75.00')).toBeInTheDocument()
  })

  it('should show active/inactive status correctly', () => {
    render(<ProductTable products={mockProducts} />)

    const activeStatuses = screen.getAllByText('Active')
    const inactiveStatuses = screen.getAllByText('Inactive')

    expect(activeStatuses).toHaveLength(2)
    expect(inactiveStatuses).toHaveLength(1)
  })

  it('should have edit and delete action buttons for each product', () => {
    render(<ProductTable products={mockProducts} />)

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })

    expect(editButtons).toHaveLength(3)
    expect(deleteButtons).toHaveLength(3)
  })

  it('should handle product selection', () => {
    render(<ProductTable products={mockProducts} />)

    const checkboxes = screen.getAllByRole('checkbox')
    // First checkbox is "select all", rest are individual products
    expect(checkboxes).toHaveLength(4)

    // Click select all
    fireEvent.click(checkboxes[0])

    // All products should be selected
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked()
    })
  })

  it('should support sorting by price', () => {
    render(<ProductTable products={mockProducts} />)

    const priceHeader = screen.getByText('Base Price')
    fireEvent.click(priceHeader)

    // Should have sort indicator
    expect(priceHeader.closest('th')).toHaveAttribute('aria-sort')
  })

  it('should support filtering', () => {
    render(<ProductTable products={mockProducts} />)

    const filterInput = screen.getByPlaceholderText('Filter products...')
    fireEvent.change(filterInput, { target: { value: 'Lens' } })

    expect(screen.getByText('LENS-001')).toBeInTheDocument()
    expect(screen.queryByText('COAT-001')).not.toBeInTheDocument()
    expect(screen.queryByText('TREAT-001')).not.toBeInTheDocument()
  })

  it('should show bulk actions when products are selected', () => {
    render(<ProductTable products={mockProducts} />)

    const firstCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstCheckbox)

    expect(screen.getByText('1 product selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bulk edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bulk delete/i })).toBeInTheDocument()
  })

  it('should display pagination controls', () => {
    render(<ProductTable products={mockProducts} />)

    expect(screen.getByText('Rows per page')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('should handle empty state', () => {
    render(<ProductTable products={[]} />)

    expect(screen.getByText('No products found')).toBeInTheDocument()
    expect(screen.getByText('Add your first product to get started')).toBeInTheDocument()
  })
})