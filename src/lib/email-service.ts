import { db } from '@/lib/db'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface BookingConfirmationData {
  customerName: string
  customerEmail: string
  bookingType: 'test-drive' | 'service'
  vehicle?: {
    make: string
    model: string
    year: number
  }
  date: string
  timeSlot: string
  bookingId: string
  services?: string[]
  totalPrice?: number
}

export interface AdminNotificationData {
  customerName: string
  customerEmail: string
  bookingType: 'test-drive' | 'service'
  vehicle?: {
    make: string
    model: string
    year: number
  }
  date: string
  timeSlot: string
  bookingId: string
  services?: string[]
  totalPrice?: number
}

export class EmailService {
  private static instance: EmailService

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendBookingConfirmation(data: BookingConfirmationData) {
    const template = this.getBookingConfirmationTemplate(data)
    
    try {
      // In a real implementation, this would use a service like SendGrid, Mailgun, or AWS SES
      console.log('Sending booking confirmation email:', {
        to: data.customerEmail,
        subject: template.subject,
        html: template.html
      })

      // Create notification record
      await db.notification.create({
        data: {
          type: 'BOOKING_CONFIRMATION',
          title: 'تأكيد الحجز',
          message: `تم تأكيد حجز ${data.bookingType === 'test-drive' ? 'قيادة تجريبية' : 'خدمة'} بنجاح`,
          status: 'SENT',
          channel: 'EMAIL',
          recipient: data.customerEmail,
          sentAt: new Date()
        }
      })

      return { success: true, message: 'Email sent successfully' }
    } catch (error) {
      console.error('Failed to send booking confirmation:', error)
      
      // Create failed notification record
      await db.notification.create({
        data: {
          type: 'BOOKING_CONFIRMATION',
          title: 'فشل إرسال تأكيد الحجز',
          message: `فشل إرسال بريد تأكيد الحجز إلى ${data.customerEmail}`,
          status: 'FAILED',
          channel: 'EMAIL',
          recipient: data.customerEmail
        }
      })

      return { success: false, message: 'Failed to send email' }
    }
  }

