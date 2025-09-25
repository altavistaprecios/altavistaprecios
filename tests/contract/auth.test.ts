import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

describe('POST /api/auth/login', () => {
  it('should successfully login with valid credentials', async () => {
    const { POST } = await import('@/app/api/auth/login/route')

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('user')
    expect(data.user).toHaveProperty('email', 'test@example.com')
  })

  it('should return 401 for invalid credentials', async () => {
    const { POST } = await import('@/app/api/auth/login/route')

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('error')
  })

  it('should return 400 for missing email', async () => {
    const { POST } = await import('@/app/api/auth/login/route')

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
  })

  it('should return 400 for missing password', async () => {
    const { POST } = await import('@/app/api/auth/login/route')

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
  })
})