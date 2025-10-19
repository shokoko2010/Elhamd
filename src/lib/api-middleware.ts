import { NextRequest, NextResponse } from 'next/server'
import { SecurityService } from '@/lib/security-service'

export async function withSecurity(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    rateLimitKey?: string
    publicEndpoints?: string[]
  } = {}
) {
  return async (request: NextRequest, context?: any) => {
    const securityService = SecurityService.getInstance()
    
    // Check if this is a public endpoint
    const isPublicEndpoint = options.publicEndpoints?.some(endpoint => 
      request.nextUrl.pathname.startsWith(endpoint)
    )
    
    // Apply rate limiting for non-public endpoints
    let rateLimitResult: {
      allowed: boolean
      remaining: number
      resetTime: number
    } | null = null
    
    if (!isPublicEndpoint && options.rateLimitKey) {
      rateLimitResult = await securityService.rateLimit(request, options.rateLimitKey)
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
    
    // Execute the handler
    const response = await handler(request, context)
    
    // Add security headers
    const securedResponse = securityService.addSecurityHeaders(response)
    
    // Add CORS headers
    const corsResponse = securityService.handleCors(request, securedResponse)
    
    // Add rate limit headers
    if (!isPublicEndpoint && rateLimitResult) {
      corsResponse.headers.set('X-RateLimit-Limit', '100')
      corsResponse.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      corsResponse.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
    }
    
    return corsResponse
  }
}

export function withAuth(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    const token = request.cookies.get('staff_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Add user context to request if needed
    return handler(request, context)
  }
}