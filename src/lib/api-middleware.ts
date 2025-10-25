import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, authorize } from '@/lib/auth-server'
import { PERMISSIONS } from '@/lib/permissions'
import { SecurityService } from '@/lib/security-service'

// API Route protection middleware
export class ApiMiddleware {
  private securityService: SecurityService

  constructor() {
    this.securityService = SecurityService.getInstance()
  }

  // Apply rate limiting
  async applyRateLimit(request: NextRequest, endpoint: string, limit: number = 100) {
    const rateLimitResult = await this.securityService.rateLimit(request, endpoint)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Please try again later' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    return null // No rate limit issue
  }

  // Apply security headers
  applySecurityHeaders(response: NextResponse): NextResponse {
    return this.securityService.addSecurityHeaders(response)
  }

  // Validate and sanitize input
  validateAndSanitizeInput(body: any, schema?: any): { isValid: boolean; sanitizedData?: any; error?: string } {
    if (!body || typeof body !== 'object') {
      return { isValid: false, error: 'Invalid request body' }
    }

    // Basic sanitization
    const sanitized: any = {}
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        sanitized[key] = this.securityService.sanitizeInput(value)
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.securityService.sanitizeInput(item) : item
        )
      } else {
        sanitized[key] = value
      }
    }

    // SQL Injection prevention
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string' && !this.securityService.preventSqlInjection(value)) {
        return { isValid: false, error: `Invalid input detected in field: ${key}` }
      }
    }

    return { isValid: true, sanitizedData: sanitized }
  }

  // Authentication wrapper for API routes
  async withAuth(
    handler: (request: NextRequest, context: { user: any }) => Promise<NextResponse>,
    options?: {
      permissions?: string[]
      roles?: string[]
      rateLimit?: { endpoint: string; limit: number }
      requireBody?: boolean
      sanitizeInput?: boolean
    }
  ) {
    return async (request: NextRequest, context?: any) => {
      try {
        // Apply rate limiting if specified
        if (options?.rateLimit) {
          const rateLimitResponse = await this.applyRateLimit(
            request, 
            options.rateLimit.endpoint, 
            options.rateLimit.limit
          )
          if (rateLimitResponse) return rateLimitResponse
        }

        // Check authentication and authorization
        const authOptions: any = {}
        if (options?.permissions) {
          authOptions.permissions = options.permissions
        }
        if (options?.roles) {
          authOptions.roles = options.roles
        }

        const authResult = await authorize(request, authOptions)
        
        if (authResult.error) {
          return authResult.error
        }

        const user = authResult.user

        // Validate and sanitize request body if required
        let requestBody = undefined
        if (options?.requireBody || options?.sanitizeInput) {
          try {
            const body = await request.json()
            
            if (options?.sanitizeInput) {
              const validation = this.validateAndSanitizeInput(body)
              if (!validation.isValid) {
                return NextResponse.json(
                  { error: validation.error },
                  { status: 400 }
                )
              }
              requestBody = validation.sanitizedData
            } else {
              requestBody = body
            }
          } catch (error) {
            return NextResponse.json(
              { error: 'Invalid JSON in request body' },
              { status: 400 }
            )
          }
        }

        // Call the original handler
        const response = await handler(request, { user, body: requestBody })

        // Apply security headers to response
        return this.applySecurityHeaders(response)

      } catch (error) {
        console.error('API Middleware Error:', error)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  }

  // Public route wrapper (no auth required but with security)
  async withPublicAuth(
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
    options?: {
      rateLimit?: { endpoint: string; limit: number }
      sanitizeInput?: boolean
    }
  ) {
    return async (request: NextRequest, context?: any) => {
      try {
        // Apply rate limiting if specified
        if (options?.rateLimit) {
          const rateLimitResponse = await this.applyRateLimit(
            request, 
            options.rateLimit.endpoint, 
            options.rateLimit.limit
          )
          if (rateLimitResponse) return rateLimitResponse
        }

        // Validate and sanitize request body if required
        let requestBody = undefined
        if (options?.sanitizeInput) {
          try {
            const body = await request.json()
            const validation = this.validateAndSanitizeInput(body)
            if (!validation.isValid) {
              return NextResponse.json(
                { error: validation.error },
                { status: 400 }
              )
            }
            requestBody = validation.sanitizedData
          } catch (error) {
            // If body parsing fails, continue without it for GET requests
            if (request.method !== 'GET') {
              return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
              )
            }
          }
        }

        // Call the original handler
        const response = await handler(request, { ...context, body: requestBody })

        // Apply security headers to response
        return this.applySecurityHeaders(response)

      } catch (error) {
        console.error('API Middleware Error:', error)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  }
}

// Export singleton instance
export const apiMiddleware = new ApiMiddleware()

// Helper functions for common patterns
export const withAuth = apiMiddleware.withAuth.bind(apiMiddleware)
export const withPublicAuth = apiMiddleware.withPublicAuth.bind(apiMiddleware)