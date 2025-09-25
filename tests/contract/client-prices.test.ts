import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'

describe('GET /api/client-prices', () => {
  it('should return client prices for authenticated client', async () => {
    const { GET } = await import('@/app/api/client-prices/route')

    const request = new NextRequest('http://localhost:3000/api/client-prices', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer client-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('prices')
    expect(Array.isArray(data.prices)).toBe(true)
    if (data.prices.length > 0) {
      expect(data.prices[0]).toHaveProperty('product_id')
      expect(data.prices[0]).toHaveProperty('custom_price_usd')
      expect(data.prices[0]).toHaveProperty('markup_percentage')
    }
  })

  it('should return all client prices for admin', async () => {
    const { GET } = await import('@/app/api/client-prices/route')

    const request = new NextRequest('http://localhost:3000/api/client-prices?client_id=client-123', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer admin-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('prices')
    expect(Array.isArray(data.prices)).toBe(true)
  })

  it('should filter by product_id', async () => {
    const { GET } = await import('@/app/api/client-prices/route')

    const request = new NextRequest('http://localhost:3000/api/client-prices?product_id=product-123', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer client-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.prices.every((p: any) => p.product_id === 'product-123')).toBe(true)
  })

  it('should return 401 for unauthenticated request', async () => {
    const { GET } = await import('@/app/api/client-prices/route')

    const request = new NextRequest('http://localhost:3000/api/client-prices', {
      method: 'GET',
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('error')
  })

  it('should return 403 when client tries to access another client prices', async () => {
    const { GET } = await import('@/app/api/client-prices/route')

    const request = new NextRequest('http://localhost:3000/api/client-prices?client_id=other-client', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer client-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toHaveProperty('error')
  })
})