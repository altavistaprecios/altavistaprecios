import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/admin', '/client']
  const authPaths = ['/login', '/signup', '/set-password', '/reset-password']
  const pendingPath = '/pending-approval'

  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )
  const isAuthPath = authPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )
  const isPendingPath = request.nextUrl.pathname.startsWith(pendingPath)

  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isProtectedPath) {
    // Check user status from database
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status')
      .eq('id', user.id)
      .single()

    // If user is pending, redirect to pending approval page
    if (profile?.status === 'pending' && !isPendingPath) {
      return NextResponse.redirect(new URL('/pending-approval', request.url))
    }

    // If user is rejected or suspended, redirect to login with message
    if (profile?.status === 'rejected' || profile?.status === 'suspended') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=account_disabled', request.url))
    }

    // Check admin status for admin routes
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isAdmin = user.user_metadata?.is_admin === true

    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/client', request.url))
    }

    if (!isAdminRoute && isAdmin && request.nextUrl.pathname.startsWith('/client')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  if (isAuthPath && user) {
    // Redirect authenticated users away from auth pages
    const isAdmin = user.user_metadata?.is_admin === true
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/client', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}