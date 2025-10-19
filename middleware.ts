import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Handle employee dashboard authentication
  if (request.nextUrl.pathname.startsWith('/employee')) {
    const token = request.cookies.get('staff_token')?.value
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const response = NextResponse.next()
    return addBasicSecurityHeaders(response)
  }
  
  // Handle admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('staff_token')?.value
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const response = NextResponse.next()
    return addBasicSecurityHeaders(response)
  }
  
  // Apply basic security to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    return addBasicSecurityHeaders(response)
  }
  
  // Apply basic security headers to all responses
  const response = NextResponse.next()
  return addBasicSecurityHeaders(response)
}

function addBasicSecurityHeaders(response: NextResponse) {
  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}