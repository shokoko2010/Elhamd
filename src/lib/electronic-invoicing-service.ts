import { db } from '@/lib/db'

// Types for electronic invoicing
export interface InvoiceItem {
  id?: string
  invoiceId?: string
  description: string
  quantity: number
  unitPrice: number
  totalAmount: number
  taxRate: number
  taxAmount: number
  discount?: number
  itemType: 'vehicle' | 'service' | 'part' | 'other'
  itemId?: string
}

export interface Invoice {
  id?: string
  invoiceNumber: string
  invoiceDate: Date
  dueDate: Date
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerTaxId?: string
  
  // Invoice details
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  
  // Payment information
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  paymentMethod?: string
  paidAmount: number
  dueAmount: number
  
  // Egyptian e-invoicing specific
  eInvoiceId?: string
  eInvoiceStatus?: 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  eInvoiceQR?: string
  eInvoiceSignature?: string
  
  // Additional fields
  notes?: string
  terms?: string
  currency: string
  exchangeRate?: number
  
  // Metadata
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
  updatedBy?: string
}

export interface TaxRate {
  id: string
  name: string
  rate: number
  type: 'STANDARD' | 'REDUCED' | 'ZERO' | 'EXEMPT'
  description: string
  isActive: boolean
  effectiveFrom: Date
  effectiveTo?: Date
}

export interface EgyptianInvoiceCompliance {
  // ETA (Egyptian Tax Authority) requirements
  etaSubmissionId?: string
  etaSubmissionDate?: Date
  etaStatusCode?: string
  etaStatusMessage?: string
  
  // Digital signature requirements
  signatureCertificateId?: string
  signatureValue?: string
  signedAt?: Date
  
  // QR code requirements
  qrCodeData?: string
  qrCodeImage?: string
  
  // Validation
  isValid: boolean
  validationErrors?: string[]
  
  // Compliance checks
  taxCompliance: {
    vatRegistered: boolean
    taxIdValid: boolean
    invoiceFormatValid: boolean
    digitalSignatureValid: boolean
  }
}

