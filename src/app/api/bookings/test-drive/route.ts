interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/booking-service'
import { EmailService } from '@/lib/email-service'
import { SecurityService } from '@/lib/security-service'
import { bookingSchemas, validationUtils } from '@/lib/validation'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export async function POST(request: NextRequest) {
  const securityService = SecurityService.getInstance()
  
  try {
    // Apply rate limiting for booking endpoints
    const rateLimitResult = await securityService.rateLimit(request, 'booking-test-drive')
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many booking requests', message: 'Please try again later' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
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
      vehicleId: securityService.sanitizeInput(body.vehicleId?.toString() || ''),
      date: body.date,
      timeSlot: securityService.sanitizeInput(body.timeSlot?.toString() || ''),
      customerInfo: {
        name: securityService.sanitizeInput(body.customerInfo?.name?.toString() || ''),
        email: securityService.sanitizeInput(body.customerInfo?.email?.toString() || '').toLowerCase(),
        phone: securityService.sanitizeInput(body.customerInfo?.phone?.toString() || ''),
        licenseNumber: securityService.sanitizeInput(body.customerInfo?.licenseNumber?.toString() || '')
      },
      message: body.message ? securityService.sanitizeInput(body.message.toString()) : undefined
    }
    
    // Validate input data
    const validation = validationUtils.validateWithDetails(bookingSchemas.testDrive, sanitizedBody)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: validation.errors },
        { status: 400 }
      )
    }

    const { 
      vehicleId, 
      date, 
      timeSlot, 
      customerInfo,
      message 
    } = validation.data

    // Additional security checks
    if (!securityService.preventSqlInjection(vehicleId) || 
        !securityService.preventSqlInjection(timeSlot) ||
        (message && !securityService.preventSqlInjection(message))) {
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }

    // Create booking using service
    const bookingService = BookingService.getInstance()
    const booking = await bookingService.createTestDriveBooking({
      vehicleId,
      date: new Date(date),
      timeSlot,
      customerInfo,
      message
    })

    // Send email notifications
    const emailService = EmailService.getInstance()
    
    // Send confirmation to customer
    await emailService.sendBookingConfirmation({
      customerName: booking.customer.name,
      customerEmail: booking.customer.email,
      bookingType: 'test-drive',
      vehicle: {
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        year: booking.vehicle.year
      },
      date: format(new Date(date), 'PPP', { locale: ar }),
      timeSlot,
      bookingId: booking.id
    })

    // Send notification to admin
    await emailService.sendAdminNotification({
      customerName: booking.customer.name,
      customerEmail: booking.customer.email,
      bookingType: 'test-drive',
      vehicle: {
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        year: booking.vehicle.year
      },
      date: format(new Date(date), 'PPP', { locale: ar }),
      timeSlot,
      bookingId: booking.id
    })

    // Create response with security headers
    const response = NextResponse.json({ 
      booking: {
        id: booking.id,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
        customer: {
          name: booking.customer.name,
          email: booking.customer.email,
          phone: booking.customer.phone
        },
        vehicle: {
          make: booking.vehicle.make,
          model: booking.vehicle.model,
          year: booking.vehicle.year
        }
      }
    }, { status: 201 })

    // Apply security headers
    const securedResponse = securityService.addSecurityHeaders(response)
    const corsResponse = securityService.handleCors(request, securedResponse)
    
    // Add rate limit headers
    corsResponse.headers.set('X-RateLimit-Limit', '20')
    corsResponse.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    corsResponse.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())

    return corsResponse
  } catch (error) {
    console.error('Error creating test drive booking:', error)
    
    if (error instanceof Error) {
      // Don't expose internal error details to client
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'فشل في إنشاء حجز القيادة التجريبية'
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'فشل في إنشاء حجز القيادة التجريبية' },
      { status: 500 }
    )
  }
}