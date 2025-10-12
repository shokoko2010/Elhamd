import { db } from '@/lib/db'
import { Payment, Invoice } from '@prisma/client'

export interface PaymentRequest {
  invoiceId: string
  amount: number
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CHECK'
  transactionId?: string
  notes?: string
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  error?: string
  transactionId?: string
}

export class PaymentService {
  static async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Get invoice details
      const invoice = await db.invoice.findUnique({
        where: { id: request.invoiceId },
        include: {
          customer: true,
          vehicle: true
        }
      })

      if (!invoice) {
        return {
          success: false,
          error: 'Invoice not found'
        }
      }

      // Check if payment amount is valid
      if (request.amount <= 0) {
        return {
          success: false,
          error: 'Invalid payment amount'
        }
      }

      // Check if payment would exceed invoice total
      const totalPaid = invoice.paidAmount + request.amount
      if (totalPaid > invoice.totalAmount) {
        return {
          success: false,
          error: 'Payment amount exceeds invoice total'
        }
      }

      // Process payment based on method
      const paymentResult = await this.processPaymentByMethod(request, invoice)

      if (!paymentResult.success) {
        return paymentResult
      }

      // Create payment record
      const payment = await db.payment.create({
        data: {
          invoiceId: request.invoiceId,
          customerId: invoice.customerId,
          amount: request.amount,
          paymentMethod: request.paymentMethod,
          transactionId: request.transactionId || paymentResult.transactionId,
          status: 'COMPLETED',
          notes: request.notes
        }
      })

      // Update invoice
      await db.invoice.update({
        where: { id: request.invoiceId },
        data: {
          paidAmount: {
            increment: request.amount
          },
          // paymentStatus: totalPaid >= invoice.totalAmount ? 'PAID' : 
          //                totalPaid > 0 ? 'PARTIALLY_PAID' : 'PENDING', // Field not in Invoice model
          paidAt: new Date()
        }
      })

      return {
        success: true,
        paymentId: payment.id,
        transactionId: payment.transactionId || undefined
      }

    } catch (error) {
      console.error('Payment processing error:', error)
      return {
        success: false,
        error: 'Payment processing failed'
      }
    }
  }

  private static async processPaymentByMethod(request: PaymentRequest, invoice: Invoice): Promise<PaymentResult> {
    // Simulate payment processing based on method
    switch (request.paymentMethod) {
      case 'CASH':
        return this.processCashPayment(request)
      case 'CREDIT_CARD':
        return this.processCreditCardPayment(request)
      case 'BANK_TRANSFER':
        return this.processBankTransferPayment(request)
      case 'CHECK':
        return this.processCheckPayment(request)
      default:
        return {
          success: false,
          error: 'Invalid payment method'
        }
    }
  }

  private static async processCashPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate cash payment processing
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      transactionId: `CASH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  private static async processCreditCardPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate credit card payment processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In real implementation, integrate with payment gateway like Stripe, PayPal, etc.
    return {
      success: true,
      transactionId: `CC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  private static async processBankTransferPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate bank transfer payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      success: true,
      transactionId: `BT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  private static async processCheckPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate check payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return {
      success: true,
      transactionId: `CHK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  static async getPaymentHistory(invoiceId: string): Promise<Payment[]> {
    try {
      const payments = await db.payment.findMany({
        where: { invoiceId },
        orderBy: { createdAt: 'desc' }
      })
      return payments
    } catch (error) {
      console.error('Error fetching payment history:', error)
      throw new Error('Failed to fetch payment history')
    }
  }

  static async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    try {
      const payment = await db.payment.findUnique({
        where: { id: paymentId },
        include: {
          invoice: true
        }
      })

      if (!payment) {
        return {
          success: false,
          error: 'Payment not found'
        }
      }

      if (payment.status !== 'COMPLETED') {
        return {
          success: false,
          error: 'Payment cannot be refunded'
        }
      }

      const refundAmount = amount || payment.amount
      if (refundAmount > payment.amount) {
        return {
          success: false,
          error: 'Refund amount exceeds payment amount'
        }
      }

      // Process refund based on payment method
      const refundResult = await this.processRefund(payment, refundAmount)

      if (!refundResult.success) {
        return refundResult
      }

      // Create refund record
      const refund = await db.payment.create({
        data: {
          invoiceId: payment.invoiceId,
          customerId: payment.customerId,
          amount: -refundAmount, // Negative amount for refund
          paymentMethod: payment.paymentMethod,
          transactionId: refundResult.transactionId,
          status: 'COMPLETED',
          notes: `Refund for payment ${paymentId}`
        }
      })

      // Update invoice paid amount
      await db.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          paidAmount: {
            decrement: refundAmount
          },
          // paymentStatus: 'PARTIALLY_PAID', // After refund, it's no longer fully paid
          lastPaymentAt: new Date()
        }
      })

      return {
        success: true,
        paymentId: refund.id,
        transactionId: refund.transactionId || undefined
      }

    } catch (error) {
      console.error('Refund processing error:', error)
      return {
        success: false,
        error: 'Refund processing failed'
      }
    }
  }

  private static async processRefund(payment: Payment, amount: number): Promise<PaymentResult> {
    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      transactionId: `REFUND_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  static async getPaymentMethods(): Promise<string[]> {
    return ['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'CHECK']
  }

  static async validatePaymentMethod(method: string): Promise<boolean> {
    const validMethods = await this.getPaymentMethods()
    return validMethods.includes(method)
  }
}

// Export paymentService instance for backward compatibility
export const paymentService = new PaymentService()