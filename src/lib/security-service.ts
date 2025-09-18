import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export interface SecurityConfig {
  rateLimiting: {
    enabled: boolean
    windowMs: number
    maxRequests: number
  }
  cors: {
    enabled: boolean
    origins: string[]
    methods: string[]
    headers: string[]
  }
  security: {
    helmet: boolean
    xssProtection: boolean
    contentSecurityPolicy: boolean
    referrerPolicy: boolean
  }
  validation: {
    enabled: boolean
    strict: boolean
  }
}

export class SecurityService {
  private static instance: SecurityService
  private config: SecurityConfig
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map()

  private constructor() {
    this.config = {
      rateLimiting: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100
      },
      cors: {
        enabled: true,
        origins: process.env.NODE_ENV === 'production' 
          ? ['https://elhamd-cars.com'] 
          : ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization']
      },
      security: {
        helmet: true,
        xssProtection: true,
        contentSecurityPolicy: true,
        referrerPolicy: true
      },
      validation: {
        enabled: true,
        strict: true
      }
    }
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService()
    }
    return SecurityService.instance
  }

  // Rate limiting middleware
  async rateLimit(request: NextRequest, identifier: string = 'default'): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    if (!this.config.rateLimiting.enabled) {
      return { allowed: true, remaining: Infinity, resetTime: 0 }
    }

    const now = Date.now()
    const key = `${identifier}:${request.ip || 'unknown'}`
    const record = this.rateLimitStore.get(key)

    if (!record || now > record.resetTime) {
      // New window
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.config.rateLimiting.windowMs
      })
      return { allowed: true, remaining: this.config.rateLimiting.maxRequests - 1, resetTime: now + this.config.rateLimiting.windowMs }
    }

    if (record.count >= this.config.rateLimiting.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime }
    }

    record.count++
    return { allowed: true, remaining: this.config.rateLimiting.maxRequests - record.count, resetTime: record.resetTime }
  }

  // CORS middleware
  handleCors(request: NextRequest, response: NextResponse): NextResponse {
    if (!this.config.cors.enabled) {
      return response
    }

    const origin = request.headers.get('origin')
    
    if (origin && this.config.cors.origins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }

    response.headers.set('Access-Control-Allow-Methods', this.config.cors.methods.join(', '))
    response.headers.set('Access-Control-Allow-Headers', this.config.cors.headers.join(', '))
    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

    return response
  }

  // Security headers middleware
  addSecurityHeaders(response: NextResponse): NextResponse {
    if (!this.config.security.helmet) {
      return response
    }

    // Content Security Policy
    if (this.config.security.contentSecurityPolicy) {
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "block-all-mixed-content",
        "upgrade-insecure-requests"
      ].join('; ')

      response.headers.set('Content-Security-Policy', csp)
    }

    // XSS Protection
    if (this.config.security.xssProtection) {
      response.headers.set('X-XSS-Protection', '1; mode=block')
    }

    // Referrer Policy
    if (this.config.security.referrerPolicy) {
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    }

    // Other security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    return response
  }

  // Input validation and sanitization
  validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
    if (!this.config.validation.enabled) {
      return { success: true, data: data as T }
    }

    try {
      const validatedData = schema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => err.message)
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  // Sanitize user input
  sanitizeInput(input: string): string {
    if (!this.config.validation.enabled) {
      return input
    }

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }

  // SQL Injection prevention
  preventSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|ALL)(\s|$)/i,
      /(\s|^)(FROM|INTO|VALUES|SET|WHERE)(\s|$)/i,
      /(\s|^)(OR|AND)(\s+\d+\s*=\s*\d+)/i,
      /(\s|^)(--|\/\*|\*\/|;)(\s|$)/i,
      /(\s|^)(xp_|sp_)(\s|$)/i
    ]

    return !sqlPatterns.some(pattern => pattern.test(input))
  }

  // XSS prevention
  preventXss(input: string): string {
    if (!this.config.validation.enabled) {
      return input
    }

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // File upload security
  validateFileUpload(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'application/pdf'
    ]

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds maximum limit of 10MB' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' }
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (!allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: 'File extension not allowed' }
    }

    return { valid: true }
  }

  // Authentication security
  validatePasswordStrength(password: string): { score: number; feedback: string[] } {
    const feedback = []
    let score = 0

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long')
    } else {
      score += 1
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter')
    } else {
      score += 1
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter')
    } else {
      score += 1
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number')
    } else {
      score += 1
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain at least one special character')
    } else {
      score += 1
    }

    return { score, feedback }
  }

  // API security middleware
  async secureApiHandler(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      // Rate limiting
      const rateLimitResult = await this.rateLimit(request)
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': this.config.rateLimiting.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
            }
          }
        )
      }

      // Add security headers
      let response = await handler(request)
      response = this.addSecurityHeaders(response)
      response = this.handleCors(request, response)

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', this.config.rateLimiting.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())

      return response
    } catch (error) {
      console.error('Security middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  // Clean up expired rate limit records
  cleanupRateLimitStore(): void {
    const now = Date.now()
    for (const [key, record] of this.rateLimitStore.entries()) {
      if (now > record.resetTime) {
        this.rateLimitStore.delete(key)
      }
    }
  }

  // Get security metrics
  getSecurityMetrics(): {
    rateLimitEntries: number
    config: SecurityConfig
  } {
    return {
      rateLimitEntries: this.rateLimitStore.size,
      config: this.config
    }
  }
}

// Common validation schemas
export const securitySchemas = {
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^01[0-2,5]\d{8}$/, 'Invalid Egyptian phone number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  id: z.string().min(1, 'ID is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.date().min(new Date(), 'Date must be in the future'),
  url: z.string().url('Invalid URL'),
  boolean: z.boolean(),
  string: z.string().min(1, 'Field is required'),
  optionalString: z.string().optional(),
  number: z.number(),
  positiveNumber: z.number().positive('Number must be positive')
}

// Utility functions
export const securityUtils = {
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  hashPassword: async (password: string): Promise<string> => {
    // In production, use bcrypt or argon2
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  },

  comparePassword: async (password: string, hash: string): Promise<boolean> => {
    const hashedPassword = await securityUtils.hashPassword(password)
    return hashedPassword === hash
  },

  encryptData: (data: string, key: string): string => {
    // Simple encryption for demo purposes
    // In production, use proper encryption libraries
    return Buffer.from(data).toString('base64')
  },

  decryptData: (encryptedData: string, key: string): string => {
    // Simple decryption for demo purposes
    // In production, use proper decryption libraries
    return Buffer.from(encryptedData, 'base64').toString()
  }
}