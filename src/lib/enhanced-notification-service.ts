import { db } from '@/lib/db'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export interface NotificationChannel {
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP'
  enabled: boolean
  config?: Record<string, any>
}

export interface NotificationTemplate {
  id: string
  name: string
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP'
  subject?: string
  content: string
  variables: string[]
  isActive: boolean
}

export interface NotificationPayload {
  type: string
  recipient: string
  channel: NotificationChannel['type']
  templateId: string
  variables: Record<string, any>
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  scheduledAt?: Date
  metadata?: Record<string, any>
}

export interface NotificationResult {
  success: boolean
  notificationId?: string
  messageId?: string
  error?: string
  channel: NotificationChannel['type']
}

export class EnhancedNotificationService {
  private static instance: EnhancedNotificationService
  private emailService: any
  private smsService: any
  private pushService: any

  private constructor() {
    this.initializeServices()
  }

  static getInstance(): EnhancedNotificationService {
    if (!EnhancedNotificationService.instance) {
      EnhancedNotificationService.instance = new EnhancedNotificationService()
    }
    return EnhancedNotificationService.instance
  }

  private initializeServices() {
    // Initialize email service (using existing email service)
    this.emailService = {
      send: async (to: string, subject: string, html: string, text: string) => {
        try {
          // In production, integrate with SendGrid, Mailgun, or AWS SES
          return { success: true, messageId: `email_${Date.now()}` }
        } catch (error) {
          console.error('Email sending failed:', error)
          return { success: false, error: error instanceof Error ? error.message : 'Email sending failed' }
        }
      }
    }

    // Initialize SMS service (for Egyptian numbers)
    this.smsService = {
      send: async (to: string, message: string) => {
        try {
          // In production, integrate with Egyptian SMS providers like:
          // - Vodafone SMS API
          // - Etisalat SMS API  
          // - Orange SMS API
          // - Twilio for Egypt
          return { success: true, messageId: `sms_${Date.now()}` }
        } catch (error) {
          console.error('SMS sending failed:', error)
          return { success: false, error: error instanceof Error ? error.message : 'SMS sending failed' }
        }
      }
    }

    // Initialize push notification service
    this.pushService = {
      send: async (to: string, title: string, body: string, data?: any) => {
        try {
          // In production, integrate with:
          // - Firebase Cloud Messaging (FCM)
          // - Apple Push Notification Service (APNS)
          // - Web Push API
          return { success: true, messageId: `push_${Date.now()}` }
        } catch (error) {
          console.error('Push notification sending failed:', error)
          return { success: false, error: error instanceof Error ? error.message : 'Push notification failed' }
        }
      }
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // Get template
      const template = await this.getTemplate(payload.templateId)
      if (!template) {
        return {
          success: false,
          error: 'Template not found',
          channel: payload.channel
        }
      }

      // Validate template variables
      const missingVariables = template.variables.filter(v => !(v in payload.variables))
      if (missingVariables.length > 0) {
        return {
          success: false,
          error: `Missing variables: ${missingVariables.join(', ')}`,
          channel: payload.channel
        }
      }

      // Render template
      const renderedContent = this.renderTemplate(template.content, payload.variables)

      // Create notification record
      const notification = await db.notification.create({
        data: {
          type: payload.type,
          title: this.getNotificationTitle(payload.type, payload.variables),
          message: renderedContent,
          status: 'PENDING',
          channel: payload.channel,
          recipient: payload.recipient,
          priority: payload.priority,
          scheduledAt: payload.scheduledAt,
          metadata: {
            ...payload.metadata,
            templateId: payload.templateId,
            variables: payload.variables
          }
        }
      })

      // Send notification based on channel
      let result: NotificationResult

      switch (payload.channel) {
        case 'EMAIL':
          result = await this.sendEmailNotification(notification, payload.variables)
          break
        case 'SMS':
          result = await this.sendSMSNotification(notification, payload.variables)
          break
        case 'PUSH':
          result = await this.sendPushNotification(notification, payload.variables)
          break
        case 'WHATSAPP':
          result = await this.sendWhatsAppNotification(notification, payload.variables)
          break
        default:
          result = {
            success: false,
            error: 'Unsupported notification channel',
            channel: payload.channel
          }
      }

      // Update notification status
      await db.notification.update({
        where: { id: notification.id },
        data: {
          status: result.success ? 'SENT' : 'FAILED',
          messageId: result.messageId,
          sentAt: result.success ? new Date() : null,
          error: result.error
        }
      })

      return {
        ...result,
        notificationId: notification.id
      }
    } catch (error) {
      console.error('Notification sending failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Notification sending failed',
        channel: payload.channel
      }
    }
  }

