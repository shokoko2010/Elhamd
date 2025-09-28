import { db } from './db'
import { Notification, EmailTemplate } from '@prisma/client'

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

interface TemplateVariables {
  [key: string]: string | number
}

class EmailService {
  private async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // In a real implementation, you would use a service like:
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Nodemailer with SMTP
      
      // For now, we'll simulate email sending
      console.log('📧 Sending email:', {
        to: data.to,
        subject: data.subject,
        html: data.html
      })

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In production, you would make an actual API call here
      // Example with SendGrid:
      /*
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      
      await sgMail.send({
        to: data.to,
        from: process.env.FROM_EMAIL || 'noreply@elhamd.com',
        subject: data.subject,
        html: data.html,
        text: data.text
      })
      */

      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  private async renderTemplate(template: EmailTemplate, variables: TemplateVariables): Promise<string> {
    let content = template.content

    // Replace template variables
    if (variables && typeof variables === 'object') {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        content = content.replace(regex, String(value ?? ''))
      })
    }

    return content
  }

  private async createNotification(
    type: string,
    recipient: string,
    title: string,
    message: string,
    status: 'PENDING' | 'SENT' | 'FAILED' = 'PENDING'
  ): Promise<Notification> {
    return await db.notification.create({
      data: {
        type: type as any,
        recipient,
        title,
        message,
        status: status as any,
        channel: 'EMAIL'
      }
    })
  }

  async sendBookingConfirmation(
    bookingId: string,
    customerEmail: string,
    customerName: string
  ): Promise<boolean> {
    try {
      // Get booking details
      const booking = await db.serviceBooking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          serviceType: true,
          vehicle: true
        }
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      // Get email template
      const template = await db.emailTemplate.findFirst({
        where: { 
          name: 'booking_confirmation',
          isActive: true 
        }
      })

      if (!template) {
        throw new Error('Email template not found')
      }

      // Prepare template variables
      const variables = {
        serviceName: booking.serviceType.name,
        date: new Date(booking.date).toLocaleDateString('ar-EG'),
        timeSlot: booking.timeSlot,
        vehicleMake: booking.vehicle?.make || '',
        vehicleModel: booking.vehicle?.model || '',
        price: booking.totalPrice || booking.serviceType.price || 0,
        contactInfo: '01000000000',
        customerName: customerName
      }

      // Render template
      const htmlContent = await this.renderTemplate(template, variables)

      // Create notification record
      const notification = await this.createNotification(
        'BOOKING_CONFIRMATION',
        customerEmail,
        template.subject,
        htmlContent
      )

      // Send email
      const emailData: EmailData = {
        to: customerEmail,
        subject: template.subject,
        html: htmlContent,
        text: htmlContent.replace(/<[^>]*>/g, '') // Plain text version
      }

      const success = await this.sendEmail(emailData)

      // Update notification status
      await db.notification.update({
        where: { id: notification.id },
        data: {
          status: success ? 'SENT' : 'FAILED',
          sentAt: success ? new Date() : null
        }
      })

      return success
    } catch (error) {
      console.error('Error sending booking confirmation:', error)
      return false
    }
  }

  async sendBookingReminder(
    bookingId: string,
    customerEmail: string,
    customerName: string
  ): Promise<boolean> {
    try {
      // Get booking details
      const booking = await db.serviceBooking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          serviceType: true,
          vehicle: true
        }
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      // Get email template
      const template = await db.emailTemplate.findFirst({
        where: { 
          name: 'booking_reminder',
          isActive: true 
        }
      })

      if (!template) {
        throw new Error('Email template not found')
      }

      // Prepare template variables
      const variables = {
        serviceName: booking.serviceType.name,
        date: new Date(booking.date).toLocaleDateString('ar-EG'),
        timeSlot: booking.timeSlot,
        vehicleMake: booking.vehicle?.make || '',
        vehicleModel: booking.vehicle?.model || '',
        contactInfo: '01000000000',
        customerName: customerName
      }

      // Render template
      const htmlContent = await this.renderTemplate(template, variables)

      // Create notification record
      const notification = await this.createNotification(
        'BOOKING_REMINDER',
        customerEmail,
        template.subject,
        htmlContent
      )

      // Send email
      const emailData: EmailData = {
        to: customerEmail,
        subject: template.subject,
        html: htmlContent,
        text: htmlContent.replace(/<[^>]*>/g, '')
      }

      const success = await this.sendEmail(emailData)

      // Update notification status
      await db.notification.update({
        where: { id: notification.id },
        data: {
          status: success ? 'SENT' : 'FAILED',
          sentAt: success ? new Date() : null
        }
      })

      // Update booking reminder flag
      if (success) {
        await db.serviceBooking.update({
          where: { id: bookingId },
          data: { reminderSent: true }
        })
      }

      return success
    } catch (error) {
      console.error('Error sending booking reminder:', error)
      return false
    }
  }

  async sendBookingCancellation(
    bookingId: string,
    customerEmail: string,
    customerName: string,
    cancellationReason: string
  ): Promise<boolean> {
    try {
      // Get booking details
      const booking = await db.serviceBooking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          serviceType: true,
          vehicle: true
        }
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      // Get email template
      const template = await db.emailTemplate.findFirst({
        where: { 
          name: 'booking_cancellation',
          isActive: true 
        }
      })

      if (!template) {
        throw new Error('Email template not found')
      }

      // Prepare template variables
      const variables = {
        serviceName: booking.serviceType.name,
        date: new Date(booking.date).toLocaleDateString('ar-EG'),
        timeSlot: booking.timeSlot,
        cancellationReason,
        contactInfo: '01000000000',
        customerName: customerName
      }

      // Render template
      const htmlContent = await this.renderTemplate(template, variables)

      // Create notification record
      const notification = await this.createNotification(
        'BOOKING_CANCELLATION',
        customerEmail,
        template.subject,
        htmlContent
      )

      // Send email
      const emailData: EmailData = {
        to: customerEmail,
        subject: template.subject,
        html: htmlContent,
        text: htmlContent.replace(/<[^>]*>/g, '')
      }

      const success = await this.sendEmail(emailData)

      // Update notification status
      await db.notification.update({
        where: { id: notification.id },
        data: {
          status: success ? 'SENT' : 'FAILED',
          sentAt: success ? new Date() : null
        }
      })

      return success
    } catch (error) {
      console.error('Error sending booking cancellation:', error)
      return false
    }
  }

  async sendPaymentReceived(
    paymentId: string,
    customerEmail: string,
    customerName: string
  ): Promise<boolean> {
    try {
      // Get payment details
      const payment = await db.payment.findUnique({
        where: { id: paymentId },
        include: {
          serviceBooking: {
            include: {
              customer: true,
              serviceType: true,
              vehicle: true
            }
          }
        }
      })

      if (!payment || !payment.serviceBooking) {
        throw new Error('Payment not found')
      }

      // Get email template
      const template = await db.emailTemplate.findFirst({
        where: { 
          name: 'payment_received',
          isActive: true 
        }
      })

      if (!template) {
        throw new Error('Email template not found')
      }

      // Prepare template variables
      const variables = {
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId || '',
        paymentDate: new Date(payment.createdAt).toLocaleDateString('ar-EG'),
        contactInfo: '01000000000',
        customerName: customerName
      }

      // Render template
      const htmlContent = await this.renderTemplate(template, variables)

      // Create notification record
      const notification = await this.createNotification(
        'PAYMENT_RECEIVED',
        customerEmail,
        template.subject,
        htmlContent
      )

      // Send email
      const emailData: EmailData = {
        to: customerEmail,
        subject: template.subject,
        html: htmlContent,
        text: htmlContent.replace(/<[^>]*>/g, '')
      }

      const success = await this.sendEmail(emailData)

      // Update notification status
      await db.notification.update({
        where: { id: notification.id },
        data: {
          status: success ? 'SENT' : 'FAILED',
          sentAt: success ? new Date() : null
        }
      })

      return success
    } catch (error) {
      console.error('Error sending payment received:', error)
      return false
    }
  }

  async sendWelcomeEmail(
    customerEmail: string,
    customerName: string
  ): Promise<boolean> {
    try {
      // Get email template
      const template = await db.emailTemplate.findFirst({
        where: { 
          name: 'welcome',
          isActive: true 
        }
      })

      if (!template) {
        throw new Error('Email template not found')
      }

      // Prepare template variables
      const variables = {
        customerName,
        contactInfo: '01000000000',
        websiteUrl: 'https://elhamd.com'
      }

      // Render template
      const htmlContent = await this.renderTemplate(template, variables)

      // Create notification record
      const notification = await this.createNotification(
        'PROMOTION',
        customerEmail,
        template.subject,
        htmlContent
      )

      // Send email
      const emailData: EmailData = {
        to: customerEmail,
        subject: template.subject,
        html: htmlContent,
        text: htmlContent.replace(/<[^>]*>/g, '')
      }

      const success = await this.sendEmail(emailData)

      // Update notification status
      await db.notification.update({
        where: { id: notification.id },
        data: {
          status: success ? 'SENT' : 'FAILED',
          sentAt: success ? new Date() : null
        }
      })

      return success
    } catch (error) {
      console.error('Error sending welcome email:', error)
      return false
    }
  }

  // Method to send booking reminders automatically
  async sendPendingReminders(): Promise<number> {
    try {
      // Get bookings that need reminders (24 hours before and not sent yet)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

      const bookings = await db.serviceBooking.findMany({
        where: {
          date: {
            gte: tomorrow,
            lt: dayAfterTomorrow
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          reminderSent: false
        },
        include: {
          customer: true,
          serviceType: true,
          vehicle: true
        }
      })

      let sentCount = 0

      for (const booking of bookings) {
        const success = await this.sendBookingReminder(
          booking.id,
          booking.customer.email,
          booking.customer.name || 'عميل'
        )

        if (success) {
          sentCount++
        }
      }

      return sentCount
    } catch (error) {
      console.error('Error sending pending reminders:', error)
      return 0
    }
  }
}

export const emailService = new EmailService()
export default EmailService