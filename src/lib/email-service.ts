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

    const subject = `Quotation #${quotation.id} from Al-Hamd Cars`
    const html = `
      <html>
        <body>
          <h2>Quotation from Al-Hamd Cars</h2>
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
          
          <p>Best regards,<br>Al-Hamd Cars Team</p>
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

    const subject = `Invoice #${invoice.id} from Al-Hamd Cars`
    const html = `
      <html>
        <body>
          <h2>Invoice from Al-Hamd Cars</h2>
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
          
          <p>Best regards,<br>Al-Hamd Cars Team</p>
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
  const subject = 'Welcome to Al-Hamd Cars!'
  const html = `
    <html>
      <body>
        <h2>Welcome to Al-Hamd Cars!</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for registering with Al-Hamd Cars. We're excited to help you find your perfect vehicle.</p>
        
        <p>At Al-Hamd Cars, we offer:</p>
        <ul>
          <li>Wide selection of quality vehicles</li>
          <li>Competitive pricing</li>
          <li>Excellent customer service</li>
          <li>Flexible financing options</li>
        </ul>
        
        <p>Please feel free to browse our inventory and contact us if you have any questions.</p>
        
        <p>Best regards,<br>Al-Hamd Cars Team</p>
      </body>
    </html>
  `

  await sendEmail({
    to: customerEmail,
    subject,
    html
  })
}