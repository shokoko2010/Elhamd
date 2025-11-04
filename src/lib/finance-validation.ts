import {
  PaymentMethod,
  PaymentStatus,
  InvoiceStatus,
  InvoiceType,
  InvoicePaymentStatus
} from '@prisma/client'

// Validation schemas and utilities for finance operations

export interface PaymentValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface InvoiceValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  calculatedTotals: {
    subtotal: number
    taxAmount: number
    totalAmount: number
  }
}

export interface InventoryValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  stockUpdates: Array<{
    itemId: string
    currentQuantity: number
    requestedQuantity: number
    newQuantity: number
    status: string
  }>
}

// Payment validation
export function validatePaymentData(data: {
  amount: number | string
  paymentMethod: string
  invoiceId?: string
  bookingId?: string
  transactionId?: string
}): PaymentValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate amount
  const amount = parseFloat(data.amount.toString())
  if (isNaN(amount)) {
    errors.push('Payment amount must be a valid number')
  } else if (amount <= 0) {
    errors.push('Payment amount must be greater than 0')
  } else if (amount > 1000000) {
    warnings.push('Payment amount is unusually high')
  }

  // Validate payment method
  const validPaymentMethods = Object.values(PaymentMethod)
  if (!validPaymentMethods.includes(data.paymentMethod as PaymentMethod)) {
    errors.push(`Invalid payment method. Valid methods: ${validPaymentMethods.join(', ')}`)
  }

  // Validate IDs
  if (!data.invoiceId && !data.bookingId) {
    errors.push('Either invoiceId or bookingId must be provided')
  }

  if (data.transactionId && data.transactionId.length < 3) {
    errors.push('Transaction ID must be at least 3 characters long')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Invoice validation
export function validateInvoiceData(data: {
  customerId: string
  type?: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    taxRate?: number
  }>
  issueDate: string
  dueDate: string
}): InvoiceValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate customer
  if (!data.customerId || data.customerId.length < 1) {
    errors.push('Customer ID is required')
  }

  // Validate invoice type
  if (data.type) {
    const validTypes = Object.values(InvoiceType)
    if (!validTypes.includes(data.type as InvoiceType)) {
      errors.push(`Invalid invoice type. Valid types: ${validTypes.join(', ')}`)
    }
  }

  // Validate items
  if (!data.items || data.items.length === 0) {
    errors.push('At least one invoice item is required')
  } else {
    data.items.forEach((item, index) => {
      if (!item.description || item.description.trim().length < 3) {
        errors.push(`Item ${index + 1}: Description must be at least 3 characters`)
      }
      
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`)
      }
      
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors.push(`Item ${index + 1}: Unit price must be greater than 0`)
      }
      
      if (item.unitPrice > 100000) {
        warnings.push(`Item ${index + 1}: Unit price is unusually high`)
      }
      
      if (item.taxRate && (item.taxRate < 0 || item.taxRate > 100)) {
        errors.push(`Item ${index + 1}: Tax rate must be between 0 and 100`)
      }
    })
  }

  // Validate dates
  const issueDate = new Date(data.issueDate)
  const dueDate = new Date(data.dueDate)
  const now = new Date()

  if (isNaN(issueDate.getTime())) {
    errors.push('Issue date is invalid')
  } else if (issueDate > now) {
    warnings.push('Issue date is in the future')
  }

  if (isNaN(dueDate.getTime())) {
    errors.push('Due date is invalid')
  } else if (dueDate <= issueDate) {
    errors.push('Due date must be after issue date')
  }

  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const taxAmount = data.items.reduce((sum, item) => {
    const itemTaxRate = (item.taxRate || 0) / 100
    return sum + (item.quantity * item.unitPrice * itemTaxRate)
  }, 0)
  const totalAmount = subtotal + taxAmount

  if (totalAmount > 1000000) {
    warnings.push('Invoice total is unusually high')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    calculatedTotals: {
      subtotal,
      taxAmount,
      totalAmount
    }
  }
}

// Inventory validation
export function validateInventoryUpdate(data: {
  items: Array<{
    inventoryItemId: string
    quantity: number
  }>
}): InventoryValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const stockUpdates: Array<{
    itemId: string
    currentQuantity: number
    requestedQuantity: number
    newQuantity: number
    status: string
  }> = []

  if (!data.items || data.items.length === 0) {
    errors.push('At least one inventory item must be specified')
  } else {
    data.items.forEach((item, index) => {
      if (!item.inventoryItemId || item.inventoryItemId.length < 1) {
        errors.push(`Item ${index + 1}: Inventory item ID is required`)
      }
      
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`)
      }
      
      if (item.quantity > 10000) {
        warnings.push(`Item ${index + 1}: Quantity is unusually high`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stockUpdates
  }
}

// Status transition validation
export function validateInvoiceStatusTransition(
  currentStatus: InvoiceStatus,
  newStatus: InvoiceStatus
): { isValid: boolean; error?: string } {
  const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    [InvoiceStatus.DRAFT]: [InvoiceStatus.SENT, InvoiceStatus.CANCELLED],
    [InvoiceStatus.SENT]: [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED],
    [InvoiceStatus.PARTIALLY_PAID]: [InvoiceStatus.PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED],
    [InvoiceStatus.PAID]: [InvoiceStatus.REFUNDED],
    [InvoiceStatus.OVERDUE]: [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.CANCELLED],
    [InvoiceStatus.CANCELLED]: [InvoiceStatus.DRAFT],
    [InvoiceStatus.REFUNDED]: []
  }

  const allowed = allowedTransitions[currentStatus]?.includes(newStatus)
  
  return {
    isValid: allowed,
    error: allowed ? undefined : `Cannot transition from ${currentStatus} to ${newStatus}`
  }
}

