import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import speakeasy from 'speakeasy' // For TOTP
import qrcode from 'qrcode' // For QR code generation

// Types for security features
export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface SecurityEvent {
  id: string
  userId: string
  eventType: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | '2FA_ENABLED' | '2FA_DISABLED' | 'SECURITY_SETTINGS_CHANGE' | 'DATA_ACCESS' | 'PERMISSION_CHANGE' | 'FAILED_LOGIN' | 'ACCOUNT_LOCKED' | 'SESSION_EXPIRED'
  eventDescription: string
  ipAddress: string
  userAgent: string
  location?: string
  device?: string
  timestamp: Date
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  metadata?: Record<string, any>
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  changes: {
    before: Record<string, any>
    after: Record<string, any>
  }
  ipAddress: string
  userAgent: string
  timestamp: Date
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  errorMessage?: string
}

export interface SecuritySettings {
  userId: string
  twoFactorEnabled: boolean
  twoFactorMethod: 'TOTP' | 'SMS' | 'EMAIL' | 'NONE'
  passwordLastChanged: Date
  sessionTimeout: number
  loginAttempts: number
  accountLocked: boolean
  lockUntil?: Date
  backupCodes: string[]
  securityQuestions: Array<{
    question: string
    answer: string
  }>
  trustedDevices: Array<{
    deviceId: string
    deviceName: string
    lastUsed: Date
    trusted: boolean
  }>
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventReusedPasswords: number
  passwordExpiryDays: number
  accountLockoutThreshold: number
  accountLockoutDuration: number // in minutes
}

export class SecurityService {
  private static instance: SecurityService
  private passwordPolicy: PasswordPolicy

