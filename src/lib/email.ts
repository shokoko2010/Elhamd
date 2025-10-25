import nodemailer from 'nodemailer'

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject?: string
  message: string
  department?: string
}

interface ServiceBookingData {
  name: string
  email: string
  phone: string
  vehicleType: string
  serviceType: string
  preferredDate: string
  preferredTime: string
  message?: string
}

interface TestDriveData {
  name: string
  email: string
  phone: string
  vehicleId: string
  vehicleModel: string
  preferredDate: string
  preferredTime: string
  message?: string
}

interface ConsultationData {
  name: string
  email: string
  phone: string
  consultationType: string
  preferredDate: string
  preferredTime: string
  message?: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    try {
      // Only initialize if email configuration is available
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn('Email configuration missing. Email functionality will be disabled.')
        return
      }

      // Create transporter using environment variables
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    } catch (error) {
      console.error('Failed to initialize email transporter:', error)
    }
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email transporter not initialized - skipping email send')
      return false
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      }

      const result = await this.transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  generateContactEmail(data: ContactFormData): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>رسالة جديدة من صفحة اتصل بنا</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #374151; }
          .value { color: #6b7280; }
          .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>رسالة جديدة من صفحة اتصل بنا</h1>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">الاسم:</span>
              <span class="value">${data.name}</span>
            </div>
            <div class="field">
              <span class="label">البريد الإلكتروني:</span>
              <span class="value">${data.email}</span>
            </div>
            <div class="field">
              <span class="label">الهاتف:</span>
              <span class="value">${data.phone}</span>
            </div>
            <div class="field">
              <span class="label">القسم:</span>
              <span class="value">${data.department || 'عام'}</span>
            </div>
            <div class="field">
              <span class="label">الموضوع:</span>
              <span class="value">${data.subject || 'استفسار عام'}</span>
            </div>
            <div class="field">
              <span class="label">الرسالة:</span>
              <span class="value">${data.message}</span>
            </div>
            <div class="field">
              <span class="label">التاريخ:</span>
              <span class="value">${new Date().toLocaleString('ar-EG')}</span>
            </div>
          </div>
          <div class="footer">
            <p>هذه الرسالة أرسلت من موقع الحمد للسيارات</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  generateServiceBookingEmail(data: ServiceBookingData): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>حجز خدمة جديد</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #374151; }
          .value { color: #6b7280; }
          .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>حجز خدمة جديد</h1>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">الاسم:</span>
              <span class="value">${data.name}</span>
            </div>
            <div class="field">
              <span class="label">البريد الإلكتروني:</span>
              <span class="value">${data.email}</span>
            </div>
            <div class="field">
              <span class="label">الهاتف:</span>
              <span class="value">${data.phone}</span>
            </div>
            <div class="field">
              <span class="label">نوع المركبة:</span>
              <span class="value">${data.vehicleType}</span>
            </div>
            <div class="field">
              <span class="label">نوع الخدمة:</span>
              <span class="value">${data.serviceType}</span>
            </div>
            <div class="field">
              <span class="label">التاريخ المفضل:</span>
              <span class="value">${data.preferredDate}</span>
            </div>
            <div class="field">
              <span class="label">الوقت المفضل:</span>
              <span class="value">${data.preferredTime}</span>
            </div>
            ${data.message ? `
            <div class="field">
              <span class="label">ملاحظات إضافية:</span>
              <span class="value">${data.message}</span>
            </div>
            ` : ''}
            <div class="field">
              <span class="label">التاريخ:</span>
              <span class="value">${new Date().toLocaleString('ar-EG')}</span>
            </div>
          </div>
          <div class="footer">
            <p>هذا الحجز أرسل من موقع الحمد للسيارات</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  generateTestDriveEmail(data: TestDriveData): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>طلب تجربة قيادة جديد</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #374151; }
          .value { color: #6b7280; }
          .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>طلب تجربة قيادة جديد</h1>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">الاسم:</span>
              <span class="value">${data.name}</span>
            </div>
            <div class="field">
              <span class="label">البريد الإلكتروني:</span>
              <span class="value">${data.email}</span>
            </div>
            <div class="field">
              <span class="label">الهاتف:</span>
              <span class="value">${data.phone}</span>
            </div>
            <div class="field">
              <span class="label">الموديل المطلوب:</span>
              <span class="value">${data.vehicleModel}</span>
            </div>
            <div class="field">
              <span class="label">التاريخ المفضل:</span>
              <span class="value">${data.preferredDate}</span>
            </div>
            <div class="field">
              <span class="label">الوقت المفضل:</span>
              <span class="value">${data.preferredTime}</span>
            </div>
            ${data.message ? `
            <div class="field">
              <span class="label">ملاحظات إضافية:</span>
              <span class="value">${data.message}</span>
            </div>
            ` : ''}
            <div class="field">
              <span class="label">التاريخ:</span>
              <span class="value">${new Date().toLocaleString('ar-EG')}</span>
            </div>
          </div>
          <div class="footer">
            <p>هذا الطلب أرسل من موقع الحمد للسيارات</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  generateConsultationEmail(data: ConsultationData): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>طلب استشارة جديد</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #374151; }
          .value { color: #6b7280; }
          .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>طلب استشارة جديد</h1>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">الاسم:</span>
              <span class="value">${data.name}</span>
            </div>
            <div class="field">
              <span class="label">البريد الإلكتروني:</span>
              <span class="value">${data.email}</span>
            </div>
            <div class="field">
              <span class="label">الهاتف:</span>
              <span class="value">${data.phone}</span>
            </div>
            <div class="field">
              <span class="label">نوع الاستشارة:</span>
              <span class="value">${data.consultationType}</span>
            </div>
            <div class="field">
              <span class="label">التاريخ المفضل:</span>
              <span class="value">${data.preferredDate}</span>
            </div>
            <div class="field">
              <span class="label">الوقت المفضل:</span>
              <span class="value">${data.preferredTime}</span>
            </div>
            ${data.message ? `
            <div class="field">
              <span class="label">ملاحظات إضافية:</span>
              <span class="value">${data.message}</span>
            </div>
            ` : ''}
            <div class="field">
              <span class="label">التاريخ:</span>
              <span class="value">${new Date().toLocaleString('ar-EG')}</span>
            </div>
          </div>
          <div class="footer">
            <p>هذا الطلب أرسل من موقع الحمد للسيارات</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  async sendContactForm(data: ContactFormData): Promise<boolean> {
    const subject = `رسالة جديدة من صفحة اتصل بنا: ${data.subject || 'استفسار عام'}`
    const html = this.generateContactEmail(data)
    
    return this.sendEmail({
      to: process.env.SMTP_USER || 'info@elhamd.com', // Send to company email
      subject,
      html
    })
  }

  async sendServiceBooking(data: ServiceBookingData): Promise<boolean> {
    const subject = `حجز خدمة جديد: ${data.serviceType}`
    const html = this.generateServiceBookingEmail(data)
    
    return this.sendEmail({
      to: process.env.SMTP_USER || 'info@elhamd.com', // Send to company email
      subject,
      html
    })
  }

  async sendTestDriveRequest(data: TestDriveData): Promise<boolean> {
    const subject = `طلب تجربة قيادة: ${data.vehicleModel}`
    const html = this.generateTestDriveEmail(data)
    
    return this.sendEmail({
      to: process.env.SMTP_USER || 'info@elhamd.com', // Send to company email
      subject,
      html
    })
  }

  async sendConsultationRequest(data: ConsultationData): Promise<boolean> {
    const subject = `طلب استشارة جديد: ${data.consultationType}`
    const html = this.generateConsultationEmail(data)
    
    return this.sendEmail({
      to: process.env.SMTP_USER || 'info@elhamd.com', // Send to company email
      subject,
      html
    })
  }

  async sendBookingConfirmation(bookingId: string, customerEmail: string, customerName: string): Promise<boolean> {
    const subject = 'تأكيد حجز الخدمة - الحمد للسيارات'
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تأكيد حجز الخدمة</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>تأكيد حجز الخدمة</h1>
          </div>
          <div class="content">
            <p>عزيزي/عزيزتي ${customerName}،</p>
            <p>نشكرك على حجزك معنا. تم استلام طلبك بنجاح وسنقوم بالتواصل معك قريباً لتأكيد التفاصيل.</p>
            <p><strong>رقم الحجز:</strong> ${bookingId}</p>
            <p>في حال كان لديك أي استفسار، لا تتردد في التواصل معنا.</p>
            <p>مع أطيب التحيات،<br/>فريق الحمد للسيارات</p>
          </div>
          <div class="footer">
            <p>هذه الرسالة أرسلت من موقع الحمد للسيارات</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    return this.sendEmail({
      to: customerEmail,
      subject,
      html
    })
  }
}

export const emailService = new EmailService()
export default emailService