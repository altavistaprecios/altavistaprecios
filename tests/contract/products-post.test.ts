import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'

describe('POST /api/products', () => {
  it('should create a new product as admin', async () => {
    const { POST } = await import('@/app/api/products/route')

    const newProduct = {
      name: 'Test Lens',
      code: 'TST-001',
      base_price_usd: 99.99,
      category_id: 'category-1',
      specifications: {
        spherical_range: '-10.00 to +10.00',
        cylindrical_range: '-4.00 to +4.00',
        materials: ['CR-39', 'Polycarbonate'],
      },
    }

    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify(newProduct),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('product')
    expect(data.product).toHaveProperty('id')
    expect(data.product.name).toBe(newProduct.name)
    expect(data.product.code).toBe(newProduct.code)
  })

  it('should return 400 for duplicate product code', async () => {
    const { POST } = await import('@/app/api/products/route')

    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify({
        name: 'Duplicate Product',
        code: 'EXISTING-001',
        base_price_usd: 50,
        category_id: 'category-1',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('already exists')
  })

  it('should return 403 for non-admin users', async () => {
    const { POST } = await import('@/app/api/products/route')

    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer client-token',
      },
      body: JSON.stringify({
        name: 'Test Product',
        code: 'TST-002',
        base_price_usd: 50,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toHaveProperty('error')
  })

  it('should validate required fields', async () => {
    const { POST } = await import('@/app/api/products/route')

    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify({
        name: 'Incomplete Product',
        // Missing code and base_price_usd
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
  })
})