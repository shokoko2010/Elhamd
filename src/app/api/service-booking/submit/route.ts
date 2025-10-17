import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      email, 
      phone, 
      vehicleType, 
      serviceType, 
      preferredDate, 
      preferredTime, 
      message 
    } = body

    // Validate required fields
    if (!name || !email || !phone || !vehicleType || !serviceType || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صالح' },
        { status: 400 }
      )
    }

    // Save to database
    const serviceBooking = await db.serviceBookingSubmission.create({
      data: {
        name,
        email,
        phone,
        vehicleType,
        serviceType,
        preferredDate: new Date(preferredDate),
        preferredTime,
        message: message || '',
        status: 'PENDING',
        submittedAt: new Date()
      }
    })

    // Send email notification
    try {
      const emailHtml = emailService.generateServiceBookingEmail({
        name,
        email,
        phone,
        vehicleType,
        serviceType,
        preferredDate,
        preferredTime,
        message: message || ''
      })

      await emailService.sendEmail({
        to: 'admin@elhamdimport.online',
        subject: `حجز خدمة جديد - ${name}`,
        html: emailHtml,
        text: `
          حجز خدمة جديد:
          
          الاسم: ${name}
          البريد الإلكتروني: ${email}
          الهاتف: ${phone}
          نوع المركبة: ${vehicleType}
          نوع الخدمة: ${serviceType}
          التاريخ المفضل: ${preferredDate}
          الوقت المفضل: ${preferredTime}
          ملاحظات: ${message || 'لا توجد'}
          
          التاريخ: ${new Date().toLocaleString('ar-EG')}
        `
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'تم حجز الخدمة بنجاح',
      id: serviceBooking.id
    })

  } catch (error) {
    console.error('Error submitting service booking:', error)
    return NextResponse.json(
      { error: 'فشل في حجز الخدمة. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    )
  }
}