  private constructor() {
    this.passwordPolicy = {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReusedPasswords: 5,
      passwordExpiryDays: 90,
      accountLockoutThreshold: 5,
      accountLockoutDuration: 30
    }
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService()
    }
    return SecurityService.instance
  }

  // Two-Factor Authentication Methods

  // Generate TOTP secret and setup QR code
  async setupTwoFactorAuth(userId: string): Promise<TwoFactorSetup> {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Generate secret key
    const secret = speakeasy.generateSecret({
      name: `Al-Hamd Cars (${user.email})`,
      issuer: 'Al-Hamd Cars',
      length: 32
    })

    // Generate QR code URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url)

    // Generate backup codes
    const backupCodes = this.generateBackupCodes()

    // Store secret and backup codes (in real implementation, encrypt the secret)
    await this.updateUserSecuritySettings(userId, {
      twoFactorSecret: secret.base32,
      backupCodes: backupCodes
    })

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes
    }
  }

  // Verify TOTP token
  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.securitySettings) {
      return false
    }

    const securitySettings = user.securitySettings as any
    const secret = securitySettings.twoFactorSecret

    if (!secret) {
      return false
    }

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 steps before/after for clock drift
    })

    return verified
  }

  // Verify backup code
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.securitySettings) {
      return false
    }

    const securitySettings = user.securitySettings as any
    const backupCodes = securitySettings.backupCodes || []

    const codeIndex = backupCodes.indexOf(code)
    if (codeIndex === -1) {
      return false
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1)
    await this.updateUserSecuritySettings(userId, { backupCodes })

    return true
  }

  // Enable 2FA for user
  async enableTwoFactorAuth(userId: string, method: 'TOTP' | 'SMS' | 'EMAIL', token: string): Promise<boolean> {
    const isValid = await this.verifyTwoFactorToken(userId, token)
    
    if (!isValid) {
      return false
    }

    await this.updateUserSecuritySettings(userId, {
      twoFactorEnabled: true,
      twoFactorMethod: method
    })

    // Log security event
    await this.logSecurityEvent({
      userId,
      eventType: '2FA_ENABLED',
      eventDescription: `Two-factor authentication enabled using ${method}`,
      severity: 'INFO'
    })

    return true
  }

  // Disable 2FA for user
  async disableTwoFactorAuth(userId: string, password: string): Promise<boolean> {
    // Verify password before disabling 2FA
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.password) {
      return false
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return false
    }

    await this.updateUserSecuritySettings(userId, {
      twoFactorEnabled: false,
      twoFactorMethod: 'NONE'
    })

    // Log security event
    await this.logSecurityEvent({
      userId,
      eventType: '2FA_DISABLED',
      eventDescription: 'Two-factor authentication disabled',
      severity: 'WARNING'
    })

    return true
  }

  // Generate backup codes
  private generateBackupCodes(): string[] {
    const codes = []
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 15).toUpperCase())
    }
    return codes
  }

  // Password Management

  // Validate password against policy
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < this.passwordPolicy.minLength) {
      errors.push(`Password must be at least ${this.passwordPolicy.minLength} characters long`)
    }

    if (this.passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (this.passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (this.passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (this.passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.password) {
      return false
    }

    // Verify current password
    const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return false
    }

    // Validate new password
    const validation = this.validatePassword(newPassword)
    if (!validation.isValid) {
      throw new Error(`Password validation failed: ${validation.errors.join(', ')}`)
    }

    // Check if password was used before
    if (await this.isPasswordReused(userId, newPassword)) {
      throw new Error('This password has been used recently. Please choose a different password.')
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword)

    // Update password
    await db.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    // Update security settings
    await this.updateUserSecuritySettings(userId, {
      passwordLastChanged: new Date()
    })

    // Log security event
    await this.logSecurityEvent({
      userId,
      eventType: 'PASSWORD_CHANGE',
      eventDescription: 'Password changed successfully',
      severity: 'INFO'
    })

    return true
  }

  // Check if password was reused
  private async isPasswordReused(userId: string, newPassword: string): Promise<boolean> {
    // This would check against previous passwords
    // For now, return false
    return false
  }

  // Account Lockout Management

  // Record failed login attempt
  async recordFailedLogin(userId: string, ipAddress: string): Promise<void> {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return
    }

    const securitySettings = (user.securitySettings as any) || {}
    const loginAttempts = (securitySettings.loginAttempts || 0) + 1

    await this.updateUserSecuritySettings(userId, {
      loginAttempts
    })

    // Log security event
    await this.logSecurityEvent({
      userId,
      eventType: 'FAILED_LOGIN',
      eventDescription: `Failed login attempt (${loginAttempts}/${this.passwordPolicy.accountLockoutThreshold})`,
      severity: 'WARNING',
      metadata: { attemptNumber: loginAttempts }
    })

    // Check if account should be locked
    if (loginAttempts >= this.passwordPolicy.accountLockoutThreshold) {
      const lockUntil = new Date(Date.now() + this.passwordPolicy.accountLockoutDuration * 60000)
      
      await this.updateUserSecuritySettings(userId, {
        accountLocked: true,
        lockUntil
      })

      // Log security event
      await this.logSecurityEvent({
        userId,
        eventType: 'ACCOUNT_LOCKED',
        eventDescription: `Account locked due to too many failed login attempts`,
        severity: 'ERROR'
      })
    }
  }

  // Reset failed login attempts
  async resetFailedLoginAttempts(userId: string): Promise<void> {
    await this.updateUserSecuritySettings(userId, {
      loginAttempts: 0,
      accountLocked: false,
      lockUntil: null
    })
  }

  // Check if account is locked
  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.securitySettings) {
      return false
    }

    const securitySettings = user.securitySettings as any
    
    if (!securitySettings.accountLocked) {
      return false
    }

    // Check if lock has expired
    if (securitySettings.lockUntil && new Date() > new Date(securitySettings.lockUntil)) {
      await this.updateUserSecuritySettings(userId, {
        accountLocked: false,
        lockUntil: null
      })
      return false
    }

    return true
  }

  // Audit Trail Management

  // Log audit event
  async logAuditEvent(auditLog: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    // This would save to database
    console.log('Audit Event:', auditLog)
  }

  // Get audit logs for user
  async getUserAuditLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    // This would fetch from database
    return []
  }

  // Get system audit logs
  async getSystemAuditLogs(filters: {
    userId?: string
    eventType?: string
    dateFrom?: Date
    dateTo?: Date
    limit?: number
  }): Promise<AuditLog[]> {
    // This would fetch from database with filters
    return []
  }

  // Security Event Logging

  // Log security event
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
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

  // Get security events for user
  async getUserSecurityEvents(userId: string, limit: number = 100): Promise<SecurityEvent[]> {
    // This would fetch from database
    return []
  }

  // Get system security events
  async getSystemSecurityEvents(filters: {
    userId?: string
    eventType?: string
    severity?: string
    dateFrom?: Date
    dateTo?: Date
    limit?: number
  }): Promise<SecurityEvent[]> {
    // This would fetch from database with filters
    return []
  }

  // Handle critical security events
  private async handleCriticalSecurityEvent(event: SecurityEvent): Promise<void> {
    // This would trigger alerts, notifications, or automatic responses
    console.error('CRITICAL SECURITY EVENT:', event)
    
    // Examples of automatic responses:
    // - Lock user account
    // - Force logout of all sessions
    // - Send security alerts to administrators
    // - Enable additional monitoring
  }

  // Session Management

  // Create secure session
  async createSession(userId: string, deviceInfo: any): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // This would create session in database
    console.log('Session created:', { userId, sessionId, deviceInfo })

    // Log security event
    await this.logSecurityEvent({
      userId,
      eventType: 'LOGIN',
      eventDescription: 'User logged in successfully',
      severity: 'INFO',
      metadata: { sessionId, deviceInfo }
    })

    return sessionId
  }

  // Validate session
  async validateSession(sessionId: string): Promise<boolean> {
    // This would validate session in database
    return true
  }

  // Invalidate session (logout)
  async invalidateSession(sessionId: string, userId: string): Promise<void> {
    // This would remove session from database
    console.log('Session invalidated:', { sessionId, userId })

    // Log security event
    await this.logSecurityEvent({
      userId,
      eventType: 'LOGOUT',
      eventDescription: 'User logged out',
      severity: 'INFO',
      metadata: { sessionId }
    })
  }

  // Get user sessions
  async getUserSessions(userId: string): Promise<any[]> {
    // This would fetch user sessions from database
    return []
  }

  // Device Management

  // Register trusted device
  async registerTrustedDevice(userId: string, deviceInfo: any): Promise<void> {
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // This would save to user's security settings
    console.log('Trusted device registered:', { userId, deviceId, deviceInfo })
  }

  // Remove trusted device
  async removeTrustedDevice(userId: string, deviceId: string): Promise<void> {
    // This would remove from user's security settings
    console.log('Trusted device removed:', { userId, deviceId })
  }

  // Helper methods

  // Update user security settings
  private async updateUserSecuritySettings(userId: string, updates: any): Promise<void> {
    await db.user.update({
      where: { id: userId },
      data: {
        securitySettings: updates,
        updatedAt: new Date()
      }
    })
  }

  // Get password policy
  getPasswordPolicy(): PasswordPolicy {
    return { ...this.passwordPolicy }
  }

  // Update password policy
  updatePasswordPolicy(newPolicy: Partial<PasswordPolicy>): void {
    this.passwordPolicy = { ...this.passwordPolicy, ...newPolicy }
  }

  // Security health check
  async getSecurityHealthCheck(): Promise<{
    overallHealth: 'GOOD' | 'WARNING' | 'CRITICAL'
    checks: {
      accountLockouts: { status: 'OK' | 'WARNING'; count: number }
      failedLogins: { status: 'OK' | 'WARNING'; count: number }
      securityEvents: { status: 'OK' | 'WARNING'; criticalCount: number }
      passwordExpiry: { status: 'OK' | 'WARNING'; expiredCount: number }
    }
  }> {
    // This would perform comprehensive security health check
    return {
      overallHealth: 'GOOD',
      checks: {
        accountLockouts: { status: 'OK', count: 0 },
        failedLogins: { status: 'OK', count: 0 },
        securityEvents: { status: 'OK', criticalCount: 0 },
        passwordExpiry: { status: 'OK', expiredCount: 0 }
      }
    }
  }
}