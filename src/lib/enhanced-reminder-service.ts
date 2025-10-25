// Enhanced reminder service for SMS and Email notifications
import { enhancedCache } from './enhanced-cache'

interface ReminderConfig {
  sms: {
    enabled: boolean
    provider: 'twilio' | 'aws-sns' | 'custom'
    apiKey?: string
    apiSecret?: string
    fromNumber?: string
  }
  email: {
    enabled: boolean
    provider: 'sendgrid' | 'ses' | 'nodemailer' | 'custom'
    apiKey?: string
    fromEmail: string
    fromName: string
  }
  timing: {
    firstReminder: number // hours before appointment
    secondReminder: number // hours before appointment
    finalReminder: number // hours before appointment
    followUp: number // hours after appointment
  }
}

interface ReminderTemplate {
  id: string
  name: string
  type: 'sms' | 'email'
  subject?: string // for email
  content: string
  variables: string[]
  language: 'ar' | 'en'
}

interface Appointment {
  id: string
  type: 'test-drive' | 'service' | 'maintenance'
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicleInfo?: string
  dateTime: Date
  location: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
}

interface Reminder {
  id: string
  appointmentId: string
  type: 'sms' | 'email'
  templateId: string
  scheduledFor: Date
  status: 'pending' | 'sent' | 'failed' | 'delivered'
  attempts: number
  lastAttempt?: Date
  error?: string
}

