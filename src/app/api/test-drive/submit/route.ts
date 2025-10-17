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
      vehicleId, 
      vehicleModel, 
      preferredDate, 
      preferredTime, 
      message 
    } = body

    // Validate required fields
    if (!name || !email || !phone || !vehicleId || !vehicleModel || !preferredDate || !preferredTime) {
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
    const testDriveBooking = await db.testDriveSubmission.create({
      data: {
        name,
        email,
        phone,
        vehicleId,
        vehicleModel,
        preferredDate: new Date(preferredDate),
        preferredTime,
        message: message || '',
        status: 'PENDING',
        submittedAt: new Date()
      }
    })

    // Send email notification
    try {
      const emailHtml = emailService.generateTestDriveEmail({
        name,
        email,
        phone,
        vehicleId,
        vehicleModel,
        preferredDate,
        preferredTime,
        message: message || ''
      })

      await emailService.sendEmail({
        to: 'admin@elhamdimport.online',
        subject: `طلب تجربة قيادة جديد - ${name}`,
        html: emailHtml,
        text: `
          طلب تجربة قيادة جديد:
          
          الاسم: ${name}
          البريد الإلكتروني: ${email}
          الهاتف: ${phone}
          الموديل المطلوب: ${vehicleModel}
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
      message: 'تم حجز تجربة القيادة بنجاح',
      id: testDriveBooking.id
    })

  } catch (error) {
    console.error('Error submitting test drive booking:', error)
    return NextResponse.json(
      { error: 'فشل في حجز تجربة القيادة. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    )
  }
}