import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'

describe('POST /api/client-prices', () => {
  it('should create or update client price', async () => {
    const { POST } = await import('@/app/api/client-prices/route')

    const newPrice = {
      product_id: 'product-123',
      custom_price_usd: 129.99,
      markup_percentage: 30,
    }

    const request = new NextRequest('http://localhost:3000/api/client-prices', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer client-token',
      },
      body: JSON.stringify(newPrice),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('price')
    expect(data.price.product_id).toBe(newPrice.product_id)
    expect(data.price.custom_price_usd).toBe(newPrice.custom_price_usd)
    expect(data.price.markup_percentage).toBe(newPrice.markup_percentage)
  })

  it('should track price changes in history', async () => {
    const { POST } = await import('@/app/api/client-prices/route')

    const request = new NextRequest('http://localhost:3000/api/client-prices', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer client-token',
      },
      body: JSON.stringify({
        product_id: 'product-123',
        custom_price_usd: 149.99,
        markup_percentage: 50,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('historyCreated', true)
  })

  it('should validate price is not below base price', async () => {
    const { POST } = await import('@/app/api/client-prices/route')

    const request = new NextRequest('http://localhost:3000/api/client-prices', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer client-token',
      },
      body: JSON.stringify({
        product_id: 'product-123',
        custom_price_usd: 10, // Below base price
        markup_percentage: -50,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('below base price')
  })

  it('should return 404 for non-existent product', async () => {
    const { POST } = await import('@/app/api/client-prices/route')

    const request = new NextRequest('http://localhost:3000/api/client-prices', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer client-token',
      },
      body: JSON.stringify({
        product_id: 'nonexistent',
        custom_price_usd: 100,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toHaveProperty('error')
  })

  it('should allow admin to set prices for any client', async () => {
    const { POST } = await import('@/app/api/client-prices/route')

    const request = new NextRequest('http://localhost:3000/api/client-prices', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify({
        product_id: 'product-123',
        user_id: 'client-456',
        custom_price_usd: 99.99,
        markup_percentage: 20,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.price.user_id).toBe('client-456')
  })
})