  async sendAdminNotification(data: AdminNotificationData) {
    const template = this.getAdminNotificationTemplate(data)
    
    try {
      // Get admin emails
      const admins = await db.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPER_ADMIN']
          },
          isActive: true
        }
      })

      for (const admin of admins) {
        if (admin.email) {
          console.log('Sending admin notification email:', {
            to: admin.email,
            subject: template.subject,
            html: template.html
          })

          // Create notification record
          await db.notification.create({
            data: {
              userId: admin.id,
              type: 'BOOKING_CONFIRMATION',
              title: 'حجز جديد',
              message: `حجز ${data.bookingType === 'test-drive' ? 'قيادة تجريبية' : 'خدمة'} جديد من ${data.customerName}`,
              status: 'SENT',
              channel: 'EMAIL',
              recipient: admin.email,
              sentAt: new Date()
            }
          })
        }
      }

      return { success: true, message: 'Admin notifications sent successfully' }
    } catch (error) {
      console.error('Failed to send admin notification:', error)
      return { success: false, message: 'Failed to send admin notifications' }
    }
  }

  async sendBookingReminder(bookingId: string, bookingType: 'test-drive' | 'service') {
    try {
      let booking
      if (bookingType === 'test-drive') {
        booking = await db.testDriveBooking.findFirst({
          where: { id: bookingId },
          include: {
            customer: true,
            vehicle: true
          }
        })
      } else {
        booking = await db.serviceBooking.findFirst({
          where: { id: bookingId },
          include: {
            customer: true,
            vehicle: true,
            serviceType: true
          }
        })
      }

      if (!booking) {
        throw new Error('Booking not found')
      }

      const template = this.getBookingReminderTemplate(booking, bookingType)
      
      console.log('Sending booking reminder email:', {
        to: booking.customer.email,
        subject: template.subject,
        html: template.html
      })

      // Update notification status
      await db.notification.updateMany({
        where: {
          metadata: {
            path: '$.bookingId',
            equals: bookingId
          },
          type: 'BOOKING_REMINDER',
          status: 'PENDING'
        },
        data: {
          status: 'SENT',
          sentAt: new Date()
        }
      })

      return { success: true, message: 'Reminder sent successfully' }
    } catch (error) {
      console.error('Failed to send booking reminder:', error)
      return { success: false, message: 'Failed to send reminder' }
    }
  }

  async sendCancellationNotification(bookingId: string, bookingType: 'test-drive' | 'service', reason: string) {
    try {
      let booking
      if (bookingType === 'test-drive') {
        booking = await db.testDriveBooking.findFirst({
          where: { id: bookingId },
          include: {
            customer: true,
            vehicle: true
          }
        })
      } else {
        booking = await db.serviceBooking.findFirst({
          where: { id: bookingId },
          include: {
            customer: true,
            vehicle: true,
            serviceType: true
          }
        })
      }

      if (!booking) {
        throw new Error('Booking not found')
      }

      const template = this.getCancellationTemplate(booking, bookingType, reason)
      
      console.log('Sending cancellation email:', {
        to: booking.customer.email,
        subject: template.subject,
        html: template.html
      })

      // Create notification record
      await db.notification.create({
        data: {
          type: 'BOOKING_CANCELLATION',
          title: 'إلغاء الحجز',
          message: `تم إلغاء حجز ${bookingType === 'test-drive' ? 'قيادة تجريبية' : 'خدمة'}`,
          status: 'SENT',
          channel: 'EMAIL',
          recipient: booking.customer.email,
          sentAt: new Date()
        }
      })

      return { success: true, message: 'Cancellation notification sent successfully' }
    } catch (error) {
      console.error('Failed to send cancellation notification:', error)
      return { success: false, message: 'Failed to send cancellation notification' }
    }
  }

  private getBookingConfirmationTemplate(data: BookingConfirmationData): EmailTemplate {
    const isTestDrive = data.bookingType === 'test-drive'
    const subject = isTestDrive 
      ? 'تأكيد حجز القيادة التجريبية - الحمد للسيارات'
      : 'تأكيد حجز الخدمة - الحمد للسيارات'

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .booking-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .cta-button { background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>الحمد للسيارات</h1>
            <p>الوكيل الرسمي المعتمد لسيارات تاتا في مصر</p>
          </div>
          
          <div class="content">
            <h2>مرحباً ${data.customerName}،</h2>
            <p>نشكرك على حجزك ${isTestDrive ? 'تجربة قيادة' : 'خدمة'} مع الحمد للسيارات. تم تأكيد حجزك بنجاح!</p>
            
            <div class="booking-details">
              <h3>تفاصيل الحجز:</h3>
              <div class="detail-row">
                <span class="detail-label">رقم الحجز:</span>
                <span>${data.bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">نوع الحجز:</span>
                <span>${isTestDrive ? 'قيادة تجريبية' : 'خدمة'}</span>
              </div>
              ${data.vehicle ? `
              <div class="detail-row">
                <span class="detail-label">المركبة:</span>
                <span>${data.vehicle.make} ${data.vehicle.model} (${data.vehicle.year})</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">التاريخ:</span>
                <span>${data.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الوقت:</span>
                <span>${data.timeSlot}</span>
              </div>
              ${data.services ? `
              <div class="detail-row">
                <span class="detail-label">الخدمات:</span>
                <span>${data.services.join(', ')}</span>
              </div>
              ` : ''}
              ${data.totalPrice ? `
              <div class="detail-row">
                <span class="detail-label">الإجمالي:</span>
                <span>${data.totalPrice.toLocaleString('ar-EG')} ج.م</span>
              </div>
              ` : ''}
            </div>
            
            <p>يرجى الحضور قبل الموعد بـ 15 دقيقة. في حالة عدم تمكنك من الحضور، يرجى إلغاء الحجز قبل 24 ساعة من الموعد.</p>
            
            <a href="#" class="cta-button">عرض تفاصيل الحجز</a>
            
            <p>للاستفسارات، يمكنك الاتصال بنا على:</p>
            <p>📞 +20 2 1234 5678</p>
            <p>📧 info@elhamd-cars.com</p>
            
            <div class="footer">
              <p>&copy; 2024 الحمد للسيارات. جميع الحقوق محفوظة.</p>
              <p>القاهرة، مصر</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      الحمد للسيارات - الوكيل الرسمي المعتمد لسيارات تاتا في مصر
      
      مرحباً ${data.customerName}،
      
      نشكرك على حجزك ${isTestDrive ? 'تجربة قيادة' : 'خدمة'} مع الحمد للسيارات. تم تأكيد حجزك بنجاح!
      
      تفاصيل الحجز:
      رقم الحجز: ${data.bookingId}
      نوع الحجز: ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'}
      ${data.vehicle ? `المركبة: ${data.vehicle.make} ${data.vehicle.model} (${data.vehicle.year})` : ''}
      التاريخ: ${data.date}
      الوقت: ${data.timeSlot}
      ${data.services ? `الخدمات: ${data.services.join(', ')}` : ''}
      ${data.totalPrice ? `الإجمالي: ${data.totalPrice.toLocaleString('ar-EG')} ج.م` : ''}
      
      يرجى الحضور قبل الموعد بـ 15 دقيقة. في حالة عدم تمكنك من الحضور، يرجى إلغاء الحجز قبل 24 ساعة من الموعد.
      
      للاستفسارات، يمكنك الاتصال بنا على:
      📞 +20 2 1234 5678
      📧 info@elhamd-cars.com
      
      © 2024 الحمد للسيارات. جميع الحقوق محفوظة.
    `

    return { subject, html, text }
  }

  private getAdminNotificationTemplate(data: AdminNotificationData): EmailTemplate {
    const isTestDrive = data.bookingType === 'test-drive'
    const subject = `حجز ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'} جديد - ${data.customerName}`

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .booking-details { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .cta-button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>حجز جديد</h1>
            <p>نظام إدارة الحجوزات - الحمد للسيارات</p>
          </div>
          
          <div class="content">
            <h2>حجز ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'} جديد</h2>
            <p>تم استلام حجز جديد من العميل: <strong>${data.customerName}</strong></p>
            
            <div class="booking-details">
              <h3>تفاصيل الحجز:</h3>
              <div class="detail-row">
                <span class="detail-label">رقم الحجز:</span>
                <span>${data.bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">العميل:</span>
                <span>${data.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">البريد الإلكتروني:</span>
                <span>${data.customerEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">نوع الحجز:</span>
                <span>${isTestDrive ? 'قيادة تجريبية' : 'خدمة'}</span>
              </div>
              ${data.vehicle ? `
              <div class="detail-row">
                <span class="detail-label">المركبة:</span>
                <span>${data.vehicle.make} ${data.vehicle.model} (${data.vehicle.year})</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">التاريخ:</span>
                <span>${data.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الوقت:</span>
                <span>${data.timeSlot}</span>
              </div>
              ${data.services ? `
              <div class="detail-row">
                <span class="detail-label">الخدمات:</span>
                <span>${data.services.join(', ')}</span>
              </div>
              ` : ''}
              ${data.totalPrice ? `
              <div class="detail-row">
                <span class="detail-label">الإجمالي:</span>
                <span>${data.totalPrice.toLocaleString('ar-EG')} ج.م</span>
              </div>
              ` : ''}
            </div>
            
            <p>يرجى مراجعة الحجز وتأكيده في أقرب وقت ممكن.</p>
            
            <a href="#" class="cta-button">مراجعة الحجز</a>
            
            <div class="footer">
              <p>هذا رسالة آلية من نظام إدارة الحجوزات</p>
              <p>© 2024 الحمد للسيارات. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      حجز ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'} جديد - ${data.customerName}
      
      تم استلام حجز جديد من العميل: ${data.customerName}
      
      تفاصيل الحجز:
      رقم الحجز: ${data.bookingId}
      العميل: ${data.customerName}
      البريد الإلكتروني: ${data.customerEmail}
      نوع الحجز: ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'}
      ${data.vehicle ? `المركبة: ${data.vehicle.make} ${data.vehicle.model} (${data.vehicle.year})` : ''}
      التاريخ: ${data.date}
      الوقت: ${data.timeSlot}
      ${data.services ? `الخدمات: ${data.services.join(', ')}` : ''}
      ${data.totalPrice ? `الإجمالي: ${data.totalPrice.toLocaleString('ar-EG')} ج.م` : ''}
      
      يرجى مراجعة الحجز وتأكيده في أقرب وقت ممكن.
      
      هذا رسالة آلية من نظام إدارة الحجوزات
      © 2024 الحمد للسيارات. جميع الحقوق محفوظة.
    `

    return { subject, html, text }
  }

  private getBookingReminderTemplate(booking: any, bookingType: 'test-drive' | 'service'): EmailTemplate {
    const isTestDrive = bookingType === 'test-drive'
    const subject = `تذكير بحجز ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'} - الحمد للسيارات`

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #f97316); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .reminder-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .booking-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>تذكير بالحجز</h1>
            <p>الحمد للسيارات</p>
          </div>
          
          <div class="content">
            <h2>مرحباً ${booking.customer.name}،</h2>
            
            <div class="reminder-box">
              <h3>⏰ تذكير بموعدك!</h3>
              <p>لديك حجز ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'} غداً الساعة ${booking.timeSlot}</p>
            </div>
            
            <div class="booking-details">
              <h3>تفاصيل الحجز:</h3>
              <div class="detail-row">
                <span class="detail-label">رقم الحجز:</span>
                <span>${booking.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">نوع الحجز:</span>
                <span>${isTestDrive ? 'قيادة تجريبية' : 'خدمة'}</span>
              </div>
              ${booking.vehicle ? `
              <div class="detail-row">
                <span class="detail-label">المركبة:</span>
                <span>${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})</span>
              </div>
              ` : ''}
              ${booking.serviceType ? `
              <div class="detail-row">
                <span class="detail-label">الخدمة:</span>
                <span>${booking.serviceType.name}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">التاريخ:</span>
                <span>${format(booking.date, 'PPP', { locale: ar })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الوقت:</span>
                <span>${booking.timeSlot}</span>
              </div>
            </div>
            
            <p>يرجى الحضور قبل الموعد بـ 15 دقيقة. في حالة عدم تمكنك من الحضور، يرجى إلغاء الحجز قبل 24 ساعة من الموعد.</p>
            
            <p>للاستفسارات، يمكنك الاتصال بنا على:</p>
            <p>📞 +20 2 1234 5678</p>
            <p>📧 info@elhamd-cars.com</p>
            
            <div class="footer">
              <p>&copy; 2024 الحمد للسيارات. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      تذكير بحجز ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'} - الحمد للسيارات
      
      مرحباً ${booking.customer.name}،
      
      ⏰ تذكير بموعدك!
      لديك حجز ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'} غداً الساعة ${booking.timeSlot}
      
      تفاصيل الحجز:
      رقم الحجز: ${booking.id}
      نوع الحجز: ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'}
      ${booking.vehicle ? `المركبة: ${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})` : ''}
      ${booking.serviceType ? `الخدمة: ${booking.serviceType.name}` : ''}
      التاريخ: ${format(booking.date, 'PPP', { locale: ar })}
      الوقت: ${booking.timeSlot}
      
      يرجى الحضور قبل الموعد بـ 15 دقيقة. في حالة عدم تمكنك من الحضور، يرجى إلغاء الحجز قبل 24 ساعة من الموعد.
      
      للاستفسارات، يمكنك الاتصال بنا على:
      📞 +20 2 1234 5678
      📧 info@elhamd-cars.com
      
      © 2024 الحمد للسيارات. جميع الحقوق محفوظة.
    `

    return { subject, html, text }
  }

  private getCancellationTemplate(booking: any, bookingType: 'test-drive' | 'service', reason: string): EmailTemplate {
    const isTestDrive = bookingType === 'test-drive'
    const subject = `إلغاء حجز ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'} - الحمد للسيارات`

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6b7280, #9ca3af); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .cancellation-box { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .booking-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>إلغاء الحجز</h1>
            <p>الحمد للسيارات</p>
          </div>
          
          <div class="content">
            <h2>مرحباً ${booking.customer.name}،</h2>
            
            <div class="cancellation-box">
              <h3>❌ تم إلغاء حجزك</h3>
              <p>تم إلغاء حجز ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'} الخاص بك بناءً على طلبك.</p>
              <p><strong>سبب الإلغاء:</strong> ${reason}</p>
            </div>
            
            <div class="booking-details">
              <h3>تفاصيل الحجز الملغي:</h3>
              <div class="detail-row">
                <span class="detail-label">رقم الحجز:</span>
                <span>${booking.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">نوع الحجز:</span>
                <span>${isTestDrive ? 'قيادة تجريبية' : 'خدمة'}</span>
              </div>
              ${booking.vehicle ? `
              <div class="detail-row">
                <span class="detail-label">المركبة:</span>
                <span>${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})</span>
              </div>
              ` : ''}
              ${booking.serviceType ? `
              <div class="detail-row">
                <span class="detail-label">الخدمة:</span>
                <span>${booking.serviceType.name}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">التاريخ:</span>
                <span>${format(booking.date, 'PPP', { locale: ar })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الوقت:</span>
                <span>${booking.timeSlot}</span>
              </div>
            </div>
            
            <p>نأسف لإزعاجك ونتمنى أن نخدمك في المستقبل. يمكنك حجز موعد جديد في أي وقت من خلال موقعنا الإلكتروني.</p>
            
            <p>للاستفسارات، يمكنك الاتصال بنا على:</p>
            <p>📞 +20 2 1234 5678</p>
            <p>📧 info@elhamd-cars.com</p>
            
            <div class="footer">
              <p>&copy; 2024 الحمد للسيارات. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      إلغاء حجز ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'} - الحمد للسيارات
      
      مرحباً ${booking.customer.name}،
      
      ❌ تم إلغاء حجزك
      تم إلغاء حجز ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'} الخاص بك بناءً على طلبك.
      
      سبب الإلغاء: ${reason}
      
      تفاصيل الحجز الملغي:
      رقم الحجز: ${booking.id}
      نوع الحجز: ${isTestDrive ? 'قيادة تجريبية' : 'خدمة'}
      ${booking.vehicle ? `المركبة: ${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})` : ''}
      ${booking.serviceType ? `الخدمة: ${booking.serviceType.name}` : ''}
      التاريخ: ${format(booking.date, 'PPP', { locale: ar })}
      الوقت: ${booking.timeSlot}
      
      نأسف لإزعاجك ونتمنى أن نخدمك في المستقبل. يمكنك حجز موعد جديد في أي وقت من خلال موقعنا الإلكتروني.
      
      للاستفسارات، يمكنك الاتصال بنا على:
      📞 +20 2 1234 5678
      📧 info@elhamd-cars.com
      
      © 2024 الحمد للسيارات. جميع الحقوق محفوظة.
    `

    return { subject, html, text }
  }
}