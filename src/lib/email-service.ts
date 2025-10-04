import { db } from '@/lib/db'
import { Quotation, Invoice } from '@prisma/client'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // In a real implementation, use a service like SendGrid, Mailgun, or AWS SES
    console.log('Sending email:', {
      to: options.to,
      subject: options.subject,
      html: options.html
    })

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

export async function sendQuotationEmail(quotationId: string): Promise<void> {
  try {
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: {
        customer: true,
        vehicle: true,
        items: {
          include: {
            vehicle: true
          }
        },
        branch: true
      }
    })

    if (!quotation) {
      throw new Error('Quotation not found')
    }

    // Get company settings from database
    const siteSettings = await db.siteSettings.findFirst({ where: { isActive: true } })
    const companyName = siteSettings?.siteTitle || 'Elhamd Import'

    const subject = `Quotation #${quotation.id} from ${companyName}`
    const html = `
      <html>
        <body>
          <h2>Quotation from ${companyName}</h2>
          <p>Dear ${quotation.customer.name},</p>
          <p>Thank you for your interest in our vehicles. Please find your quotation below:</p>
          
          <h3>Quotation Details</h3>
          <p><strong>Quotation ID:</strong> ${quotation.id}</p>
          <p><strong>Date:</strong> ${quotation.createdAt.toLocaleDateString()}</p>
          <p><strong>Branch:</strong> ${quotation.branch.name}</p>
          
          <h3>Vehicle Information</h3>
          <p><strong>Vehicle:</strong> ${quotation.vehicle.make} ${quotation.vehicle.model} (${quotation.vehicle.year})</p>
          
          <h3>Quotation Items</h3>
          <ul>
            ${quotation.items.map(item => 
              `<li>${item.vehicle.make} ${item.vehicle.model}: $${item.price}</li>`
            ).join('')}
          </ul>
          
          <h3>Total Amount: $${quotation.totalAmount}</h3>
          
          <p><strong>Valid Until:</strong> ${quotation.validUntil?.toLocaleDateString() || 'N/A'}</p>
          
          <h3>Terms and Conditions</h3>
          <p>${quotation.terms || 'Standard terms apply'}</p>
          
          <p>Please feel free to contact us if you have any questions.</p>
          
          <p>Best regards,<br>${companyName} Team</p>
        </body>
      </html>
    `

    await sendEmail({
      to: quotation.customer.email,
      subject,
      html
    })
  } catch (error) {
    console.error('Error sending quotation email:', error)
    throw new Error('Failed to send quotation email')
  }
}

export async function sendInvoiceEmail(invoiceId: string): Promise<void> {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        vehicle: true,
        items: {
          include: {
            vehicle: true
          }
        },
        branch: true
      }
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    // Get company settings from database
    const siteSettings = await db.siteSettings.findFirst({ where: { isActive: true } })
    const companyName = siteSettings?.siteTitle || 'Elhamd Import'

    const subject = `Invoice #${invoice.id} from ${companyName}`
    const html = `
      <html>
        <body>
          <h2>Invoice from ${companyName}</h2>
          <p>Dear ${invoice.customer.name},</p>
          <p>Please find your invoice below:</p>
          
          <h3>Invoice Details</h3>
          <p><strong>Invoice ID:</strong> ${invoice.id}</p>
          <p><strong>Date:</strong> ${invoice.createdAt.toLocaleDateString()}</p>
          <p><strong>Branch:</strong> ${invoice.branch.name}</p>
          
          <h3>Vehicle Information</h3>
          <p><strong>Vehicle:</strong> ${invoice.vehicle.make} ${invoice.vehicle.model} (${invoice.vehicle.year})</p>
          
          <h3>Invoice Items</h3>
          <ul>
            ${invoice.items.map(item => 
              `<li>${item.vehicle.make} ${item.vehicle.model}: $${item.price}</li>`
            ).join('')}
          </ul>
          
          <h3>Payment Information</h3>
          <p><strong>Total Amount:</strong> $${invoice.totalAmount}</p>
          <p><strong>Paid Amount:</strong> $${invoice.paidAmount}</p>
          <p><strong>Due Amount:</strong> $${invoice.totalAmount - invoice.paidAmount}</p>
          <p><strong>Payment Status:</strong> ${invoice.paymentStatus}</p>
          
          <p>Please make payment at your earliest convenience.</p>
          
          <p>Best regards,<br>${companyName} Team</p>
        </body>
      </html>
    `

    await sendEmail({
      to: invoice.customer.email,
      subject,
      html
    })
  } catch (error) {
    console.error('Error sending invoice email:', error)
    throw new Error('Failed to send invoice email')
  }
}

