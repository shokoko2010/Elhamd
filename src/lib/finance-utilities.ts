import { db } from '@/lib/db'
import {
  InvoicePaymentStatus,
  InvoiceStatus,
  InventoryStatus,
  PaymentMethod,
  PaymentStatus
} from '@prisma/client'
import {
  calculateInvoiceTotals,
  determineInvoiceStatus,
  determineInvoicePaymentStatus,
  determineInventoryStatus,
  formatCurrency,
  generateReferenceNumber
} from './finance-validation'

// Financial utilities and helper functions

export class FinanceManager {
  
  // Invoice utilities
  static async createInvoice(data: {
    customerId: string
    type?: string
    items: Array<{
      description: string
      quantity: number
      unitPrice: number
      taxRate?: number
      metadata?: any
    }>
    issueDate: Date
    dueDate: Date
    notes?: string
    terms?: string
    createdBy: string
    branchId?: string
  }) {
    const { subtotal, taxAmount, totalAmount } = calculateInvoiceTotals(data.items)
    
    const invoiceNumber = generateReferenceNumber('INV')
    
    return await db.invoice.create({
      data: {
        invoiceNumber,
        customerId: data.customerId,
        type: data.type || 'SERVICE',
        status: InvoiceStatus.DRAFT,
        paymentStatus: InvoicePaymentStatus.PENDING,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        currency: 'EGP',
        notes: data.notes,
        terms: data.terms,
        createdBy: data.createdBy,
        branchId: data.branchId,
        items: {
          create: data.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            taxRate: item.taxRate || 0,
            taxAmount: (item.quantity * item.unitPrice) * ((item.taxRate || 0) / 100),
            metadata: item.metadata || {}
          }))
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: true
      }
    })
  }

  static async updateInvoiceStatus(
    invoiceId: string, 
    newStatus: InvoiceStatus,
    userId: string,
    notes?: string
  ) {
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date()
    }

    // Set timestamps based on status
    if (newStatus === InvoiceStatus.PAID) {
      updateData.paidAt = new Date()
    } else if (newStatus === InvoiceStatus.CANCELLED) {
      updateData.cancelledAt = new Date()
    } else if (newStatus === InvoiceStatus.SENT) {
      updateData.sentAt = new Date()
    }

    if (notes) {
      updateData.metadata = {
        statusChangeNotes: notes,
        statusChangedBy: userId,
        statusChangedAt: new Date().toISOString()
      }
    }

    return await db.invoice.update({
      where: { id: invoiceId },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: true,
        payments: {
          include: {
            payment: true
          }
        }
      }
    })
  }

  static async recalculateInvoiceTotals(invoiceId: string) {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        payments: {
          include: {
            payment: true
          }
        },
        directPayments: true
      }
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    const { subtotal, taxAmount, totalAmount } = calculateInvoiceTotals(invoice.items)
    const allPayments = [
      ...invoice.payments.map(ip => ip.payment),
      ...invoice.directPayments
    ]
    const paidAmount = allPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const paymentStatus = determineInvoicePaymentStatus(totalAmount, paidAmount)
    const newStatus = determineInvoiceStatus(totalAmount, paidAmount, invoice.dueDate)
    const latestPaymentAt = allPayments.length
      ? allPayments.reduce((latest, payment) =>
          (payment.createdAt > latest ? payment.createdAt : latest),
          allPayments[0].createdAt
        )
      : invoice.lastPaymentAt
    const paidAt =
      paymentStatus === InvoicePaymentStatus.PAID || paymentStatus === InvoicePaymentStatus.OVERPAID
        ? latestPaymentAt ?? new Date()
        : paymentStatus === InvoicePaymentStatus.REFUNDED
          ? null
          : invoice.paidAt

    return await db.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount,
        status: newStatus,
        paymentStatus,
        paidAt,
        lastPaymentAt: latestPaymentAt ?? invoice.lastPaymentAt
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: true,
        payments: {
          include: {
            payment: true
          }
        },
        directPayments: true
      }
    })
  }

  // Payment utilities
  static async createPayment(data: {
    invoiceId?: string
    bookingId?: string
    bookingType?: 'SERVICE' | 'TEST_DRIVE'
    amount: number
    paymentMethod: string
    notes?: string
    transactionId?: string
    userId: string
    branchId?: string
    metadata?: any
    customerId?: string
  }) {
    let invoiceContext: {
      id: string
      customerId: string
      branchId: string | null
      currency: string
    } | null = null

    if (data.invoiceId) {
      invoiceContext = await db.invoice.findUnique({
        where: { id: data.invoiceId },
        select: {
          id: true,
          customerId: true,
          branchId: true,
          currency: true
        }
      })

      if (!invoiceContext) {
        throw new Error('Invoice not found')
      }
    }

    const inferredBookingType = (data.bookingType ||
      (typeof data.metadata?.bookingType === 'string'
        ? data.metadata.bookingType.toUpperCase()
        : undefined) ||
      (data.bookingId ? 'SERVICE' : undefined) ||
      'SERVICE') as 'SERVICE' | 'TEST_DRIVE'

    const serviceBookingId = inferredBookingType === 'SERVICE' ? data.bookingId ?? null : null
    const testDriveBookingId = inferredBookingType === 'TEST_DRIVE' ? data.bookingId ?? null : null

    const payment = await db.payment.create({
      data: {
        bookingId: data.bookingId,
        bookingType: inferredBookingType,
        serviceBookingId,
        testDriveBookingId,
        invoiceId: data.invoiceId,
        customerId: data.customerId ?? invoiceContext?.customerId,
        amount: data.amount,
        currency: invoiceContext?.currency ?? 'EGP',
        status: PaymentStatus.COMPLETED,
        paymentMethod: data.paymentMethod as PaymentMethod,
        transactionId: data.transactionId || generateReferenceNumber('PAY'),
        notes: data.notes,
        branchId: data.branchId ?? invoiceContext?.branchId ?? undefined,
        metadata: {
          ...data.metadata,
          createdBy: data.userId,
          createdAt: new Date().toISOString()
        }
      }
    })

    // If this is an invoice payment, create the relationship
    if (data.invoiceId) {
      await db.invoicePayment.create({
        data: {
          invoiceId: data.invoiceId,
          paymentId: payment.id,
          amount: data.amount,
          paymentDate: new Date(),
          paymentMethod: data.paymentMethod,
          transactionId: payment.transactionId,
          notes: data.notes
        }
      })

      // Update invoice status and totals
      await this.recalculateInvoiceTotals(data.invoiceId)
    }

    return payment
  }

  static async createOfflinePayment(data: {
    invoiceId: string
    amount: number
    paymentMethod: string
    notes?: string
    referenceNumber?: string
    paymentDate?: Date
    userId: string
  }) {
    const invoice = await db.invoice.findUnique({
      where: { id: data.invoiceId },
      include: {
        payments: {
          include: {
            payment: true
          }
        }
      }
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    const currentPaid = invoice.payments.reduce((sum, ip) => sum + ip.payment.amount, 0)
    const newTotalPaid = currentPaid + data.amount

    if (newTotalPaid > invoice.totalAmount) {
      throw new Error(`Payment amount exceeds invoice total. Maximum allowed: ${invoice.totalAmount - currentPaid}`)
    }

    const payment = await this.createPayment({
      invoiceId: data.invoiceId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      notes: data.notes || `Offline payment - ${data.paymentMethod}`,
      transactionId: data.referenceNumber || generateReferenceNumber('OFF'),
      userId: data.userId,
      branchId: invoice.branchId,
      customerId: invoice.customerId,
      bookingType: 'SERVICE',
      metadata: {
        type: 'OFFLINE',
        recordedBy: data.userId,
        referenceNumber: data.referenceNumber,
        paymentDate: data.paymentDate?.toISOString() || new Date().toISOString()
      }
    })

    // Create transaction record
    await db.transaction.create({
      data: {
        referenceId: generateReferenceNumber('TXN'),
        branchId: invoice.branchId,
        type: 'INCOME',
        category: 'INVOICE_PAYMENT',
        amount: data.amount,
        currency: invoice.currency,
        description: `Offline payment for invoice ${invoice.invoiceNumber}`,
        date: data.paymentDate || new Date(),
        paymentMethod: data.paymentMethod,
        reference: payment.transactionId,
        customerId: invoice.customerId,
        invoiceId: data.invoiceId,
        metadata: {
          type: 'OFFLINE',
          recordedBy: data.userId,
          paymentId: payment.id
        }
      }
    })

    return payment
  }

  // Inventory utilities
  static async updateInventoryStock(
    inventoryItemId: string,
    quantityChange: number,
    userId: string,
    reason?: string
  ) {
    const item = await db.inventoryItem.findUnique({
      where: { id: inventoryItemId }
    })

    if (!item) {
      throw new Error('Inventory item not found')
    }

    const newQuantity = item.quantity + quantityChange

    if (newQuantity < 0) {
      throw new Error('Insufficient stock')
    }

    const computedStatus = determineInventoryStatus(newQuantity, item.minStockLevel || 0)
    const normalizedStatus = (() => {
      switch (computedStatus) {
        case 'out_of_stock':
          return InventoryStatus.OUT_OF_STOCK
        case 'low_stock':
          return InventoryStatus.LOW_STOCK
        default:
          return InventoryStatus.IN_STOCK
      }
    })()
    const newStatus = item.status === InventoryStatus.DISCONTINUED ? InventoryStatus.DISCONTINUED : normalizedStatus

    const updatedItem = await db.inventoryItem.update({
      where: { id: inventoryItemId },
      data: {
        quantity: newQuantity,
        status: newStatus,
        updatedAt: new Date(),
        metadata: {
          ...item.metadata,
          lastStockUpdate: {
            quantityChange,
            newQuantity,
            updatedBy: userId,
            updatedAt: new Date().toISOString(),
            reason
          }
        }
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        action: quantityChange > 0 ? 'STOCK_ADDED' : 'STOCK_REMOVED',
        entityType: 'INVENTORY_ITEM',
        entityId: inventoryItemId,
        userId,
        details: {
          quantityChange,
          oldQuantity: item.quantity,
          newQuantity,
          reason
        }
      }
    })

    return updatedItem
  }

  static async integrateInventoryWithInvoice(
    invoiceId: string,
    inventoryItems: Array<{
      inventoryItemId: string
      quantity: number
      unitPrice: number
    }>,
    userId: string
  ) {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true
      }
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    const processedItems = []

    for (const item of inventoryItems) {
      const inventoryItem = await db.inventoryItem.findUnique({
        where: { id: item.inventoryItemId }
      })

      if (!inventoryItem) {
        throw new Error(`Inventory item ${item.inventoryItemId} not found`)
      }

      if (inventoryItem.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`)
      }

      // Update inventory stock
      await this.updateInventoryStock(
        item.inventoryItemId,
        -item.quantity,
        userId,
        `Invoice ${invoice.invoiceNumber}`
      )

      // Create invoice item
      const invoiceItem = await db.invoiceItem.create({
        data: {
          invoiceId,
          description: `${inventoryItem.name} (${inventoryItem.partNumber})`,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          taxRate: 0,
          taxAmount: 0,
          metadata: {
            inventoryItemId: item.inventoryItemId,
            partNumber: inventoryItem.partNumber,
            originalStock: inventoryItem.quantity,
            quantityUsed: item.quantity,
            remainingStock: inventoryItem.quantity - item.quantity,
            category: inventoryItem.category
          }
        }
      })

      processedItems.push(invoiceItem)
    }

    // Recalculate invoice totals
    await this.recalculateInvoiceTotals(invoiceId)

    return processedItems
  }

  // Reporting utilities
  static async getFinancialSummary(branchId?: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = {}
    
    if (branchId) {
      whereClause.branchId = branchId
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) whereClause.createdAt.gte = startDate
      if (endDate) whereClause.createdAt.lte = endDate
    }

    const [
      totalInvoices,
      totalPayments,
      totalTransactions,
      inventoryValue
    ] = await Promise.all([
      db.invoice.aggregate({
        where: whereClause,
        _sum: {
          totalAmount: true,
          paidAmount: true
        },
        _count: {
          id: true
        }
      }),
      db.payment.aggregate({
        where: {
          ...whereClause,
          status: PaymentStatus.COMPLETED
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      }),
      db.transaction.aggregate({
        where: whereClause,
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      }),
      db.inventoryItem.aggregate({
        where: whereClause,
        _sum: {
          quantity: true,
          unitPrice: true
        }
      })
    ])

    return {
      invoices: {
        count: totalInvoices._count.id,
        totalAmount: totalInvoices._sum.totalAmount || 0,
        paidAmount: totalInvoices._sum.paidAmount || 0,
        outstandingAmount: (totalInvoices._sum.totalAmount || 0) - (totalInvoices._sum.paidAmount || 0)
      },
      payments: {
        count: totalPayments._count.id,
        totalAmount: totalPayments._sum.amount || 0
      },
      transactions: {
        count: totalTransactions._count.id,
        totalAmount: totalTransactions._sum.amount || 0
      },
      inventory: {
        totalItems: inventoryValue._count.id || 0,
        totalQuantity: inventoryValue._sum.quantity || 0,
        totalValue: (inventoryValue._sum.quantity || 0) * (inventoryValue._sum.unitPrice || 0)
      }
    }
  }

  // Utility functions
  static formatFinancialAmount(amount: number, currency: string = 'EGP'): string {
    return formatCurrency(amount, currency)
  }

  static generateInvoiceNumber(): string {
    return generateReferenceNumber('INV')
  }

  static generateTransactionNumber(): string {
    return generateReferenceNumber('TXN')
  }

  static generatePaymentReference(): string {
    return generateReferenceNumber('PAY')
  }
}

// Export individual functions for backward compatibility
export {
  calculateInvoiceTotals,
  determineInvoiceStatus,
  determineInventoryStatus,
  formatCurrency,
  generateReferenceNumber
}