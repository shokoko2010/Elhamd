import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, department } = body

    // Validate required fields
    if (!name || !email || !phone || !message) {
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
    const contactSubmission = await db.contactSubmission.create({
      data: {
        name,
        email,
        phone,
        subject: subject || 'استفسار عام',
        message,
        department: department || 'general',
        status: 'PENDING',
        submittedAt: new Date()
      }
    })

    // Send email notification
    try {
      const emailHtml = emailService.generateContactEmail({
        name,
        email,
        phone,
        subject: subject || 'استفسار عام',
        message,
        department: department || 'general'
      })

      await emailService.sendEmail({
        to: 'admin@elhamdimport.online',
        subject: `رسالة جديدة من صفحة اتصل بنا - ${name}`,
        html: emailHtml,
        text: `
          رسالة جديدة من صفحة اتصل بنا:
          
          الاسم: ${name}
          البريد الإلكتروني: ${email}
          الهاتف: ${phone}
          القسم: ${department || 'عام'}
          الموضوع: ${subject || 'استفسار عام'}
          الرسالة: ${message}
          
          التاريخ: ${new Date().toLocaleString('ar-EG')}
        `
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح',
      id: contactSubmission.id
    })

  } catch (error) {
    console.error('Error submitting contact form:', error)
    return NextResponse.json(
      { error: 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    )
  }
}