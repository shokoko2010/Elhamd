interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { ElectronicInvoicingService } from '@/lib/electronic-invoicing-service'

const invoicingService = ElectronicInvoicingService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const action = searchParams.get('action')
    
    switch (action) {
      case 'list':
        return await listInvoices(request)
      case 'get':
        return await getInvoice(request)
      case 'statistics':
        return await getInvoiceStatistics(request)
      case 'tax-rates':
        return await getTaxRates()
      case 'search':
        return await searchInvoices(request)
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Invoices GET error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create':
        return await createInvoice(body)
      case 'generate-pdf':
        return await generateInvoicePDF(body)
      case 'send-email':
        return await sendInvoiceEmail(body)
      case 'submit-eta':
        return await submitToETA(body)
      case 'record-payment':
        return await recordPayment(body)
      case 'validate':
        return await validateInvoice(body)
      case 'export':
        return await exportInvoices(body)
      case 'generate-from-booking':
        return await generateFromBooking(body)
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Invoices POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    )
  }
}

// Action handlers
async function listInvoices(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const status = searchParams.get('status')
  const customerName = searchParams.get('customerName')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  // This would query the database with filters
  const invoices = {
    data: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0
    }
  }

  return NextResponse.json({
    success: true,
    data: invoices
  })
}

async function getInvoice(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const invoiceId = searchParams.get('id')

  if (!invoiceId) {
    return NextResponse.json(
      { error: 'Invoice ID is required' },
      { status: 400 }
    )
  }

  // This would get invoice from database
  const invoice = null

  if (!invoice) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: invoice
  })
}

async function getInvoiceStatistics(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | 'yearly' || 'monthly'

  const statistics = await invoicingService.getInvoiceStatistics(period)

  return NextResponse.json({
    success: true,
    data: statistics
  })
}

async function getTaxRates() {
  const taxRates = invoicingService.getTaxRates()

  return NextResponse.json({
    success: true,
    data: taxRates
  })
}

async function searchInvoices(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filters = {
    customerName: searchParams.get('customerName') || undefined,
    invoiceNumber: searchParams.get('invoiceNumber') || undefined,
    dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
    dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    status: searchParams.get('status') || undefined,
    minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
    maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined
  }

  const invoices = await invoicingService.searchInvoices(filters)

  return NextResponse.json({
    success: true,
    data: invoices
  })
}

async function createInvoice(body: any) {
  const { invoiceData } = body

  if (!invoiceData) {
    return NextResponse.json(
      { error: 'Invoice data is required' },
      { status: 400 }
    )
  }

  // Validate required fields
  const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'customerAddress', 'items']
  for (const field of requiredFields) {
    if (!invoiceData[field]) {
      return NextResponse.json(
        { error: `${field} is required` },
        { status: 400 }
      )
    }
  }

  const invoice = await invoicingService.createInvoice(invoiceData)

  return NextResponse.json({
    success: true,
    data: invoice,
    message: 'Invoice created successfully'
  })
}

async function generateInvoicePDF(body: any) {
  const { invoiceId, invoiceData } = body

  if (!invoiceId && !invoiceData) {
    return NextResponse.json(
      { error: 'Invoice ID or invoice data is required' },
      { status: 400 }
    )
  }

  let invoice
  if (invoiceData) {
    invoice = await invoicingService.createInvoice(invoiceData)
  } else {
    // Get invoice from database using invoiceId
    invoice = null // Placeholder
  }

  if (!invoice) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    )
  }

  const pdfBuffer = await invoicingService.generateInvoicePDF(invoice)

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice_${invoice.invoiceNumber}.pdf"`
    }
  })
}

async function sendInvoiceEmail(body: any) {
  const { invoiceId, email, invoiceData } = body

  if (!invoiceId && !invoiceData) {
    return NextResponse.json(
      { error: 'Invoice ID or invoice data is required' },
      { status: 400 }
    )
  }

  if (!email) {
    return NextResponse.json(
      { error: 'Email address is required' },
      { status: 400 }
    )
  }

  let invoice
  if (invoiceData) {
    invoice = await invoicingService.createInvoice(invoiceData)
  } else {
    // Get invoice from database using invoiceId
    invoice = null // Placeholder
  }

  if (!invoice) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    )
  }

  const sent = await invoicingService.sendInvoiceEmail(invoice, email)

  if (!sent) {
    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Invoice sent successfully'
  })
}

async function submitToETA(body: any) {
  const { invoiceId, invoiceData } = body

  if (!invoiceId && !invoiceData) {
    return NextResponse.json(
      { error: 'Invoice ID or invoice data is required' },
      { status: 400 }
    )
  }

  let invoice
  if (invoiceData) {
    invoice = await invoicingService.createInvoice(invoiceData)
  } else {
    // Get invoice from database using invoiceId
    invoice = null // Placeholder
  }

  if (!invoice) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    )
  }

  // Validate invoice for ETA compliance
  const validation = invoicingService.validateInvoiceForETA(invoice)
  if (!validation.isValid) {
    return NextResponse.json(
      { error: 'Invoice validation failed', details: validation.errors },
      { status: 400 }
    )
  }

  const compliance = await invoicingService.submitToETA(invoice)

  return NextResponse.json({
    success: true,
    data: compliance,
    message: 'Invoice submitted to ETA successfully'
  })
}

async function recordPayment(body: any) {
  const { invoiceId, paymentData } = body

  if (!invoiceId) {
    return NextResponse.json(
      { error: 'Invoice ID is required' },
      { status: 400 }
    )
  }

  if (!paymentData || !paymentData.amount || !paymentData.paymentMethod) {
    return NextResponse.json(
      { error: 'Payment amount and method are required' },
      { status: 400 }
    )
  }

  const recorded = await invoicingService.recordPayment(invoiceId, paymentData)

  if (!recorded) {
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Payment recorded successfully'
  })
}

async function validateInvoice(body: any) {
  const { invoiceData } = body

  if (!invoiceData) {
    return NextResponse.json(
      { error: 'Invoice data is required' },
      { status: 400 }
    )
  }

  const validation = invoicingService.validateInvoiceForETA(invoiceData)

  return NextResponse.json({
    success: true,
    data: validation
  })
}

async function exportInvoices(body: any) {
  const { period, format = 'csv' } = body

  if (!period || !period.start || !period.end) {
    return NextResponse.json(
      { error: 'Period with start and end dates is required' },
      { status: 400 }
    )
  }

  const exportData = await invoicingService.exportInvoicesForAccounting(
    {
      start: new Date(period.start),
      end: new Date(period.end)
    },
    format
  )

  const contentType = {
    csv: 'text/csv',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xml: 'application/xml'
  }[format] || 'text/csv'

  const filename = `invoices_export_${period.start}_to_${period.end}.${format}`

  return new NextResponse(exportData, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}

async function generateFromBooking(body: any) {
  const { bookingId } = body

  if (!bookingId) {
    return NextResponse.json(
      { error: 'Booking ID is required' },
      { status: 400 }
    )
  }

  const invoice = await invoicingService.generateInvoiceFromBooking(bookingId)

  return NextResponse.json({
    success: true,
    data: invoice,
    message: 'Invoice generated from booking successfully'
  })
}