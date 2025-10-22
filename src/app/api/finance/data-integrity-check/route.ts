import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('=== DATA INTEGRITY CHECK START ===')
    
    const results = {
      invoices: { issues: [], total: 0, fixed: 0 },
      payments: { issues: [], total: 0, fixed: 0 },
      invoicePayments: { issues: [], total: 0, fixed: 0 },
      inventory: { issues: [], total: 0, fixed: 0 },
      transactions: { issues: [], total: 0, fixed: 0 }
    }

    // 1. Check Invoice Data Integrity
    console.log('Checking invoice data integrity...')
    const invoices = await db.invoice.findMany({
      include: {
        items: true,
        payments: {
          include: {
            payment: true
          }
        },
        customer: true
      }
    })

    results.invoices.total = invoices.length

    for (const invoice of invoices) {
      // Check invoice totals
      const calculatedSubtotal = invoice.items.reduce((sum, item) => sum + item.totalPrice, 0)
      const calculatedTaxAmount = invoice.items.reduce((sum, item) => sum + item.taxAmount, 0)
      const calculatedTotal = calculatedSubtotal + calculatedTaxAmount

      if (Math.abs(invoice.subtotal - calculatedSubtotal) > 0.01) {
        results.invoices.issues.push({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          type: 'SUBTOTAL_MISMATCH',
          expected: calculatedSubtotal,
          actual: invoice.subtotal
        })

        // Fix the subtotal
        await db.invoice.update({
          where: { id: invoice.id },
          data: { subtotal: calculatedSubtotal }
        })
        results.invoices.fixed++
      }

      if (Math.abs(invoice.taxAmount - calculatedTaxAmount) > 0.01) {
        results.invoices.issues.push({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          type: 'TAX_MISMATCH',
          expected: calculatedTaxAmount,
          actual: invoice.taxAmount
        })

        // Fix the tax amount
        await db.invoice.update({
          where: { id: invoice.id },
          data: { taxAmount: calculatedTaxAmount }
        })
        results.invoices.fixed++
      }

      if (Math.abs(invoice.totalAmount - calculatedTotal) > 0.01) {
        results.invoices.issues.push({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          type: 'TOTAL_MISMATCH',
          expected: calculatedTotal,
          actual: invoice.totalAmount
        })

        // Fix the total amount
        await db.invoice.update({
          where: { id: invoice.id },
          data: { totalAmount: calculatedTotal }
        })
        results.invoices.fixed++
      }

      // Check paid amount consistency
      const calculatedPaidAmount = invoice.payments.reduce((sum, ip) => sum + ip.payment.amount, 0)
      if (Math.abs(invoice.paidAmount - calculatedPaidAmount) > 0.01) {
        results.invoices.issues.push({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          type: 'PAID_AMOUNT_MISMATCH',
          expected: calculatedPaidAmount,
          actual: invoice.paidAmount
        })

        // Fix the paid amount
        await db.invoice.update({
          where: { id: invoice.id },
          data: { paidAmount: calculatedPaidAmount }
        })
        results.invoices.fixed++
      }

      // Check status consistency
      let expectedStatus = invoice.status
      if (calculatedPaidAmount >= invoice.totalAmount) {
        expectedStatus = 'PAID'
      } else if (calculatedPaidAmount > 0) {
        expectedStatus = 'PARTIALLY_PAID'
      } else if (invoice.status === 'PAID' && calculatedPaidAmount === 0) {
        expectedStatus = 'SENT'
      }

      if (invoice.status !== expectedStatus) {
        results.invoices.issues.push({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          type: 'STATUS_MISMATCH',
          expected: expectedStatus,
          actual: invoice.status
        })

        // Fix the status
        await db.invoice.update({
          where: { id: invoice.id },
          data: { 
            status: expectedStatus,
            paidAt: expectedStatus === 'PAID' ? new Date() : invoice.paidAt
          }
        })
        results.invoices.fixed++
      }
    }

    // 2. Check Payment Data Integrity
    console.log('Checking payment data integrity...')
    const payments = await db.payment.findMany({
      include: {
        serviceBooking: {
          include: {
            customer: true
          }
        }
      }
    })

    results.payments.total = payments.length

    for (const payment of payments) {
      // Check payment amounts are positive
      if (payment.amount <= 0) {
        results.payments.issues.push({
          id: payment.id,
          transactionId: payment.transactionId,
          type: 'INVALID_AMOUNT',
          amount: payment.amount
        })
      }

      // Check payment status consistency
      if (payment.status === 'COMPLETED' && !payment.transactionId) {
        results.payments.issues.push({
          id: payment.id,
          type: 'MISSING_TRANSACTION_ID',
          status: payment.status
        })

        // Generate transaction ID
        await db.payment.update({
          where: { id: payment.id },
          data: { transactionId: `FIXED-${Date.now()}-${payment.id}` }
        })
        results.payments.fixed++
      }
    }

    // 3. Check InvoicePayment Relationships
    console.log('Checking invoice-payment relationships...')
    const invoicePayments = await db.invoicePayment.findMany({
      include: {
        invoice: true,
        payment: true
      }
    })

    results.invoicePayments.total = invoicePayments.length

    for (const ip of invoicePayments) {
      // Check if invoice exists
      if (!ip.invoice) {
        results.invoicePayments.issues.push({
          id: ip.id,
          type: 'ORPHANED_INVOICE_PAYMENT',
          invoiceId: ip.invoiceId,
          paymentId: ip.paymentId
        })

        // Remove orphaned record
        await db.invoicePayment.delete({
          where: { id: ip.id }
        })
        results.invoicePayments.fixed++
        continue
      }

      // Check if payment exists
      if (!ip.payment) {
        results.invoicePayments.issues.push({
          id: ip.id,
          type: 'ORPHANED_PAYMENT_RELATION',
          invoiceId: ip.invoiceId,
          paymentId: ip.paymentId
        })

        // Remove orphaned record
        await db.invoicePayment.delete({
          where: { id: ip.id }
        })
        results.invoicePayments.fixed++
        continue
      }

      // Check amount consistency
      if (Math.abs(ip.amount - ip.payment.amount) > 0.01) {
        results.invoicePayments.issues.push({
          id: ip.id,
          type: 'AMOUNT_MISMATCH',
          invoicePaymentAmount: ip.amount,
          paymentAmount: ip.payment.amount
        })

        // Fix the amount
        await db.invoicePayment.update({
          where: { id: ip.id },
          data: { amount: ip.payment.amount }
        })
        results.invoicePayments.fixed++
      }
    }

    // 4. Check Inventory Data Integrity
    console.log('Checking inventory data integrity...')
    const inventoryItems = await db.inventoryItem.findMany()

    results.inventory.total = inventoryItems.length

    for (const item of inventoryItems) {
      // Check status consistency
      let expectedStatus = item.status
      if (item.quantity === 0) {
        expectedStatus = 'out_of_stock'
      } else if (item.quantity <= (item.minStockLevel || 0)) {
        expectedStatus = 'low_stock'
      } else {
        expectedStatus = 'in_stock'
      }

      if (item.status !== expectedStatus) {
        results.inventory.issues.push({
          id: item.id,
          partNumber: item.partNumber,
          type: 'STATUS_MISMATCH',
          expected: expectedStatus,
          actual: item.status,
          quantity: item.quantity,
          minStockLevel: item.minStockLevel
        })

        // Fix the status
        await db.inventoryItem.update({
          where: { id: item.id },
          data: { status: expectedStatus }
        })
        results.inventory.fixed++
      }

      // Check negative quantities
      if (item.quantity < 0) {
        results.inventory.issues.push({
          id: item.id,
          partNumber: item.partNumber,
          type: 'NEGATIVE_QUANTITY',
          quantity: item.quantity
        })

        // Fix negative quantity
        await db.inventoryItem.update({
          where: { id: item.id },
          data: { quantity: 0, status: 'out_of_stock' }
        })
        results.inventory.fixed++
      }
    }

    // 5. Check Transaction Data Integrity
    console.log('Checking transaction data integrity...')
    const transactions = await db.transaction.findMany()

    results.transactions.total = transactions.length

    for (const transaction of transactions) {
      // Check transaction amounts are positive for income
      if (transaction.type === 'INCOME' && transaction.amount <= 0) {
        results.transactions.issues.push({
          id: transaction.id,
          referenceId: transaction.referenceId,
          type: 'INVALID_INCOME_AMOUNT',
          amount: transaction.amount
        })
      }

      // Check transaction amounts are negative for expenses
      if (transaction.type === 'EXPENSE' && transaction.amount >= 0) {
        results.transactions.issues.push({
          id: transaction.id,
          referenceId: transaction.referenceId,
          type: 'INVALID_EXPENSE_AMOUNT',
          amount: transaction.amount
        })
      }

      // Check for missing reference IDs
      if (!transaction.referenceId) {
        results.transactions.issues.push({
          id: transaction.id,
          type: 'MISSING_REFERENCE_ID',
          category: transaction.category
        })

        // Generate reference ID
        await db.transaction.update({
          where: { id: transaction.id },
          data: { referenceId: `FIXED-TXN-${Date.now()}-${transaction.id}` }
        })
        results.transactions.fixed++
      }
    }

    console.log('=== DATA INTEGRITY CHECK COMPLETE ===')

    return NextResponse.json({
      success: true,
      message: 'Data integrity check completed',
      results,
      summary: {
        totalIssues: Object.values(results).reduce((sum, r) => sum + r.issues.length, 0),
        totalFixed: Object.values(results).reduce((sum, r) => sum + r.fixed, 0),
        totalRecords: Object.values(results).reduce((sum, r) => sum + r.total, 0)
      },
      recommendations: [
        'Review any remaining issues that could not be automatically fixed',
        'Implement regular data integrity checks',
        'Add validation rules to prevent future data inconsistencies',
        'Monitor system logs for data integrity warnings'
      ]
    })

  } catch (error) {
    console.error('Error during data integrity check:', error)
    return NextResponse.json(
      { error: 'Failed to perform data integrity check' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get basic statistics
    const [
      invoiceCount,
      paymentCount,
      inventoryCount,
      transactionCount,
      customerCount
    ] = await Promise.all([
      db.invoice.count(),
      db.payment.count(),
      db.inventoryItem.count(),
      db.transaction.count(),
      db.user.count({ where: { role: 'CUSTOMER' } })
    ])

    return NextResponse.json({
      statistics: {
        invoices: invoiceCount,
        payments: paymentCount,
        inventoryItems: inventoryCount,
        transactions: transactionCount,
        customers: customerCount
      },
      lastCheck: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching data integrity statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data integrity statistics' },
      { status: 500 }
    )
  }
}