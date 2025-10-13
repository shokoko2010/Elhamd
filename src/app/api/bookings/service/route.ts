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
    // Apply rate limiting for service booking endpoints
    const rateLimitResult = await securityService.rateLimit(request, 'booking-service')
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
      vehicleId: body.vehicleId ? securityService.sanitizeInput(body.vehicleId.toString()) : undefined,
      serviceType: securityService.sanitizeInput(body.serviceType?.toString() || ''),
      date: body.date,
      timeSlot: securityService.sanitizeInput(body.timeSlot?.toString() || ''),
      customerInfo: {
        name: securityService.sanitizeInput(body.customerInfo?.name?.toString() || ''),
        email: securityService.sanitizeInput(body.customerInfo?.email?.toString() || '').toLowerCase(),
        phone: securityService.sanitizeInput(body.customerInfo?.phone?.toString() || ''),
        licenseNumber: body.customerInfo?.licenseNumber ? securityService.sanitizeInput(body.customerInfo.licenseNumber.toString()) : undefined
      },
      message: body.message ? securityService.sanitizeInput(body.message.toString()) : undefined,
      urgency: body.urgency
    }
    
    // Validate input data
    const validation = validationUtils.validateWithDetails(bookingSchemas.service, sanitizedBody)
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: validation.errors || ['Invalid data'] },
        { status: 400 }
      )
    }

    const { 
      vehicleId, 
      serviceType, 
      date, 
      timeSlot, 
      customerInfo,
      message,
      urgency
    } = validation.data

    // Additional security checks
    if (!securityService.preventSqlInjection(serviceType) || 
        !securityService.preventSqlInjection(timeSlot) ||
        (vehicleId && !securityService.preventSqlInjection(vehicleId)) ||
        (message && !securityService.preventSqlInjection(message))) {
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }

    // Create booking using service
    const bookingService = BookingService.getInstance()
    const result = await bookingService.createServiceBooking({
      vehicleId,
      serviceTypeIds: [serviceType], // Convert single service type to array
      date: new Date(date),
      timeSlot,
      customerInfo,
      message,
      urgency
    })

    const { bookings, totalPrice } = result

    // Send email notifications
    const emailService = EmailService.getInstance()
    
    // Get service names for email
    const serviceNames = bookings.map(booking => booking.serviceType.name)
    
    // Send confirmation to customer
    await emailService.sendBookingConfirmation({
      customerName: bookings[0].customer.name,
      customerEmail: bookings[0].customer.email,
      bookingType: 'service',
      vehicleInfo: bookings[0].vehicle ? 
        `${bookings[0].vehicle.make} ${bookings[0].vehicle.model} (${bookings[0].vehicle.year})` : 
        undefined,
      date: format(new Date(date), 'PPP', { locale: ar }),
      time: timeSlot,
      services: serviceNames
    })

    // Send notification to admin
    await emailService.sendAdminNotification({
      customerName: bookings[0].customer.name,
      customerEmail: bookings[0].customer.email,
      bookingType: 'service',
      vehicleInfo: bookings[0].vehicle ? 
        `${bookings[0].vehicle.make} ${bookings[0].vehicle.model} (${bookings[0].vehicle.year})` : 
        undefined,
      date: format(new Date(date), 'PPP', { locale: ar }),
      time: timeSlot,
      services: serviceNames
    })

    // Create response with security headers
    const response = NextResponse.json({ 
      bookings: bookings.map(booking => ({
        id: booking.id,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
        customer: {
          name: booking.customer.name,
          email: booking.customer.email,
          phone: booking.customer.phone
        },
        vehicle: booking.vehicle ? {
          make: booking.vehicle.make,
          model: booking.vehicle.model,
          year: booking.vehicle.year
        } : null,
        serviceType: {
          name: booking.serviceType.name,
          category: booking.serviceType.category,
          duration: booking.serviceType.duration
        }
      })),
      totalPrice
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
    console.error('Error creating service booking:', error)
    
    if (error instanceof Error) {
      // Don't expose internal error details to client
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'فشل في إنشاء حجز الخدمة'
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'فشل في إنشاء حجز الخدمة' },
      { status: 500 }
    )
  }
}