export async function sendWelcomeEmail(customerEmail: string, customerName: string): Promise<void> {
  // Get company settings from database
  const companySettings = await db.companySettings.findFirst()
  const companyName = companySettings?.companyName || 'Elhamd Import'
  
  const subject = `Welcome to ${companyName}!`
  const html = `
    <html>
      <body>
        <h2>Welcome to ${companyName}!</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for registering with ${companyName}. We're excited to help you find your perfect vehicle.</p>
        
        <p>At ${companyName}, we offer:</p>
        <ul>
          <li>Wide selection of quality vehicles</li>
          <li>Competitive pricing</li>
          <li>Excellent customer service</li>
          <li>Flexible financing options</li>
        </ul>
        
        <p>Please feel free to browse our inventory and contact us if you have any questions.</p>
        
        <p>Best regards,<br>${companyName} Team</p>
      </body>
    </html>
  `

  await sendEmail({
    to: customerEmail,
    subject,
    html
  })
}

export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  static async sendQuotationEmail(quotationId: string): Promise<void> {
    return sendQuotationEmail(quotationId)
  }

  static async sendInvoiceEmail(invoiceId: string): Promise<void> {
    return sendInvoiceEmail(invoiceId)
  }

  static async sendWelcomeEmail(customerEmail: string, customerName: string): Promise<void> {
    return sendWelcomeEmail(customerEmail, customerName)
  }

  static async sendEmail(options: EmailOptions): Promise<void> {
    return sendEmail(options)
  }

  // Instance methods for when using getInstance()
  async sendQuotationEmailInstance(quotationId: string): Promise<void> {
    return sendQuotationEmail(quotationId)
  }

  async sendInvoiceEmailInstance(invoiceId: string): Promise<void> {
    return sendInvoiceEmail(invoiceId)
  }

  async sendWelcomeEmailInstance(customerEmail: string, customerName: string): Promise<void> {
    return sendWelcomeEmail(customerEmail, customerName)
  }

  async sendEmailInstance(options: EmailOptions): Promise<void> {
    return sendEmail(options)
  }

  async sendBookingConfirmation(params: {
    customerName: string
    customerEmail: string
    bookingType: 'test-drive' | 'service'
    vehicleInfo?: string
    date?: string
    time?: string
    services?: string[]
  }): Promise<void> {
    const { customerName, customerEmail, bookingType, vehicleInfo, date, time, services } = params
    
    // Get company settings from database
    const siteSettings = await db.siteSettings.findFirst({ where: { isActive: true } })
    const companyName = siteSettings?.siteTitle || 'Elhamd Import'
    
    const subject = `Booking Confirmation - ${bookingType === 'test-drive' ? 'Test Drive' : 'Service Appointment'}`
    
    const html = `
      <html>
        <body>
          <h2>Booking Confirmation</h2>
          <p>Dear ${customerName},</p>
          <p>Your ${bookingType === 'test-drive' ? 'test drive' : 'service appointment'} has been confirmed!</p>
          
          ${vehicleInfo ? `<p><strong>Vehicle:</strong> ${vehicleInfo}</p>` : ''}
          ${date ? `<p><strong>Date:</strong> ${date}</p>` : ''}
          ${time ? `<p><strong>Time:</strong> ${time}</p>` : ''}
          
          ${services && services.length > 0 ? `
            <h3>Services:</h3>
            <ul>
              ${services.map(service => `<li>${service}</li>`).join('')}
            </ul>
          ` : ''}
          
          <p>Please arrive 10 minutes early for your appointment.</p>
          
          <p>Best regards,<br>${companyName} Team</p>
        </body>
      </html>
    `

    await sendEmail({
      to: customerEmail,
      subject,
      html
    })
  }

  async sendAdminNotification(params: {
    customerName: string
    customerEmail: string
    bookingType: 'test-drive' | 'service'
    vehicleInfo?: string
    date?: string
    time?: string
    services?: string[]
  }): Promise<void> {
    const { customerName, customerEmail, bookingType, vehicleInfo, date, time, services } = params
    
    // Get company settings from database
    const siteSettings = await db.siteSettings.findFirst({ where: { isActive: true } })
    const adminEmail = siteSettings?.contactEmail || 'admin@elhamdimport.com'
    
    const subject = `New ${bookingType === 'test-drive' ? 'Test Drive' : 'Service'} Booking`
    
    const html = `
      <html>
        <body>
          <h2>New Booking Alert</h2>
          <p>A new ${bookingType === 'test-drive' ? 'test drive' : 'service'} booking has been made:</p>
          
          <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
          ${vehicleInfo ? `<p><strong>Vehicle:</strong> ${vehicleInfo}</p>` : ''}
          ${date ? `<p><strong>Date:</strong> ${date}</p>` : ''}
          ${time ? `<p><strong>Time:</strong> ${time}</p>` : ''}
          
          ${services && services.length > 0 ? `
            <h3>Services:</h3>
            <ul>
              ${services.map(service => `<li>${service}</li>`).join('')}
            </ul>
          ` : ''}
          
          <p>Please check the admin dashboard for more details.</p>
        </body>
      </html>
    `

    await sendEmail({
      to: adminEmail,
      subject,
      html
    })
  }
}