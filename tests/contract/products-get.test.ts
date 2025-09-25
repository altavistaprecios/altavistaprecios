import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'

describe('GET /api/products', () => {
  it('should return list of active products', async () => {
    const { GET } = await import('@/app/api/products/route')

    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('products')
    expect(Array.isArray(data.products)).toBe(true)
    expect(data.products[0]).toHaveProperty('id')
    expect(data.products[0]).toHaveProperty('name')
    expect(data.products[0]).toHaveProperty('code')
    expect(data.products[0]).toHaveProperty('base_price_usd')
  })

  it('should filter products by category', async () => {
    const { GET } = await import('@/app/api/products/route')

    const request = new NextRequest('http://localhost:3000/api/products?category=lenses', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.products.every((p: any) => p.category === 'lenses')).toBe(true)
  })

  it('should include client prices for client users', async () => {
    const { GET } = await import('@/app/api/products/route')

    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer client-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.products[0]).toHaveProperty('client_price')
  })

  it('should return 401 for unauthenticated request', async () => {
    const { GET } = await import('@/app/api/products/route')

    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'GET',
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('error')
  })
})