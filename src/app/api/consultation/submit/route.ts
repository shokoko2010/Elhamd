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
      consultationType, 
      preferredDate, 
      preferredTime, 
      message 
    } = body

    // Validate required fields
    if (!name || !email || !phone || !consultationType || !preferredDate || !preferredTime) {
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
    const consultationBooking = await db.consultationSubmission.create({
      data: {
        name,
        email,
        phone,
        consultationType,
        preferredDate: new Date(preferredDate),
        preferredTime,
        message: message || '',
        status: 'PENDING',
        submittedAt: new Date()
      }
    })

    // Send email notification
    try {
      const emailHtml = emailService.generateConsultationEmail({
        name,
        email,
        phone,
        consultationType,
        preferredDate,
        preferredTime,
        message: message || ''
      })

      await emailService.sendEmail({
        to: 'admin@elhamdimport.online',
        subject: `طلب استشارة جديد - ${name}`,
        html: emailHtml,
        text: `
          طلب استشارة جديد:
          
          الاسم: ${name}
          البريد الإلكتروني: ${email}
          الهاتف: ${phone}
          نوع الاستشارة: ${consultationType}
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
      message: 'تم حجز الاستشارة بنجاح',
      id: consultationBooking.id
    })

  } catch (error) {
    console.error('Error submitting consultation booking:', error)
    return NextResponse.json(
      { error: 'فشل في حجز الاستشارة. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    )
  }
}