// Financial calculations
export function calculateInvoiceTotals(items: Array<{
  quantity: number
  unitPrice: number
  taxRate?: number
}>) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const taxAmount = items.reduce((sum, item) => {
    const itemTaxRate = (item.taxRate || 0) / 100
    return sum + (item.quantity * item.unitPrice * itemTaxRate)
  }, 0)
  const totalAmount = subtotal + taxAmount

  return {
    subtotal,
    taxAmount,
    totalAmount
  }
}

// Payment allocation validation
export function validatePaymentAllocation(
  invoiceTotal: number,
  currentPaid: number,
  paymentAmount: number
): { isValid: boolean; error?: string; newPaidAmount: number } {
  const newPaidAmount = currentPaid + paymentAmount

  if (paymentAmount <= 0) {
    return {
      isValid: false,
      error: 'Payment amount must be greater than 0',
      newPaidAmount
    }
  }

  if (newPaidAmount > invoiceTotal) {
    const overpayment = newPaidAmount - invoiceTotal
    return {
      isValid: false,
      error: `Payment exceeds invoice total by ${overpayment.toFixed(2)}`,
      newPaidAmount
    }
  }

  return {
    isValid: true,
    newPaidAmount
  }
}

// Inventory stock validation
export function validateStockAvailability(
  currentStock: number,
  requestedQuantity: number
): { isValid: boolean; error?: string; remainingStock: number } {
  if (requestedQuantity <= 0) {
    return {
      isValid: false,
      error: 'Requested quantity must be greater than 0',
      remainingStock: currentStock
    }
  }

  if (currentStock < requestedQuantity) {
    return {
      isValid: false,
      error: `Insufficient stock. Available: ${currentStock}, Requested: ${requestedQuantity}`,
      remainingStock: currentStock
    }
  }

  const remainingStock = currentStock - requestedQuantity
  return {
    isValid: true,
    remainingStock
  }
}

// Utility function to determine inventory status based on quantity
export function determineInventoryStatus(
  quantity: number,
  minStockLevel: number = 0
): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity === 0) {
    return 'out_of_stock'
  } else if (quantity <= minStockLevel) {
    return 'low_stock'
  } else {
    return 'in_stock'
  }
}

// Utility function to determine invoice status based on payments
export function determineInvoiceStatus(
  totalAmount: number,
  paidAmount: number,
  dueDate: Date
): InvoiceStatus {
  if (paidAmount >= totalAmount) {
    return InvoiceStatus.PAID
  } else if (paidAmount > 0) {
    return InvoiceStatus.PARTIALLY_PAID
  } else if (dueDate < new Date()) {
    return InvoiceStatus.OVERDUE
  } else {
    return InvoiceStatus.SENT
  }
}

export function determineInvoicePaymentStatus(
  totalAmount: number,
  paidAmount: number
): InvoicePaymentStatus {
  if (paidAmount <= 0) {
    return InvoicePaymentStatus.PENDING
  }

  if (paidAmount < totalAmount) {
    return InvoicePaymentStatus.PARTIALLY_PAID
  }

  if (paidAmount === totalAmount) {
    return InvoicePaymentStatus.PAID
  }

  if (paidAmount > totalAmount) {
    return InvoicePaymentStatus.OVERPAID
  }

  return InvoicePaymentStatus.PENDING
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'EGP'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Generate unique reference numbers
export function generateReferenceNumber(prefix: string, length: number = 8): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, length)
  return `${prefix}-${timestamp}-${random}`.toUpperCase()
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number format (basic)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}