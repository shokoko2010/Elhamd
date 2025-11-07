import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add security headers
    const response = NextResponse.next()
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // Only allow specific origins for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      const origin = req.headers.get('origin')
      const allowedOrigins = [
        process.env.NEXTAUTH_URL,
        'http://localhost:3000',
        'https://elhamdimport.com'
      ].filter(Boolean)
      
      if (origin && !allowedOrigins.includes(origin)) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    }
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public paths that don't require authentication
        const publicPaths = [
          '/login',
          '/register', 
          '/forgot-password',
          '/api/auth',
          '/api/public',
          '/api/health',
          '/_next',
          '/favicon.ico',
          '/robots.txt'
        ]
        
        const { pathname } = req.nextUrl
        
        // Check if path is public
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true
        }
        
        // Admin paths require admin role
        if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
          return token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'
        }
        
        // Employee paths require staff or higher role
        if (pathname.startsWith('/employee') || pathname.startsWith('/api/employee')) {
          return ['STAFF', 'BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(token?.role as string)
        }
        
        // All other paths require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|sw.js).*)",
  ],
}