  async sendMultiChannelNotification(
    recipient: string,
    channels: NotificationChannel['type'][],
    templateId: string,
    variables: Record<string, any>,
    priority: NotificationPayload['priority'] = 'MEDIUM'
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = []

    for (const channel of channels) {
      const payload: NotificationPayload = {
        type: 'MULTI_CHANNEL',
        recipient,
        channel,
        templateId,
        variables,
        priority,
        metadata: { multiChannel: true }
      }

      const result = await this.sendNotification(payload)
      results.push(result)
    }

    return results
  }

  async sendBulkNotification(
    recipients: string[],
    channel: NotificationChannel['type'],
    templateId: string,
    variables: Record<string, any>,
    priority: NotificationPayload['priority'] = 'MEDIUM'
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = []

    for (const recipient of recipients) {
      const payload: NotificationPayload = {
        type: 'BULK',
        recipient,
        channel,
        templateId,
        variables,
        priority,
        metadata: { bulk: true }
      }

      const result = await this.sendNotification(payload)
      results.push(result)
    }

    return results
  }

  async scheduleNotification(
    payload: Omit<NotificationPayload, 'scheduledAt'>,
    scheduledAt: Date
  ): Promise<NotificationResult> {
    const scheduledPayload: NotificationPayload = {
      ...payload,
      scheduledAt
    }

    return await this.sendNotification(scheduledPayload)
  }

  async sendBookingConfirmation(bookingData: any): Promise<NotificationResult[]> {
    const channels: NotificationChannel['type'][] = ['EMAIL', 'SMS']
    const variables = {
      customerName: bookingData.customerName,
      bookingType: bookingData.bookingType,
      vehicleMake: bookingData.vehicle?.make,
      vehicleModel: bookingData.vehicle?.model,
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      bookingId: bookingData.bookingId,
      totalPrice: bookingData.totalPrice
    }

    return await this.sendMultiChannelNotification(
      bookingData.customerEmail,
      channels,
      'BOOKING_CONFIRMATION',
      variables,
      'HIGH'
    )
  }

  async sendPaymentConfirmation(paymentData: any): Promise<NotificationResult[]> {
    const channels: NotificationChannel['type'][] = ['EMAIL', 'SMS']
    const variables = {
      customerName: paymentData.customerName,
      amount: paymentData.amount,
      currency: paymentData.currency || 'EGP',
      transactionId: paymentData.transactionId,
      bookingType: paymentData.bookingType,
      bookingId: paymentData.bookingId
    }

    return await this.sendMultiChannelNotification(
      paymentData.customerEmail,
      channels,
      'PAYMENT_CONFIRMATION',
      variables,
      'HIGH'
    )
  }

  async sendBookingReminder(bookingData: any): Promise<NotificationResult[]> {
    const channels: NotificationChannel['type'][] = ['SMS', 'EMAIL']
    const variables = {
      customerName: bookingData.customerName,
      bookingType: bookingData.bookingType,
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      vehicleMake: bookingData.vehicle?.make,
      vehicleModel: bookingData.vehicle?.model
    }

    return await this.sendMultiChannelNotification(
      bookingData.customerEmail,
      channels,
      'BOOKING_REMINDER',
      variables,
      'MEDIUM'
    )
  }

  async sendPromotionalNotification(
    recipients: string[],
    promotionData: any
  ): Promise<NotificationResult[]> {
    const variables = {
      title: promotionData.title,
      description: promotionData.description,
      discount: promotionData.discount,
      validUntil: promotionData.validUntil,
      promoCode: promotionData.promoCode
    }

    return await this.sendBulkNotification(
      recipients,
      'EMAIL',
      'PROMOTIONAL_OFFER',
      variables,
      'LOW'
    )
  }

