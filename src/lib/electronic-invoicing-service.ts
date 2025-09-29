import { db } from '@/lib/db'
import { Quotation } from '@prisma/client'

export async function generateQuotationPDF(quotationId: string): Promise<Buffer> {
  try {
    // Get quotation with all related data
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

    // Generate PDF content (simplified version)
    const pdfContent = `
      QUOTATION #${quotation.id}
      =================
      
      Customer: ${quotation.customer.name}
      Email: ${quotation.customer.email}
      Phone: ${quotation.customer.phone || 'N/A'}
      
      Branch: ${quotation.branch.name}
      Date: ${quotation.createdAt.toLocaleDateString()}
      
      Vehicle: ${quotation.vehicle.make} ${quotation.vehicle.model} (${quotation.vehicle.year})
      
      Items:
      ${quotation.items.map(item => 
        `- ${item.vehicle.make} ${item.vehicle.model}: $${item.price}`
      ).join('\n')}
      
      Total: $${quotation.totalAmount}
      
      Terms and Conditions:
      ${quotation.terms || 'Standard terms apply'}
      
      Valid until: ${quotation.validUntil?.toLocaleDateString() || 'N/A'}
    `

    // Return buffer (in real implementation, use a PDF library like pdfkit or puppeteer)
    return Buffer.from(pdfContent, 'utf-8')
  } catch (error) {
    console.error('Error generating quotation PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}

export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  try {
    // Similar implementation for invoices
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

    const pdfContent = `
      INVOICE #${invoice.id}
      ================
      
      Customer: ${invoice.customer.name}
      Email: ${invoice.customer.email}
      Phone: ${invoice.customer.phone || 'N/A'}
      
      Branch: ${invoice.branch.name}
      Date: ${invoice.createdAt.toLocaleDateString()}
      
      Vehicle: ${invoice.vehicle.make} ${invoice.vehicle.model} (${invoice.vehicle.year})
      
      Items:
      ${invoice.items.map(item => 
        `- ${item.vehicle.make} ${item.vehicle.model}: $${item.price}`
      ).join('\n')}
      
      Total: $${invoice.totalAmount}
      Paid: $${invoice.paidAmount}
      Due: $${invoice.totalAmount - invoice.paidAmount}
      
      Payment Status: ${invoice.paymentStatus}
    `

    return Buffer.from(pdfContent, 'utf-8')
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}