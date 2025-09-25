import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'

describe('PUT /api/products/[id]', () => {
  it('should update a product as admin', async () => {
    const { PUT } = await import('@/app/api/products/[id]/route')

    const productId = 'product-123'
    const updates = {
      name: 'Updated Product Name',
      base_price_usd: 149.99,
    }

    const request = new NextRequest(`http://localhost:3000/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify(updates),
    })

    const response = await PUT(request, { params: { id: productId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('product')
    expect(data.product.name).toBe(updates.name)
    expect(data.product.base_price_usd).toBe(updates.base_price_usd)
  })

  it('should track price changes in history', async () => {
    const { PUT } = await import('@/app/api/products/[id]/route')

    const productId = 'product-123'
    const request = new NextRequest(`http://localhost:3000/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify({
        base_price_usd: 199.99,
      }),
    })

    const response = await PUT(request, { params: { id: productId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('priceHistoryCreated', true)
  })

  it('should return 404 for non-existent product', async () => {
    const { PUT } = await import('@/app/api/products/[id]/route')

    const request = new NextRequest('http://localhost:3000/api/products/nonexistent', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify({
        name: 'Updated Name',
      }),
    })

    const response = await PUT(request, { params: { id: 'nonexistent' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toHaveProperty('error')
  })

  it('should return 403 for non-admin users', async () => {
    const { PUT } = await import('@/app/api/products/[id]/route')

    const request = new NextRequest('http://localhost:3000/api/products/product-123', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer client-token',
      },
      body: JSON.stringify({
        name: 'Updated Name',
      }),
    })

    const response = await PUT(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toHaveProperty('error')
  })

  it('should validate update data', async () => {
    const { PUT } = await import('@/app/api/products/[id]/route')

    const request = new NextRequest('http://localhost:3000/api/products/product-123', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify({
        base_price_usd: -50, // Invalid negative price
      }),
    })

    const response = await PUT(request, { params: { id: 'product-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
  })
})