import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { SecurityService } from '@/lib/security-service'

export async function middleware(request: NextRequest) {
  const securityService = SecurityService.getInstance()
  
  // Handle employee dashboard authentication
  if (request.nextUrl.pathname.startsWith('/employee')) {
    try {
      // Get NextAuth token
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      })
      
      if (!token) {
        // Redirect to main login if not authenticated
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
      const response = NextResponse.next()
      return securityService.addSecurityHeaders(response)
    } catch (error) {
      // If there's any error with token, redirect to login
      console.error('Middleware auth error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // Handle admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      // Get NextAuth token
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      })
      
      if (!token) {
        // Redirect to main login if not authenticated
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
      const response = NextResponse.next()
      return securityService.addSecurityHeaders(response)
    } catch (error) {
      console.error('Middleware auth error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // Apply security measures to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip security for health check and some public endpoints
    const publicEndpoints = [
      '/api/health',
      '/api/placeholder',
      '/api/vehicles',
      '/api/service-types',
      '/api/availability',
      '/api/site-settings'
    ]
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      request.nextUrl.pathname.startsWith(endpoint)
    )
    
    let rateLimitResult: {
      allowed: boolean
      remaining: number
      resetTime: number
    } | null = null
    if (!isPublicEndpoint) {
      // Apply rate limiting
      rateLimitResult = await securityService.rateLimit(request, 'api')
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: 'Too many requests', message: 'Please try again later' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
            }
          }
        )
      }
    }
    
    // Create a response wrapper for API routes
    const response = NextResponse.next()
    
    // Add security headers
    const securedResponse = securityService.addSecurityHeaders(response)
    
    // Add CORS headers
    const corsResponse = securityService.handleCors(request, securedResponse)
    
    // Add rate limit headers for all API responses (only if rate limiting was applied)
    if (!isPublicEndpoint && rateLimitResult) {
      corsResponse.headers.set('X-RateLimit-Limit', '100')
      corsResponse.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      corsResponse.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
    }
    
    return corsResponse
  }
  
  // Apply security headers to all responses
  const response = NextResponse.next()
  const securedResponse = securityService.addSecurityHeaders(response)
  
  // Add CSRF protection for non-GET requests
  if (request.method !== 'GET') {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    // Allow same-origin requests
    if (origin && origin !== `http://${host}` && origin !== `https://${host}`) {
      // Check if origin is allowed
      const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? ['https://elhamd-cars.com'] 
        : ['http://localhost:3000']
      
      if (!allowedOrigins.includes(origin)) {
        return NextResponse.json(
          { error: 'Invalid origin' },
          { status: 403 }
        )
      }
    }
  }
  
  // Security headers for web pages
  securedResponse.headers.set('X-Content-Type-Options', 'nosniff')
  securedResponse.headers.set('X-Frame-Options', 'DENY')
  securedResponse.headers.set('X-XSS-Protection', '1; mode=block')
  securedResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // HSTS in production
  if (process.env.NODE_ENV === 'production') {
    securedResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  return securedResponse
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