export interface InvoiceTemplate {
  id: string
  name: string
  description: string
  template: string // HTML template
  isDefault: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class ElectronicInvoicingService {
  private static instance: ElectronicInvoicingService
  private taxRates: Map<string, TaxRate> = new Map()

  private constructor() {
    this.initializeTaxRates()
  }

  static getInstance(): ElectronicInvoicingService {
    if (!ElectronicInvoicingService.instance) {
      ElectronicInvoicingService.instance = new ElectronicInvoicingService()
    }
    return ElectronicInvoicingService.instance
  }

  // Initialize tax rates for Egypt
  private initializeTaxRates() {
    const standardVAT: TaxRate = {
      id: '1',
      name: 'Standard VAT',
      rate: 0.14, // 14% VAT in Egypt
      type: 'STANDARD',
      description: 'Standard Value Added Tax',
      isActive: true,
      effectiveFrom: new Date('2023-01-01')
    }

    const reducedVAT: TaxRate = {
      id: '2',
      name: 'Reduced VAT',
      rate: 0.05, // 5% reduced rate
      type: 'REDUCED',
      description: 'Reduced Value Added Tax for specific goods/services',
      isActive: true,
      effectiveFrom: new Date('2023-01-01')
    }

    const zeroVAT: TaxRate = {
      id: '3',
      name: 'Zero Rated',
      rate: 0,
      type: 'ZERO',
      description: 'Zero-rated supplies',
      isActive: true,
      effectiveFrom: new Date('2023-01-01')
    }

    const exempt: TaxRate = {
      id: '4',
      name: 'Exempt',
      rate: 0,
      type: 'EXEMPT',
      description: 'Exempt supplies',
      isActive: true,
      effectiveFrom: new Date('2023-01-01')
    }

    this.taxRates.set('standard', standardVAT)
    this.taxRates.set('reduced', reducedVAT)
    this.taxRates.set('zero', zeroVAT)
    this.taxRates.set('exempt', exempt)
  }

  // Generate new invoice number
  async generateInvoiceNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    // Get last invoice number for this month
    const lastInvoice = await db.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}${month}`
        }
      },
      orderBy: {
        invoiceNumber: 'desc'
      }
    })

    let sequence = 1
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]) || 0
      sequence = lastSequence + 1
    }

    return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`
  }

  // Create new invoice
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber()
    const now = new Date()

    // Calculate totals
    const calculatedItems = invoiceData.items.map(item => ({
      ...item,
      taxAmount: item.unitPrice * item.quantity * item.taxRate,
      totalAmount: (item.unitPrice * item.quantity * (1 + item.taxRate)) - (item.discount || 0)
    }))

    const subtotal = calculatedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
    const taxAmount = calculatedItems.reduce((sum, item) => sum + item.taxAmount, 0)
    const discountAmount = calculatedItems.reduce((sum, item) => sum + (item.discount || 0), 0)
    const totalAmount = subtotal + taxAmount - discountAmount

    const invoice: Invoice = {
      ...invoiceData,
      invoiceNumber,
      items: calculatedItems,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paidAmount: invoiceData.paidAmount || 0,
      dueAmount: totalAmount - (invoiceData.paidAmount || 0),
      createdAt: now,
      updatedAt: now,
      currency: invoiceData.currency || 'EGP'
    }

    // Save to database (this would need actual Prisma models)
    // For now, return the calculated invoice
    return invoice
  }

  // Generate invoice PDF
  async generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
    // This would use a PDF generation library like pdfkit or puppeteer
    // For now, return a placeholder
    const pdfContent = `
      Invoice: ${invoice.invoiceNumber}
      Date: ${invoice.invoiceDate.toDateString()}
      Customer: ${invoice.customerName}
      Total: ${invoice.totalAmount}
    `
    
    return Buffer.from(pdfContent)
  }

  // Send invoice via email
  async sendInvoiceEmail(invoice: Invoice, email: string): Promise<boolean> {
    try {
      const pdfBuffer = await this.generateInvoicePDF(invoice)
      
      // This would use an email service like nodemailer, SendGrid, etc.
      console.log(`Sending invoice ${invoice.invoiceNumber} to ${email}`)
      
      // Placeholder for email sending logic
      return true
    } catch (error) {
      console.error('Error sending invoice email:', error)
      return false
    }
  }

  // Submit to Egyptian Tax Authority (ETA)
  async submitToETA(invoice: Invoice): Promise<EgyptianInvoiceCompliance> {
    try {
      // Prepare invoice data for ETA submission
      const etaData = {
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate.toISOString(),
        customerTaxId: invoice.customerTaxId,
        customerName: invoice.customerName,
        totalAmount: invoice.totalAmount,
        taxAmount: invoice.taxAmount,
        items: invoice.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount
        }))
      }

      // This would integrate with ETA API
      console.log('Submitting to ETA:', etaData)

      // Simulate ETA response
      const compliance: EgyptianInvoiceCompliance = {
        etaSubmissionId: `ETA-${Date.now()}`,
        etaSubmissionDate: new Date(),
        etaStatusCode: 'ACCEPTED',
        etaStatusMessage: 'Invoice accepted by ETA',
        isValid: true,
        taxCompliance: {
          vatRegistered: true,
          taxIdValid: true,
          invoiceFormatValid: true,
          digitalSignatureValid: true
        }
      }

      // Generate QR code for Egyptian e-invoicing
      compliance.qrCodeData = await this.generateETAQRCode(invoice)

      return compliance
    } catch (error) {
      console.error('Error submitting to ETA:', error)
      return {
        isValid: false,
        validationErrors: [error.message],
        taxCompliance: {
          vatRegistered: false,
          taxIdValid: false,
          invoiceFormatValid: false,
          digitalSignatureValid: false
        }
      }
    }
  }

  // Generate QR code for ETA compliance
  private async generateETAQRCode(invoice: Invoice): Promise<string> {
    // This would generate a QR code containing invoice data as per ETA requirements
    const qrData = JSON.stringify({
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate.toISOString().split('T')[0],
      sellerTaxId: 'EG123456789', // Company tax ID
      buyerTaxId: invoice.customerTaxId || '',
      totalAmount: invoice.totalAmount,
      taxAmount: invoice.taxAmount
    })

    // This would use a QR code generation library
    return `data:image/png;base64,${Buffer.from(qrData).toString('base64')}`
  }

  // Apply digital signature
  async applyDigitalSignature(invoice: Invoice): Promise<string> {
    // This would apply a digital signature as per Egyptian requirements
    // For now, return a placeholder signature
    return `signature_${invoice.invoiceNumber}_${Date.now()}`
  }

  // Validate invoice for ETA compliance
  validateInvoiceForETA(invoice: Invoice): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check required fields
    if (!invoice.invoiceNumber) errors.push('Invoice number is required')
    if (!invoice.invoiceDate) errors.push('Invoice date is required')
    if (!invoice.customerName) errors.push('Customer name is required')
    if (!invoice.customerTaxId) errors.push('Customer tax ID is required')
    if (!invoice.items || invoice.items.length === 0) errors.push('Invoice items are required')

    // Check amounts
    if (invoice.totalAmount <= 0) errors.push('Total amount must be positive')
    if (invoice.taxAmount < 0) errors.push('Tax amount cannot be negative')

    // Check item details
    invoice.items.forEach((item, index) => {
      if (!item.description) errors.push(`Item ${index + 1}: Description is required`)
      if (item.quantity <= 0) errors.push(`Item ${index + 1}: Quantity must be positive`)
      if (item.unitPrice < 0) errors.push(`Item ${index + 1}: Unit price cannot be negative`)
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Get tax rates
  getTaxRates(): TaxRate[] {
    return Array.from(this.taxRates.values())
  }

  // Get tax rate by type
  getTaxRateByType(type: string): TaxRate | undefined {
    return this.taxRates.get(type.toLowerCase())
  }

  // Calculate tax for an amount
  calculateTax(amount: number, taxRateType: string): number {
    const taxRate = this.getTaxRateByType(taxRateType)
    if (!taxRate) return 0
    return amount * taxRate.rate
  }

  // Generate recurring invoices
  async generateRecurringInvoices(): Promise<Invoice[]> {
    // This would generate invoices for recurring billing
    // For now, return empty array
    return []
  }

  // Get invoice statistics
  async getInvoiceStatistics(period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    // This would calculate invoice statistics for the given period
    return {
      totalInvoices: 0,
      totalRevenue: 0,
      averageInvoiceAmount: 0,
      paidInvoices: 0,
      overdueInvoices: 0,
      taxCollected: 0
    }
  }

  // Search invoices
  async searchInvoices(filters: {
    customerName?: string
    invoiceNumber?: string
    dateFrom?: Date
    dateTo?: Date
    status?: string
    minAmount?: number
    maxAmount?: number
  }): Promise<Invoice[]> {
    // This would search invoices based on filters
    // For now, return empty array
    return []
  }

  // Export invoices for accounting
  async exportInvoicesForAccounting(period: {
    start: Date
    end: Date
  }, format: 'csv' | 'excel' | 'xml'): Promise<string> {
    // This would export invoices in accounting format
    return `Export data for period ${period.start.toDateString()} to ${period.end.toDateString()}`
  }

  // Generate tax report
  async generateTaxReport(period: {
    start: Date
    end: Date
  }): Promise<{
    totalRevenue: number
    totalTax: number
    taxableRevenue: number
    exemptRevenue: number
    taxByRate: Array<{ rate: number; amount: number }>
  }> {
    // This would generate a comprehensive tax report
    return {
      totalRevenue: 0,
      totalTax: 0,
      taxableRevenue: 0,
      exemptRevenue: 0,
      taxByRate: []
    }
  }

  // Handle invoice payments
  async recordPayment(invoiceId: string, paymentData: {
    amount: number
    paymentMethod: string
    transactionId?: string
    paymentDate: Date
    notes?: string
  }): Promise<boolean> {
    // This would record a payment against an invoice
    console.log(`Recording payment of ${paymentData.amount} for invoice ${invoiceId}`)
    return true
  }

  // Send payment reminders
  async sendPaymentReminders(): Promise<number> {
    // This would send payment reminders for overdue invoices
    const overdueInvoices = await this.getOverdueInvoices()
    
    for (const invoice of overdueInvoices) {
      await this.sendInvoiceEmail(invoice, invoice.customerEmail)
    }
    
    return overdueInvoices.length
  }

  // Get overdue invoices
  private async getOverdueInvoices(): Promise<Invoice[]> {
    // This would get all overdue invoices
    return []
  }

  // Generate invoice from booking
  async generateInvoiceFromBooking(bookingId: string): Promise<Invoice> {
    // This would create an invoice from a booking
    // Get booking details and create invoice items
    return this.createInvoice({
      invoiceNumber: '',
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      items: [],
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      paymentStatus: 'PENDING',
      paidAmount: 0,
      dueAmount: 0,
      currency: 'EGP'
    })
  }
}