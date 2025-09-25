import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'

describe('POST /api/auth/invite', () => {
  it('should successfully invite a new client', async () => {
    const { POST } = await import('@/app/api/auth/invite/route')

    const request = new NextRequest('http://localhost:3000/api/auth/invite', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify({
        email: 'newclient@example.com',
        companyName: 'Test Company',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('message')
    expect(data).toHaveProperty('userId')
  })

  it('should return 400 for duplicate email', async () => {
    const { POST } = await import('@/app/api/auth/invite/route')

    const request = new NextRequest('http://localhost:3000/api/auth/invite', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify({
        email: 'existing@example.com',
        companyName: 'Test Company',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
  })

  it('should return 401 for missing authorization', async () => {
    const { POST } = await import('@/app/api/auth/invite/route')

    const request = new NextRequest('http://localhost:3000/api/auth/invite', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newclient@example.com',
        companyName: 'Test Company',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('error')
  })

  it('should return 403 for non-admin user', async () => {
    const { POST } = await import('@/app/api/auth/invite/route')

    const request = new NextRequest('http://localhost:3000/api/auth/invite', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer client-token',
      },
      body: JSON.stringify({
        email: 'newclient@example.com',
        companyName: 'Test Company',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toHaveProperty('error')
  })
})