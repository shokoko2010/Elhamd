import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter for development
// In production, use Redis or a proper rate limiting service
const rateLimit = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs?: number  // Time window in milliseconds
  max?: number       // Maximum requests per window
  message?: string   // Custom message
  skipSuccessfulRequests?: boolean // Don't count successful requests
}

export function createRateLimit(config: RateLimitConfig = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // 100 requests per window
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false
  } = config

  return async function rateLimitMiddleware(request: NextRequest) {
    // Get client identifier (IP address)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 
                request.headers.get('x-real-ip') || 
                request.ip || 
                'unknown'

    const key = `rate-limit:${ip}`
    const now = Date.now()

    // Get current rate limit data
    const record = rateLimit.get(key)
    
    if (!record || now > record.resetTime) {
      // New window or expired window
      rateLimit.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return null // Allow request
    }

    // Check if limit exceeded
    if (record.count >= max) {
      return NextResponse.json(
        { error: message },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
          }
        }
      )
    }

    // Increment counter
    record.count++
    
    // Add rate limit headers to response
    const headers = {
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': Math.max(0, max - record.count).toString(),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
    }

    return { headers }
  }
}

// Predefined rate limiters for different use cases
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.'
})

export const generalApiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many API requests, please try again later.'
})

export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Rate limit exceeded, please slow down.'
})

// Cleanup function to prevent memory leaks (call this periodically)
export function cleanupRateLimits() {
  const now = Date.now()
  for (const [key, record] of rateLimit.entries()) {
    if (now > record.resetTime) {
      rateLimit.delete(key)
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}