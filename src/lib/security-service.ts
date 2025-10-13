import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Define SecurityEvent type locally since model doesn't exist
interface SecurityEvent {
  id: string
  userId: string
  eventType: string
  eventDescription: string
  severity: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  metadata?: any
}

export class SecurityService {
  private static readonly SALT_ROUNDS = 12
  private static readonly MAX_LOGIN_ATTEMPTS = 5
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

  // Singleton instance for middleware compatibility
  private static instance: SecurityService

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService()
    }
    return SecurityService.instance
  }

  // Rate limiting for middleware
  async rateLimit(request: NextRequest, type: string): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const result = await SecurityService.checkRateLimit(
      `${type}_${identifier}`,
      100, // 100 requests
      15 * 60 * 1000 // per 15 minutes
    )
    
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetTime: result.resetTime.getTime()
    }
  }

  // Add security headers to response
  addSecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    response.headers.set('Content-Security-Policy', this.getCSPHeader())
    
    // Other security headers
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

  // Handle CORS
  handleCors(request: NextRequest, response: NextResponse): NextResponse {
    const origin = request.headers.get('origin')
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? ['https://elhamd-cars.com'] 
      : ['http://localhost:3000']
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    
    return response
  }

  // Password hashing
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS)
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  // Generate secure tokens
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  static generateSessionToken(): string {
    return this.generateSecureToken(64)
  }

  // Rate limiting
  static async recordFailedLogin(identifier: string): Promise<void> {
    // This would typically use Redis or another cache
    // For now, we'll just log it
    console.log(`Failed login recorded for: ${identifier}`)
  }

  static async isAccountLocked(identifier: string): Promise<boolean> {
    // This would check against a cache or database
    // For now, we'll return false
    return false
  }

  static async resetFailedAttempts(identifier: string): Promise<void> {
    // This would reset the failed login counter
    console.log(`Failed login attempts reset for: ${identifier}`)
  }

  // Input validation and sanitization
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '')
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Two-factor authentication
  static generate2FASecret(): string {
    return this.generateSecureToken(20)
  }

  static async enable2FA(userId: string, method: 'SMS' | 'EMAIL' | 'APP'): Promise<boolean> {
    try {
      const secret = this.generate2FASecret()
      
      // In a real implementation, this would save to database
      console.log(`2FA enabled for user ${userId} using ${method} with secret ${secret}`)
      
      return true
    } catch (error) {
      console.error('Error enabling 2FA:', error)
      return false
    }
  }

  static async disable2FA(userId: string): Promise<boolean> {
    try {
      // In a real implementation, this would update database
      console.log(`2FA disabled for user ${userId}`)
      
      return true
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      return false
    }
  }

  // Session management
  static async createSession(userId: string, userAgent?: string): Promise<string> {
    const sessionToken = this.generateSessionToken()
    
    // In a real implementation, this would save to database
    console.log(`Session created for user ${userId} with token ${sessionToken}`)
    
    return sessionToken
  }

  static async validateSession(sessionToken: string): Promise<string | null> {
    // In a real implementation, this would check database
    console.log(`Session validation for token ${sessionToken}`)
    
    // For demo purposes, return a mock user ID
    return sessionToken ? 'mock-user-id' : null
  }

  static async revokeSession(sessionToken: string): Promise<void> {
    // In a real implementation, this would remove from database
    console.log(`Session revoked for token ${sessionToken}`)
  }

  // Security logging (simplified since SecurityEvent model doesn't exist)
  private static async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    // This would save to database
    console.log('Security Event:', securityEvent)

    // Check for critical events that need immediate attention
    if (event.severity === 'CRITICAL') {
      await this.handleCriticalSecurityEvent(securityEvent)
    }
  }

  private static async handleCriticalSecurityEvent(event: SecurityEvent): Promise<void> {
    // In a real implementation, this would send alerts
    console.error('CRITICAL SECURITY EVENT:', event)
  }

  // CSRF protection
  static generateCSRFToken(): string {
    return this.generateSecureToken(32)
  }

  static validateCSRFToken(token: string, sessionToken: string): boolean {
    // In a real implementation, this would validate against stored token
    return token.length > 0 && sessionToken.length > 0
  }

  // Content Security Policy
  static getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }

  // Rate limiting helpers
  static async checkRateLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    // In a real implementation, this would use Redis or similar
    const now = new Date()
    const windowStart = new Date(now.getTime() - windowMs)
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: new Date(windowStart.getTime() + windowMs)
    }
  }

  // Data encryption
  static encryptSensitiveData(data: string, key: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', key)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  }

  static decryptSensitiveData(encryptedData: string, key: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', key)
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  // Audit logging
  static async logAuditEvent(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: any
  ): Promise<void> {
    const auditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      resource,
      resourceId,
      metadata,
      timestamp: new Date()
    }

    // This would save to audit log
    console.log('Audit Event:', auditEvent)
  }

  // Password reset
  static generatePasswordResetToken(): string {
    return this.generateSecureToken(32)
  }

  static async createPasswordResetRequest(userId: string): Promise<string | null> {
    try {
      const token = this.generatePasswordResetToken()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      
      // In a real implementation, this would save to database
      console.log(`Password reset request created for user ${userId} with token ${token}`)
      
      return token
    } catch (error) {
      console.error('Error creating password reset request:', error)
      return null
    }
  }

  static async validatePasswordResetToken(token: string): Promise<string | null> {
    // In a real implementation, this would check database
    console.log(`Password reset token validation for ${token}`)
    
    // For demo purposes, return a mock user ID
    return token ? 'mock-user-id' : null
  }

  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const userId = await this.validatePasswordResetToken(token)
      
      if (!userId) {
        return false
      }

      const hashedPassword = await this.hashPassword(newPassword)
      
      // In a real implementation, this would update database
      console.log(`Password reset for user ${userId}`)
      
      return true
    } catch (error) {
      console.error('Error resetting password:', error)
      return false
    }
  }
}

export default SecurityService