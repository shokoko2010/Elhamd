import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailService } from '@/lib/email'
import { apiMiddleware } from '@/lib/api-middleware'

export const POST = apiMiddleware.withPublicAuth(
  async (request: NextRequest, context: any) => {
    const { body } = context
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
  },
  {
    rateLimit: { endpoint: 'test-drive', limit: 3 }, // 3 submissions per hour
    sanitizeInput: true
  }
)