  private async sendEmailNotification(
    notification: any,
    variables: Record<string, any>
  ): Promise<NotificationResult> {
    const subject = this.getEmailSubject(notification.type, variables)
    const { html, text } = this.generateEmailContent(notification.type, variables)

    const result = await this.emailService.send(
      notification.recipient,
      subject,
      html,
      text
    )

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      channel: 'EMAIL'
    }
  }

  private async sendSMSNotification(
    notification: any,
    variables: Record<string, any>
  ): Promise<NotificationResult> {
    const message = this.generateSMSContent(notification.type, variables)

    // Validate Egyptian phone number format
    const phoneNumber = this.validateAndFormatPhoneNumber(notification.recipient)
    if (!phoneNumber) {
      return {
        success: false,
        error: 'Invalid Egyptian phone number format',
        channel: 'SMS'
      }
    }

    const result = await this.smsService.send(phoneNumber, message)

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      channel: 'SMS'
    }
  }

  private async sendPushNotification(
    notification: any,
    variables: Record<string, any>
  ): Promise<NotificationResult> {
    const title = this.getNotificationTitle(notification.type, variables)
    const body = notification.message

    const result = await this.pushService.send(
      notification.recipient,
      title,
      body,
      variables
    )

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      channel: 'PUSH'
    }
  }

  private async sendWhatsAppNotification(
    notification: any,
    variables: Record<string, any>
  ): Promise<NotificationResult> {
    const message = this.generateWhatsAppContent(notification.type, variables)

    // Validate Egyptian phone number format for WhatsApp
    const phoneNumber = this.validateAndFormatPhoneNumber(notification.recipient)
    if (!phoneNumber) {
      return {
        success: false,
        error: 'Invalid Egyptian phone number format',
        channel: 'WHATSAPP'
      }
    }

    // In production, integrate with WhatsApp Business API
    
    return {
      success: true,
      messageId: `whatsapp_${Date.now()}`,
      channel: 'WHATSAPP'
    }
  }

  private async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    // In production, fetch from database
    const templates: Record<string, NotificationTemplate> = {
      'BOOKING_CONFIRMATION': {
        id: 'BOOKING_CONFIRMATION',
        name: 'Booking Confirmation',
        type: 'EMAIL',
        subject: 'تأكيد الحجز - الحمد للسيارات',
        content: 'مرحباً {customerName}، تم تأكيد حجز {bookingType} بنجاح. التاريخ: {date} الوقت: {timeSlot}',
        variables: ['customerName', 'bookingType', 'date', 'timeSlot'],
        isActive: true
      },
      'PAYMENT_CONFIRMATION': {
        id: 'PAYMENT_CONFIRMATION',
        name: 'Payment Confirmation',
        type: 'EMAIL',
        subject: 'تأكيد الدفع - الحمد للسيارات',
        content: 'شكراً {customerName}، تم استلام دفعتك بمبلغ {amount} {currency} بنجاح.',
        variables: ['customerName', 'amount', 'currency'],
        isActive: true
      },
      'BOOKING_REMINDER': {
        id: 'BOOKING_REMINDER',
        name: 'Booking Reminder',
        type: 'SMS',
        content: 'تذكير: لديك حجز {bookingType} غداً الساعة {timeSlot}. الحمد للسيارات.',
        variables: ['bookingType', 'timeSlot'],
        isActive: true
      },
      'PROMOTIONAL_OFFER': {
        id: 'PROMOTIONAL_OFFER',
        name: 'Promotional Offer',
        type: 'EMAIL',
        subject: 'عرض خاص - الحمد للسيارات',
        content: 'عرض خاص: {title} - {description}. خصم {discount}% باستخدام كود {promoCode}. صالح حتى {validUntil}.',
        variables: ['title', 'description', 'discount', 'promoCode', 'validUntil'],
        isActive: true
      }
    }

    return templates[templateId] || null
  }

  private renderTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] || match
    })
  }

  private getNotificationTitle(type: string, variables: Record<string, any>): string {
    const titles: Record<string, string> = {
      'BOOKING_CONFIRMATION': 'تأكيد الحجز',
      'PAYMENT_CONFIRMATION': 'تأكيد الدفع',
      'BOOKING_REMINDER': 'تذكير بالحجز',
      'PROMOTIONAL_OFFER': 'عرض خاص',
      'MULTI_CHANNEL': 'إشعار متعدد القنوات',
      'BULK': 'إشعار جماعي'
    }

    return titles[type] || 'إشعار جديد'
  }

  private getEmailSubject(type: string, variables: Record<string, any>): string {
    const subjects: Record<string, string> = {
      'BOOKING_CONFIRMATION': 'تأكيد الحجز - الحمد للسيارات',
      'PAYMENT_CONFIRMATION': 'تأكيد الدفع - الحمد للسيارات',
      'BOOKING_REMINDER': 'تذكير بالحجز - الحمد للسيارات',
      'PROMOTIONAL_OFFER': 'عرض خاص - الحمد للسيارات'
    }

    return subjects[type] || 'إشعار من الحمد للسيارات'
  }

  private generateEmailContent(type: string, variables: Record<string, any>): { html: string; text: string } {
    const baseContent = this.renderTemplate(
      this.getTemplate(type)?.content || '',
      variables
    )

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.getEmailSubject(type, variables)}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>الحمد للسيارات</h1>
            <p>الموزع المعتمد لسيارات تاتا في مدن القناة</p>
          </div>
          <div class="content">
            <p>${baseContent}</p>
            <div class="footer">
              <p>&copy; 2024 الحمد للسيارات. جميع الحقوق محفوظة.</p>
              <p>القاهرة، مصر | +20 2 1234 5678</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      الحمد للسيارات - الموزع المعتمد لسيارات تاتا في مدن القناة
      
      ${baseContent}
      
      © 2024 الحمد للسيارات. جميع الحقوق محفوظة.
      القاهرة، مصر | +20 2 1234 5678
    `

    return { html, text }
  }

  private generateSMSContent(type: string, variables: Record<string, any>): string {
    const smsTemplates: Record<string, string> = {
      'BOOKING_CONFIRMATION': 'الحمد للسيارات: تم تأكيد حجز {bookingType} بنجاح. التاريخ: {date} الوقت: {timeSlot}. للتواصل: 01234567890',
      'PAYMENT_CONFIRMATION': 'الحمد للسيارات: شكراً {customerName}، تم استلام دفعتك {amount} {currency} بنجاح. المعاملة: {transactionId}',
      'BOOKING_REMINDER': 'الحمد للسيارات: تذكير! حجز {bookingType} غداً الساعة {timeSlot}. نرجو الحضور في الوقت المحدد.',
      'PROMOTIONAL_OFFER': 'الحمد للسيارات: {title} - {description}. خصم {discount}% بكود {promoCode}. صالح حتى {validUntil}.'
    }

    return this.renderTemplate(smsTemplates[type] || '', variables)
  }

  private generateWhatsAppContent(type: string, variables: Record<string, any>): string {
    // Similar to SMS but can include more formatting and media
    return this.generateSMSContent(type, variables)
  }

  private validateAndFormatPhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Check if it's a valid Egyptian number
    if (cleaned.length === 11 && cleaned.startsWith('01')) {
      // Format: +20XXXXXXXXXX
      return `+2${cleaned.substring(1)}`
    } else if (cleaned.length === 10 && cleaned.startsWith('1')) {
      // Format: +20XXXXXXXXXX
      return `+2${cleaned}`
    } else if (cleaned.startsWith('2') && cleaned.length === 12) {
      // Already in international format
      return `+${cleaned}`
    }
    
    return null
  }

  // Analytics and reporting methods
  async getNotificationStats(startDate: Date, endDate: Date) {
    const notifications = await db.notification.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const stats = {
      total: notifications.length,
      sent: notifications.filter(n => n.status === 'SENT').length,
      failed: notifications.filter(n => n.status === 'FAILED').length,
      pending: notifications.filter(n => n.status === 'PENDING').length,
      byChannel: {} as Record<string, { sent: number; failed: number; total: number }>,
      byType: {} as Record<string, { sent: number; failed: number; total: number }>,
      byPriority: {} as Record<string, { sent: number; failed: number; total: number }>
    }

    // Calculate stats by channel
    notifications.forEach(n => {
      if (!stats.byChannel[n.channel]) {
        stats.byChannel[n.channel] = { sent: 0, failed: 0, total: 0 }
      }
      stats.byChannel[n.channel].total++
      if (n.status === 'SENT') stats.byChannel[n.channel].sent++
      if (n.status === 'FAILED') stats.byChannel[n.channel].failed++
    })

    // Calculate stats by type
    notifications.forEach(n => {
      if (!stats.byType[n.type]) {
        stats.byType[n.type] = { sent: 0, failed: 0, total: 0 }
      }
      stats.byType[n.type].total++
      if (n.status === 'SENT') stats.byType[n.type].sent++
      if (n.status === 'FAILED') stats.byType[n.type].failed++
    })

    // Calculate stats by priority
    notifications.forEach(n => {
      if (!stats.byPriority[n.priority]) {
        stats.byPriority[n.priority] = { sent: 0, failed: 0, total: 0 }
      }
      stats.byPriority[n.priority].total++
      if (n.status === 'SENT') stats.byPriority[n.priority].sent++
      if (n.status === 'FAILED') stats.byPriority[n.priority].failed++
    })

    return stats
  }

  async getUserNotificationPreferences(userId: string) {
    // In production, fetch from user preferences table
    return {
      email: true,
      sms: true,
      push: true,
      whatsapp: false,
      marketingEmails: false,
      bookingReminders: true,
      paymentConfirmations: true,
      promotionalOffers: false
    }
  }

  async updateUserNotificationPreferences(userId: string, preferences: any) {
    // In production, update user preferences in database
    return { success: true }
  }
}

export const enhancedNotificationService = EnhancedNotificationService.getInstance()
export default EnhancedNotificationService