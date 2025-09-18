import { db } from '@/lib/db'
import { Payment, PaymentStatus, PaymentMethod, BookingStatus } from '@prisma/client'
import { PaymentGatewayFactory, PaymentGateway, PaymentRequest, PaymentResponse, RefundRequest } from './payment-gateways'
import { emailService } from './email-service'

export interface EnhancedPaymentRequest {
  bookingId: string
  bookingType: 'test-drive' | 'service'
  amount: number
  currency?: string
  paymentMethod: PaymentMethod
  customerEmail: string
  customerPhone?: string
  customerName?: string
  description?: string
  notes?: string
  metadata?: Record<string, any>
}

export interface EnhancedPaymentResult {
  success: boolean
  payment?: Payment
  redirectUrl?: string
  transactionId?: string
  error?: string
  fees?: number
  totalAmount?: number
  paymentInstructions?: string
  requiresRedirect?: boolean
}

export class EnhancedPaymentService {
  private static instance: EnhancedPaymentService

  static getInstance(): EnhancedPaymentService {
    if (!EnhancedPaymentService.instance) {
      EnhancedPaymentService.instance = new EnhancedPaymentService()
    }
    return EnhancedPaymentService.instance
  }

  async processPayment(request: EnhancedPaymentRequest): Promise<EnhancedPaymentResult> {
    try {
      // Get the appropriate gateway for the payment method
      const gateway = PaymentGatewayFactory.getGatewayForPaymentMethod(request.paymentMethod)
      
      if (!gateway) {
        return {
          success: false,
          error: `Payment method ${request.paymentMethod} is not available`
        }
      }

      // Calculate fees
      const fees = gateway.getPaymentFees(request.paymentMethod, request.amount)
      const totalAmount = request.amount + fees

      // Create payment record in database
      const payment = await db.payment.create({
        data: {
          bookingId: request.bookingId,
          bookingType: request.bookingType.toUpperCase() as 'SERVICE' | 'TEST_DRIVE',
          amount: totalAmount,
          currency: request.currency || 'EGP',
          status: PaymentStatus.PENDING,
          paymentMethod: request.paymentMethod,
          description: request.description,
          notes: request.notes || (fees > 0 ? `Includes payment fees: ${fees} EGP` : undefined)
        }
      })

      // Prepare payment request for gateway
      const gatewayRequest: PaymentRequest = {
        amount: totalAmount,
        currency: request.currency || 'EGP',
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        customerName: request.customerName,
        description: request.description || `Payment for ${request.bookingType} booking`,
        returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/success?payment=${payment.id}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/cancel?payment=${payment.id}`,
        metadata: {
          ...request.metadata,
          bookingId: request.bookingId,
          bookingType: request.bookingType,
          paymentId: payment.id,
          originalAmount: request.amount,
          fees
        }
      }

      // Process payment through gateway
      const gatewayResponse = await gateway.processPayment(gatewayRequest)

      if (gatewayResponse.success) {
        // Update payment record with transaction details
        await db.payment.update({
          where: { id: payment.id },
          data: {
            transactionId: gatewayResponse.transactionId,
            status: gatewayResponse.requiresRedirect ? PaymentStatus.PENDING : PaymentStatus.COMPLETED
          }
        })

        // If payment doesn't require redirect, mark as completed
        if (!gatewayResponse.requiresRedirect) {
          await this.handlePaymentCompletion(payment)
        }

        return {
          success: true,
          payment,
          redirectUrl: gatewayResponse.redirectUrl,
          transactionId: gatewayResponse.transactionId,
          fees,
          totalAmount,
          paymentInstructions: gateway.getPaymentInstructions(request.paymentMethod),
          requiresRedirect: gatewayResponse.requiresRedirect
        }
      } else {
        // Mark payment as failed
        await db.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.FAILED }
        })

        return {
          success: false,
          error: gatewayResponse.error || 'Payment processing failed'
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      // Find payment by transaction ID
      const payment = await db.payment.findFirst({
        where: { transactionId }
      })

      if (!payment) {
        console.error('Payment not found for transaction:', transactionId)
        return false
      }

      // Get the gateway for this payment method
      const gateway = PaymentGatewayFactory.getGatewayForPaymentMethod(payment.paymentMethod as PaymentMethod)
      
      if (!gateway) {
        console.error('Gateway not found for payment method:', payment.paymentMethod)
        return false
      }

      // Verify payment with gateway
      const verification = await gateway.verifyPayment(transactionId)

      if (verification.success) {
        // Update payment status
        await db.payment.update({
          where: { id: payment.id },
          data: { status: verification.status }
        })

        // If payment is completed, handle completion
        if (verification.status === PaymentStatus.COMPLETED) {
          await this.handlePaymentCompletion(payment)
        }

        return true
      }

      return false
    } catch (error) {
      console.error('Payment verification error:', error)
      return false
    }
  }

  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<EnhancedPaymentResult> {
    try {
      const payment = await db.payment.findUnique({
        where: { id: paymentId }
      })

      if (!payment) {
        return {
          success: false,
          error: 'Payment not found'
        }
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        return {
          success: false,
          error: 'Payment cannot be refunded'
        }
      }

      // Get the gateway for this payment method
      const gateway = PaymentGatewayFactory.getGatewayForPaymentMethod(payment.paymentMethod as PaymentMethod)
      
      if (!gateway) {
        return {
          success: false,
          error: 'Payment gateway not available'
        }
      }

      // Prepare refund request
      const refundRequest: RefundRequest = {
        originalTransactionId: payment.transactionId || '',
        amount,
        reason,
        merchantRefNum: payment.id
      }

      // Process refund through gateway
      const refundResponse = await gateway.refundPayment(refundRequest)

      if (refundResponse.success) {
        // Update payment status
        await db.payment.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.REFUNDED,
            notes: reason ? `Refunded: ${reason}` : payment.notes
          }
        })

        // Send refund confirmation email
        await this.sendRefundConfirmation(payment, amount || payment.amount)

        return {
          success: true,
          transactionId: refundResponse.transactionId
        }
      } else {
        return {
          success: false,
          error: refundResponse.error || 'Refund processing failed'
        }
      }
    } catch (error) {
      console.error('Refund processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund processing failed'
      }
    }
  }

  async handleWebhook(gatewayCode: string, data: any): Promise<boolean> {
    try {
      const gateway = PaymentGatewayFactory.getGateway(gatewayCode)
      
      if (!gateway) {
        console.error('Gateway not found:', gatewayCode)
        return false
      }

      // Validate webhook
      const isValid = await gateway.validateWebhook({
        headers: {}, // Headers would be passed from the request
        body: data
      })

      if (!isValid) {
        console.error('Invalid webhook signature for gateway:', gatewayCode)
        return false
      }

      // Extract transaction ID from webhook data
      const transactionId = data.transaction_id || data.TransactionID || data.merchantRefNum
      
      if (!transactionId) {
        console.error('No transaction ID in webhook data')
        return false
      }

      // Verify and update payment
      return await this.verifyPayment(transactionId)
    } catch (error) {
      console.error('Webhook processing error:', error)
      return false
    }
  }

  getAvailablePaymentMethods(): PaymentMethod[] {
    return PaymentGatewayFactory.getAvailablePaymentMethods()
  }

  getPaymentFees(method: PaymentMethod, amount: number): number {
    const gateway = PaymentGatewayFactory.getGatewayForPaymentMethod(method)
    return gateway ? gateway.getPaymentFees(method, amount) : 0
  }

  getPaymentInstructions(method: PaymentMethod): string {
    const gateway = PaymentGatewayFactory.getGatewayForPaymentMethod(method)
    return gateway ? gateway.getPaymentInstructions(method) : ''
  }

  getPaymentMethodDetails(method: PaymentMethod): {
    method: PaymentMethod
    name: string
    description: string
    fees: number
    available: boolean
    icon: string
  } {
    const gateway = PaymentGatewayFactory.getGatewayForPaymentMethod(method)
    const fees = this.getPaymentFees(method, 1000) // Example amount
    
    return {
      method,
      name: this.getPaymentMethodName(method),
      description: gateway ? gateway.getPaymentInstructions(method) : '',
      fees,
      available: gateway !== null,
      icon: this.getPaymentMethodIcon(method)
    }
  }

  getAllPaymentMethodsDetails(): Array<{
    method: PaymentMethod
    name: string
    description: string
    fees: number
    available: boolean
    icon: string
  }> {
    const methods = this.getAvailablePaymentMethods()
    return methods.map(method => this.getPaymentMethodDetails(method))
  }

  async getPaymentHistory(userId?: string, limit: number = 50): Promise<Payment[]> {
    const where = userId ? { customerId: userId } : {}
    
    return await db.payment.findMany({
      where,
      include: {
        serviceBooking: {
          include: {
            customer: {
              select: { name: true, email: true }
            },
            serviceType: {
              select: { name: true }
            }
          }
        },
        testDriveBooking: {
          include: {
            customer: {
              select: { name: true, email: true }
            },
            vehicle: {
              select: { make: true, model: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  async getPaymentStats(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number
    successfulPayments: number
    failedPayments: number
    refundedPayments: number
    pendingPayments: number
    paymentMethods: Record<PaymentMethod, { count: number; amount: number }>
  }> {
    const payments = await db.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const totalRevenue = payments
      .filter(p => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + p.amount, 0)

    const successfulPayments = payments.filter(p => p.status === PaymentStatus.COMPLETED).length
    const failedPayments = payments.filter(p => p.status === PaymentStatus.FAILED).length
    const refundedPayments = payments.filter(p => p.status === PaymentStatus.REFUNDED).length
    const pendingPayments = payments.filter(p => p.status === PaymentStatus.PENDING).length

    const paymentMethods = payments.reduce((acc, payment) => {
      const method = payment.paymentMethod as PaymentMethod
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 }
      }
      acc[method].count++
      if (payment.status === PaymentStatus.COMPLETED) {
        acc[method].amount += payment.amount
      }
      return acc
    }, {} as Record<PaymentMethod, { count: number; amount: number }>)

    return {
      totalRevenue,
      successfulPayments,
      failedPayments,
      refundedPayments,
      pendingPayments,
      paymentMethods
    }
  }

  private async handlePaymentCompletion(payment: Payment): Promise<void> {
    try {
      // Update booking status
      if (payment.bookingType === 'SERVICE') {
        await db.serviceBooking.update({
          where: { id: payment.bookingId },
          data: { 
            status: BookingStatus.CONFIRMED,
            paymentStatus: PaymentStatus.COMPLETED
          }
        })
      } else if (payment.bookingType === 'TEST_DRIVE') {
        await db.testDriveBooking.update({
          where: { id: payment.bookingId },
          data: { 
            status: BookingStatus.CONFIRMED,
            paymentStatus: PaymentStatus.COMPLETED
          }
        })
      }

      // Get customer details
      let customerEmail = ''
      let customerName = ''

      if (payment.bookingType === 'SERVICE') {
        const booking = await db.serviceBooking.findUnique({
          where: { id: payment.bookingId },
          include: { customer: true }
        })
        if (booking?.customer) {
          customerEmail = booking.customer.email
          customerName = booking.customer.name || 'عميل'
        }
      } else if (payment.bookingType === 'TEST_DRIVE') {
        const booking = await db.testDriveBooking.findUnique({
          where: { id: payment.bookingId },
          include: { customer: true }
        })
        if (booking?.customer) {
          customerEmail = booking.customer.email
          customerName = booking.customer.name || 'عميل'
        }
      }

      // Send payment confirmation email
      if (customerEmail) {
        await emailService.sendPaymentReceived(
          payment.id,
          customerEmail,
          customerName
        )
      }

      // Create notification
      await db.notification.create({
        data: {
          type: 'PAYMENT_RECEIVED',
          title: 'تأكيد الدفع',
          message: `تم استلام الدفع بنجاح لطلب ${payment.bookingType.toLowerCase()}`,
          status: 'PENDING',
          channel: 'EMAIL',
          recipient: customerEmail,
          metadata: {
            bookingId: payment.bookingId,
            bookingType: payment.bookingType,
            amount: payment.amount,
            transactionId: payment.transactionId
          }
        }
      })
    } catch (error) {
      console.error('Error handling payment completion:', error)
      // Don't throw here as payment is already completed
    }
  }

  private async sendRefundConfirmation(payment: Payment, refundAmount: number): Promise<void> {
    try {
      // Get customer details
      let customerEmail = ''
      let customerName = ''

      if (payment.bookingType === 'SERVICE') {
        const booking = await db.serviceBooking.findUnique({
          where: { id: payment.bookingId },
          include: { customer: true }
        })
        if (booking?.customer) {
          customerEmail = booking.customer.email
          customerName = booking.customer.name || 'عميل'
        }
      } else if (payment.bookingType === 'TEST_DRIVE') {
        const booking = await db.testDriveBooking.findUnique({
          where: { id: payment.bookingId },
          include: { customer: true }
        })
        if (booking?.customer) {
          customerEmail = booking.customer.email
          customerName = booking.customer.name || 'عميل'
        }
      }

      // Send refund confirmation email
      if (customerEmail) {
        await emailService.sendRefundConfirmation(
          payment.id,
          customerEmail,
          customerName,
          refundAmount
        )
      }
    } catch (error) {
      console.error('Error sending refund confirmation:', error)
    }
  }

  private getPaymentMethodName(method: PaymentMethod): string {
    const names = {
      [PaymentMethod.CASH]: 'نقدي',
      [PaymentMethod.CREDIT_CARD]: 'بطاقة ائتمان',
      [PaymentMethod.DEBIT_CARD]: 'بطاقة خصم',
      [PaymentMethod.BANK_TRANSFER]: 'تحويل بنكي',
      [PaymentMethod.MOBILE_WALLET]: 'محفظة إلكترونية'
    }
    return names[method] || method
  }

  private getPaymentMethodIcon(method: PaymentMethod): string {
    const icons = {
      [PaymentMethod.CASH]: '💵',
      [PaymentMethod.CREDIT_CARD]: '💳',
      [PaymentMethod.DEBIT_CARD]: '💳',
      [PaymentMethod.BANK_TRANSFER]: '🏦',
      [PaymentMethod.MOBILE_WALLET]: '📱'
    }
    return icons[method] || '💳'
  }
}

export const enhancedPaymentService = EnhancedPaymentService.getInstance()
export default EnhancedPaymentService