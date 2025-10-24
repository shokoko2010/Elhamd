interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SecurityService } from '@/lib/security-service'
import { userSchemas, validationUtils } from '@/lib/validation'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  const securityService = SecurityService.getInstance()
  
  try {
    // Apply rate limiting for registration
    const rateLimitResult = await securityService.rateLimit(request, 'register')
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts', message: 'Please try again later' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Get and validate request body
    const body = await request.json()
    
    // Sanitize input data
    const sanitizedBody = {
      name: securityService.sanitizeInput(body.name?.toString() || ''),
      email: securityService.sanitizeInput(body.email?.toString() || '').toLowerCase(),
      phone: body.phone ? securityService.sanitizeInput(body.phone.toString()) : undefined,
      password: body.password?.toString() || '',
      confirmPassword: body.confirmPassword?.toString() || '',
      licenseNumber: body.licenseNumber ? securityService.sanitizeInput(body.licenseNumber.toString()) : undefined
    }
    
    // Validate input data
    const validation = validationUtils.validateWithDetails(userSchemas.register, sanitizedBody)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: validation.errors },
        { status: 400 }
      )
    }

    const { name, email, phone, password, licenseNumber } = validation.data

    // Additional security checks
    if (!securityService.preventSqlInjection(name) || 
        !securityService.preventSqlInjection(email) ||
        (phone && !securityService.preventSqlInjection(phone)) ||
        (licenseNumber && !securityService.preventSqlInjection(licenseNumber))) {
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordStrength = securityService.validatePasswordStrength(password)
    if (passwordStrength.score < 3) {
      return NextResponse.json(
        { error: 'Password too weak', feedback: passwordStrength.feedback },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Check if phone number is already used (if provided)
    if (phone) {
      const existingPhone = await db.user.findUnique({
        where: { phone }
      })
      
      if (existingPhone) {
        return NextResponse.json(
          { error: 'رقم الهاتف مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }
    
    // Hash password with bcrypt (more secure than the basic hash in security service)
    const hashedPassword = await bcrypt.hash(password, 12) // Increased salt rounds
    
    // Create user with additional security fields
    const user = await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: UserRole.CUSTOMER,
        isActive: true,
        emailVerified: false, // Require email verification
        lastLoginAt: new Date(),
        securitySettings: {
          twoFactorEnabled: false,
          loginNotifications: true,
          passwordExpiryDays: 90,
          lastPasswordChange: new Date().toISOString(),
          failedLoginAttempts: 0,
          accountLocked: false
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true
      }
    })

    // Log security event
    try {
      await db.securityLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          details: {
            email: user.email,
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch (logError) {
      console.error('Failed to log security event:', logError)
      // Don't fail the registration if logging fails
    }
    
    // Create response with security headers
    const response = NextResponse.json({
      message: 'تم إنشاء الحساب بنجاح',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      }
    })

    // Apply security headers
    const securedResponse = securityService.addSecurityHeaders(response)
    const corsResponse = securityService.handleCors(request, securedResponse)
    
    // Add rate limit headers
    corsResponse.headers.set('X-RateLimit-Limit', '5')
    corsResponse.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    corsResponse.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())

    return corsResponse
    
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error) {
      // Don't expose internal error details to client
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'حدث خطأ أثناء إنشاء الحساب'
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
}