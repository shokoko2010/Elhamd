interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        taxes: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // PDF generation would be implemented here
    // This would typically involve:
    // 1. Generate PDF using a library like Puppeteer or jsPDF
    // 2. Include company branding, invoice details, items, taxes, etc.
    // 3. Return the PDF as a downloadable file

    // For now, we'll return a simple text-based invoice as a placeholder
    const invoiceText = `
فاتورة رقم: ${invoice.invoiceNumber}
التاريخ: ${new Date(invoice.issueDate).toLocaleDateString('ar-EG')}
تاريخ الاستحقاق: ${new Date(invoice.dueDate).toLocaleDateString('ar-EG')}

العميل: ${invoice.customer.name}
البريد الإلكتروني: ${invoice.customer.email}
${invoice.customer.phone ? `الهاتف: ${invoice.customer.phone}` : ''}

البنود:
${invoice.items.map(item => 
  `${item.description} - الكمية: ${item.quantity} - السعر: ${item.unitPrice} - الإجمالي: ${item.totalPrice}`
).join('\n')}

الإجمالي الفرعي: ${invoice.subtotal}
الضريبة: ${invoice.taxAmount}
الإجمالي: ${invoice.totalAmount}

الحالة: ${invoice.status}
    `.trim()

    // Create a simple text file response
    const buffer = Buffer.from(invoiceText, 'utf-8')
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.txt"`
      }
    })
  } catch (error) {
    console.error('Error downloading invoice:', error)
    return NextResponse.json(
      { error: 'Failed to download invoice' },
      { status: 500 }
    )
  }
}