class EnhancedReminderService {
  private config: ReminderConfig
  private templates: Map<string, ReminderTemplate> = new Map()
  private reminders: Reminder[] = []
  private isRunning: boolean = false
  private checkInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<ReminderConfig> = {}) {
    this.config = {
      sms: {
        enabled: true,
        provider: 'twilio',
        apiKey: process.env.TWILIO_API_KEY,
        apiSecret: process.env.TWILIO_API_SECRET,
        fromNumber: process.env.TWILIO_FROM_NUMBER,
      },
      email: {
        enabled: true,
        provider: 'sendgrid',
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: 'noreply@alhamdcars.com',
        fromName: 'الحمد للسيارات',
      },
      timing: {
        firstReminder: 48, // 48 hours before
        secondReminder: 24, // 24 hours before
        finalReminder: 2, // 2 hours before
        followUp: 24, // 24 hours after
      },
      ...config,
    }

    this.initializeTemplates()
    this.loadRemindersFromCache()
    this.startReminderScheduler()
  }

  private initializeTemplates(): void {
    // Arabic SMS Templates
    this.templates.set('sms-test-drive-reminder-ar', {
      id: 'sms-test-drive-reminder-ar',
      name: 'Test Drive Reminder (Arabic SMS)',
      type: 'sms',
      content: `عزيزي/عزيزتي {customerName}،\n\nتذكير بموعد قيادة تجريبية لسيارة {vehicleInfo} غداً الساعة {time}.\n\nالموقع: {location}\n\nنرجو الحضور في الوقت المحدد. في حال عدم القدرة على الحضور، يرجى إلغاء الموعد من خلال التطبيق.\n\nالحمد للسيارات\n{phone}`,
      variables: ['customerName', 'vehicleInfo', 'time', 'date', 'location', 'phone'],
      language: 'ar',
    })

    this.templates.set('sms-service-reminder-ar', {
      id: 'sms-service-reminder-ar',
      name: 'Service Reminder (Arabic SMS)',
      type: 'sms',
      content: `عزيزي/عزيزتي {customerName}،\n\nتذكير بموعد صيانة لسيارتك غداً الساعة {time}.\n\nالموقع: {location}\n\nنرجو الحضور في الوقت المحدد. في حال عدم القدرة على الحضور، يرجى إلغاء الموعد.\n\nالحمد للسيارات\n{phone}`,
      variables: ['customerName', 'time', 'date', 'location', 'phone'],
      language: 'ar',
    })

    this.templates.set('sms-confirmation-ar', {
      id: 'sms-confirmation-ar',
      name: 'Appointment Confirmation (Arabic SMS)',
      type: 'sms',
      content: `عزيزي/عزيزتي {customerName}،\n\nتم تأكيد حجزك بنجاح.\n\nالتفاصيل:\nالنوع: {type}\nالتاريخ: {date}\nالوقت: {time}\nالموقع: {location}\n\nنتطلق لرؤيتك!\nالحمد للسيارات`,
      variables: ['customerName', 'type', 'date', 'time', 'location'],
      language: 'ar',
    })

    // Arabic Email Templates
    this.templates.set('email-test-drive-reminder-ar', {
      id: 'email-test-drive-reminder-ar',
      name: 'Test Drive Reminder (Arabic Email)',
      type: 'email',
      subject: 'تذكير بموعد قيادة تجريبية - الحمد للسيارات',
      content: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #1e40af;">تذكير بموعد قيادة تجريبية</h2>
          <p>عزيزي/عزيزتي <strong>{customerName}</strong>،</p>
          <p>يسعدنا أن نذكركم بموعد القيادة التجريبية المجدولة لسيارة <strong>{vehicleInfo}</strong>.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">تفاصيل الموعد:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>التاريخ:</strong> {date}</li>
              <li><strong>الوقت:</strong> {time}</li>
              <li><strong>الموقع:</strong> {location}</li>
              <li><strong>نوع السيارة:</strong> {vehicleInfo}</li>
            </ul>
          </div>
          
          <p>نرجو الوصول قبل 10 دقائق من الموعد المحدد. في حال عدم القدرة على الحضور، يرجى إلغاء الموعد من خلال التطبيق أو الاتصال بنا.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{bookingLink}" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              عرض/إلغاء الموعد
            </a>
          </div>
          
          <p>للاستفسارات، يرجى الاتصال بنا على: <strong>{phone}</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            مع تحيات،<br>
            <strong>فريق الحمد للسيارات</strong><br>
            {phone} | {website}
          </p>
        </div>
      `,
      variables: ['customerName', 'vehicleInfo', 'date', 'time', 'location', 'phone', 'bookingLink', 'website'],
      language: 'ar',
    })

    this.templates.set('email-service-reminder-ar', {
      id: 'email-service-reminder-ar',
      name: 'Service Reminder (Arabic Email)',
      type: 'email',
      subject: 'تذكير بموعد صيانة - الحمد للسيارات',
      content: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #1e40af;">تذكير بموعد صيانة</h2>
          <p>عزيزي/عزيزتي <strong>{customerName}</strong>،</p>
          <p>يسعدنا أن نذكركم بموعد الصيانة المجدول لسيارتكم.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">تفاصيل الموعد:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>التاريخ:</strong> {date}</li>
              <li><strong>الوقت:</strong> {time}</li>
              <li><strong>الموقع:</strong> {location}</li>
              <li><strong>نوع الخدمة:</strong> {serviceType}</li>
            </ul>
          </div>
          
          <p>نرجو الوصول في الوقت المحدد. في حال عدم القدرة على الحضور، يرجى إلغاء الموعد.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{bookingLink}" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              عرض/إلغاء الموعد
            </a>
          </div>
          
          <p>للاستفسارات، يرجى الاتصال بنا على: <strong>{phone}</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            مع تحيات،<br>
            <strong>فريق خدمة الحمد للسيارات</strong><br>
            {phone} | {website}
          </p>
        </div>
      `,
      variables: ['customerName', 'date', 'time', 'location', 'serviceType', 'phone', 'bookingLink', 'website'],
      language: 'ar',
    })

    // English Templates (fallback)
    this.templates.set('sms-test-drive-reminder-en', {
      id: 'sms-test-drive-reminder-en',
      name: 'Test Drive Reminder (English SMS)',
      type: 'sms',
      content: `Dear {customerName},\n\nReminder: Your test drive for {vehicleInfo} is scheduled for tomorrow at {time}.\n\nLocation: {location}\n\nPlease arrive on time. If you need to cancel, please use the app.\n\nAlhamd Cars\n{phone}`,
      variables: ['customerName', 'vehicleInfo', 'time', 'date', 'location', 'phone'],
      language: 'en',
    })
  }

  private loadRemindersFromCache(): void {
    const cached = enhancedCache.get('reminders')
    if (cached) {
      this.reminders = cached
    }
  }

  private saveRemindersToCache(): void {
    enhancedCache.set('reminders', this.reminders, 1800000) // 30 minutes
  }

  private startReminderScheduler(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.checkInterval = setInterval(() => {
      this.processPendingReminders()
      this.scheduleNewReminders()
    }, 60000) // Check every minute
  }

  private async processPendingReminders(): Promise<void> {
    const now = new Date()
    const pendingReminders = this.reminders.filter(r => 
      r.status === 'pending' && new Date(r.scheduledFor) <= now
    )

    for (const reminder of pendingReminders) {
      try {
        await this.sendReminder(reminder)
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error)
        this.updateReminderStatus(reminder.id, 'failed', error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }

  private async scheduleNewReminders(): Promise<void> {
    try {
      // Get upcoming appointments from API
      const response = await fetch('/api/bookings/upcoming', {
        headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
      })
      
      if (!response.ok) return

      const appointments: Appointment[] = await response.json()
      
      for (const appointment of appointments) {
        if (appointment.status !== 'scheduled' && appointment.status !== 'confirmed') continue
        
        // Check if reminders are already scheduled
        const existingReminders = this.reminders.filter(r => r.appointmentId === appointment.id)
        if (existingReminders.length >= 3) continue // Already has all reminders scheduled

        // Schedule new reminders
        await this.scheduleAppointmentReminders(appointment)
      }
    } catch (error) {
      console.error('Failed to schedule new reminders:', error)
    }
  }

  private async scheduleAppointmentReminders(appointment: Appointment): Promise<void> {
    const appointmentTime = new Date(appointment.dateTime)
    const now = new Date()

    // Calculate reminder times
    const reminderTimes = [
      { hours: this.config.timing.firstReminder, type: 'first' },
      { hours: this.config.timing.secondReminder, type: 'second' },
      { hours: this.config.timing.finalReminder, type: 'final' },
    ]

    for (const { hours, type } of reminderTimes) {
      const reminderTime = new Date(appointmentTime.getTime() - (hours * 60 * 60 * 1000))
      
      // Only schedule if reminder time is in the future
      if (reminderTime > now) {
        const templateId = this.getTemplateId(appointment.type, type, 'ar')
        
        const reminder: Reminder = {
          id: `reminder_${appointment.id}_${type}_${Date.now()}`,
          appointmentId: appointment.id,
          type: 'sms', // Start with SMS, can be configured
          templateId,
          scheduledFor: reminderTime,
          status: 'pending',
          attempts: 0,
        }

        this.reminders.push(reminder)
        
        // Also schedule email reminder
        const emailReminder: Reminder = {
          id: `reminder_${appointment.id}_${type}_email_${Date.now()}`,
          appointmentId: appointment.id,
          type: 'email',
          templateId: templateId.replace('sms-', 'email-'),
          scheduledFor: reminderTime,
          status: 'pending',
          attempts: 0,
        }

        this.reminders.push(emailReminder)
      }
    }

    this.saveRemindersToCache()
  }

  private getTemplateId(appointmentType: string, reminderType: string, language: string): string {
    const typeMap = {
      'test-drive': 'test-drive',
      'service': 'service',
      'maintenance': 'service',
    }

    const appointmentTypeKey = typeMap[appointmentType as keyof typeof typeMap] || 'service'
    
    return `${language === 'ar' ? 'sms' : 'sms'}-${appointmentTypeKey}-reminder-${language === 'ar' ? 'ar' : 'en'}`
  }

  private async sendReminder(reminder: Reminder): Promise<void> {
    const template = this.templates.get(reminder.templateId)
    if (!template) {
      throw new Error(`Template not found: ${reminder.templateId}`)
    }

    // Get appointment details
    const appointment = await this.getAppointmentDetails(reminder.appointmentId)
    if (!appointment) {
      throw new Error(`Appointment not found: ${reminder.appointmentId}`)
    }

    // Prepare template variables
    const variables = this.prepareTemplateVariables(appointment, template)
    
    // Render template
    const content = this.renderTemplate(template.content, variables)

    if (reminder.type === 'sms') {
      await this.sendSMS(appointment.customerPhone, content)
    } else if (reminder.type === 'email') {
      const subject = template.subject ? this.renderTemplate(template.subject, variables) : 'Reminder'
      await this.sendEmail(appointment.customerEmail, subject, content)
    }

    this.updateReminderStatus(reminder.id, 'delivered')
    this.saveRemindersToCache()
  }

  private prepareTemplateVariables(appointment: Appointment, template: ReminderTemplate): Record<string, string> {
    const date = new Date(appointment.dateTime)
    const timeStr = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    const dateStr = date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })

    const variables: Record<string, string> = {
      customerName: appointment.customerName,
      date: dateStr,
      time: timeStr,
      location: appointment.location,
      phone: '+201234567890', // Should come from config
      website: 'https://alhamdcars.com',
      bookingLink: `https://alhamdcars.com/booking/${appointment.id}`,
    }

    // Add vehicle info if available
    if (appointment.vehicleInfo) {
      variables.vehicleInfo = appointment.vehicleInfo
    }

    // Add service type for service appointments
    if (appointment.type === 'service' || appointment.type === 'maintenance') {
      variables.serviceType = appointment.type === 'maintenance' ? 'صيانة دورية' : 'خدمة عامة'
    }

    return variables
  }

  private renderTemplate(template: string, variables: Record<string, string>): string {
    let content = template
    
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{${key}}`, 'g'), value)
    }
    
    return content
  }

  private async sendSMS(to: string, content: string): Promise<void> {
    if (!this.config.sms.enabled) return

    switch (this.config.sms.provider) {
      case 'twilio':
        await this.sendSMSViaTwilio(to, content)
        break
      case 'aws-sns':
        await this.sendSMSViaSNS(to, content)
        break
      default:
    }
  }

  private async sendSMSViaTwilio(to: string, content: string): Promise<void> {
    // Implementation for Twilio SMS
    // Actual implementation would use Twilio SDK
  }

  private async sendSMSViaSNS(to: string, content: string): Promise<void> {
    // Implementation for AWS SNS SMS
    // Actual implementation would use AWS SDK
  }

  private async sendEmail(to: string, subject: string, content: string): Promise<void> {
    if (!this.config.email.enabled) return

    switch (this.config.email.provider) {
      case 'sendgrid':
        await this.sendEmailViaSendGrid(to, subject, content)
        break
      case 'ses':
        await this.sendEmailViaSES(to, subject, content)
        break
      default:
    }
  }

  private async sendEmailViaSendGrid(to: string, subject: string, content: string): Promise<void> {
    // Implementation for SendGrid
    // Actual implementation would use SendGrid SDK
  }

  private async sendEmailViaSES(to: string, subject: string, content: string): Promise<void> {
    // Implementation for AWS SES
    // Actual implementation would use AWS SDK
  }

  private async getAppointmentDetails(appointmentId: string): Promise<Appointment | null> {
    try {
      const response = await fetch(`/api/bookings/${appointmentId}`, {
        headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
      })
      
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to get appointment details:', error)
    }
    
    return null
  }

  private updateReminderStatus(reminderId: string, status: Reminder['status'], error?: string): void {
    const reminder = this.reminders.find(r => r.id === reminderId)
    if (reminder) {
      reminder.status = status
      reminder.attempts += 1
      reminder.lastAttempt = new Date()
      if (error) {
        reminder.error = error
      }
    }
  }

  private getAuthToken(): string {
    // Get auth token from localStorage or cookie
    return localStorage.getItem('authToken') || ''
  }

  // Public methods
  async scheduleManualReminder(
    appointmentId: string, 
    type: 'sms' | 'email', 
    templateId: string, 
    scheduledFor: Date
  ): Promise<string> {
    const reminder: Reminder = {
      id: `manual_${appointmentId}_${Date.now()}`,
      appointmentId,
      type,
      templateId,
      scheduledFor,
      status: 'pending',
      attempts: 0,
    }

    this.reminders.push(reminder)
    this.saveRemindersToCache()

    return reminder.id
  }

  async sendImmediateReminder(
    appointmentId: string, 
    type: 'sms' | 'email', 
    templateId: string
  ): Promise<void> {
    const reminder: Reminder = {
      id: `immediate_${appointmentId}_${Date.now()}`,
      appointmentId,
      type,
      templateId,
      scheduledFor: new Date(),
      status: 'pending',
      attempts: 0,
    }

    await this.sendReminder(reminder)
  }

  getReminderStats(): {
    total: number
    pending: number
    sent: number
    failed: number
    delivered: number
  } {
    return {
      total: this.reminders.length,
      pending: this.reminders.filter(r => r.status === 'pending').length,
      sent: this.reminders.filter(r => r.status === 'sent').length,
      failed: this.reminders.filter(r => r.status === 'failed').length,
      delivered: this.reminders.filter(r => r.status === 'delivered').length,
    }
  }

  updateConfig(newConfig: Partial<ReminderConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  addTemplate(template: ReminderTemplate): void {
    this.templates.set(template.id, template)
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.isRunning = false
  }

  start(): void {
    this.startReminderScheduler()
  }
}

// Export singleton instance
export const reminderService = new EnhancedReminderService()

// React hook for reminder management
export function useReminders() {
  const [stats, setStats] = useState(reminderService.getReminderStats())

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(reminderService.getReminderStats())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return {
    stats,
    scheduleManualReminder: reminderService.scheduleManualReminder.bind(reminderService),
    sendImmediateReminder: reminderService.sendImmediateReminder.bind(reminderService),
    updateConfig: reminderService.updateConfig.bind(reminderService),
    addTemplate: reminderService.addTemplate.bind(reminderService),
  }
}