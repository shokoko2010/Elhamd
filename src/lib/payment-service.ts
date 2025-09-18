import { db } from '@/lib/db'
import { PaymentStatus, PaymentMethod, BookingStatus } from '@prisma/client'

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  clientSecret?: string
  status: PaymentStatus
  description?: string
  metadata?: Record<string, any>
}

export interface PaymentRequest {
  bookingId: string
  bookingType: 'test-drive' | 'service'
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  customerEmail: string
  customerPhone?: string
  customerName?: string
  description?: string
  notes?: string
}

export interface PaymentResult {
  success: boolean
  payment?: any
  error?: string
  redirectUrl?: string
  transactionId?: string
}

export interface PaymentGateway {
  name: string
  processPayment: (request: PaymentRequest) => Promise<PaymentResult>
  verifyPayment: (transactionId: string) => Promise<boolean>
  refundPayment: (paymentId: string, amount?: number) => Promise<PaymentResult>
  getPaymentInstructions: (method: PaymentMethod) => string
  getPaymentFees: (method: PaymentMethod, amount: number) => number
  isAvailable: () => boolean
}

export class PaymentService {
  private static instance: PaymentService
  private gateways: Map<PaymentMethod, PaymentGateway> = new Map()

  private constructor() {
    this.initializeGateways()
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService()
    }
    return PaymentService.instance
  }

  private initializeGateways() {
    // Initialize Egyptian payment gateways
    this.gateways.set(PaymentMethod.CREDIT_CARD, new FawryGateway())
    this.gateways.set(PaymentMethod.DEBIT_CARD, new FawryGateway())
    this.gateways.set(PaymentMethod.MOBILE_WALLET, new FawryGateway())
    this.gateways.set(PaymentMethod.BANK_TRANSFER, new BankTransferGateway())
    this.gateways.set(PaymentMethod.CASH, new CashGateway())
  }

  async createPaymentIntent(data: {
    amount: number
    currency: string
    description?: string
    metadata?: Record<string, any>
  }): Promise<PaymentIntent> {
    // Generate a unique payment intent ID
    const id = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store payment intent in database
    await db.payment.create({
      data: {
        id,
        bookingId: metadata?.bookingId || '',
        bookingType: metadata?.bookingType || 'SERVICE',
        amount: data.amount,
        currency: data.currency,
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CREDIT_CARD, // Default, will be updated
        description: data.description,
        notes: metadata ? JSON.stringify(metadata) : undefined
      }
    })

    return {
      id,
      amount: data.amount,
      currency: data.currency,
      status: PaymentStatus.PENDING,
      description: data.description,
      metadata: data.metadata
    }
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    const gateway = this.gateways.get(request.paymentMethod)
    
    if (!gateway || !gateway.isAvailable()) {
      return {
        success: false,
        error: `Payment method ${request.paymentMethod} is not available`
      }
    }

    try {
      // Calculate fees
      const fees = gateway.getPaymentFees(request.paymentMethod, request.amount)
      const totalAmount = request.amount + fees

      // Update request with total amount
      const paymentRequest = {
        ...request,
        amount: totalAmount
      }

      // Process payment through gateway
      const result = await gateway.processPayment(paymentRequest)

      if (result.success) {
        // Update payment record
        await db.payment.update({
          where: { id: result.payment?.id },
          data: {
            status: PaymentStatus.COMPLETED,
            transactionId: result.transactionId,
            paymentMethod: request.paymentMethod,
            notes: request.notes
          }
        })

        // Update booking status if payment is successful
        await this.updateBookingStatus(request.bookingId, request.bookingType, BookingStatus.CONFIRMED)

        // Send payment confirmation
        await this.sendPaymentConfirmation(request, result)
      }

      return result
    } catch (error) {
      console.error('Payment processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    // Find payment by transaction ID
    const payment = await db.payment.findFirst({
      where: { transactionId }
    })

    if (!payment) {
      return false
    }

    const gateway = this.gateways.get(payment.paymentMethod as PaymentMethod)
    if (!gateway) {
      return false
    }

    try {
      const isValid = await gateway.verifyPayment(transactionId)
      
      if (isValid) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.COMPLETED }
        })

        // Update booking status
        await this.updateBookingStatus(
          payment.bookingId,
          payment.bookingType as 'test-drive' | 'service',
          BookingStatus.CONFIRMED
        )
      }

      return isValid
    } catch (error) {
      console.error('Payment verification error:', error)
      return false
    }
  }

  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentResult> {
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

    const gateway = this.gateways.get(payment.paymentMethod as PaymentMethod)
    if (!gateway) {
      return {
        success: false,
        error: 'Payment gateway not available'
      }
    }

    try {
      const result = await gateway.refundPayment(paymentId, amount)

      if (result.success) {
        await db.payment.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.REFUNDED,
            notes: reason ? `Refunded: ${reason}` : payment.notes
          }
        })
      }

      return result
    } catch (error) {
      console.error('Refund processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund processing failed'
      }
    }
  }

  getAvailablePaymentMethods(): PaymentMethod[] {
    return Array.from(this.gateways.entries())
      .filter(([_, gateway]) => gateway.isAvailable())
      .map(([method]) => method as PaymentMethod)
  }

  getPaymentFees(method: PaymentMethod, amount: number): number {
    const gateway = this.gateways.get(method)
    return gateway ? gateway.getPaymentFees(method, amount) : 0
  }

  getPaymentInstructions(method: PaymentMethod): string {
    const gateway = this.gateways.get(method)
    return gateway ? gateway.getPaymentInstructions(method) : ''
  }

  private async updateBookingStatus(
    bookingId: string,
    bookingType: 'test-drive' | 'service',
    status: BookingStatus
  ): Promise<void> {
    if (bookingType === 'test-drive') {
      await db.testDriveBooking.update({
        where: { id: bookingId },
        data: { status }
      })
    } else {
      await db.serviceBooking.update({
        where: { id: bookingId },
        data: { status }
      })
    }
  }

  private async sendPaymentConfirmation(
    request: PaymentRequest,
    result: PaymentResult
  ): Promise<void> {
    try {
      // Create notification record
      await db.notification.create({
        data: {
          type: 'PAYMENT_RECEIVED',
          title: 'تأكيد الدفع',
          message: `تم استلام الدفع بنجاح لطلب ${request.bookingType}`,
          status: 'PENDING',
          channel: 'EMAIL',
          recipient: request.customerEmail,
          metadata: {
            bookingId: request.bookingId,
            bookingType: request.bookingType,
            amount: request.amount,
            transactionId: result.transactionId
          }
        }
      })
    } catch (error) {
      console.error('Failed to send payment confirmation:', error)
    }
  }

  async getPaymentHistory(userId?: string, limit: number = 50): Promise<any[]> {
    const where = userId ? { customerId: userId } : {}
    
    const payments = await db.payment.findMany({
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
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return payments
  }

  async getPaymentStats(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number
    successfulPayments: number
    failedPayments: number
    refundedPayments: number
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
      paymentMethods
    }
  }
}

// Fawry Payment Gateway Implementation
class FawryGateway implements PaymentGateway {
  name = 'Fawry'

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Simulate Fawry API call
      // In production, this would integrate with Fawry's actual API
      const transactionId = `fawry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Create payment record
      const payment = await db.payment.create({
        data: {
          id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          bookingId: request.bookingId,
          bookingType: request.bookingType.toUpperCase() as any,
          amount: request.amount,
          currency: request.currency,
          status: PaymentStatus.PENDING,
          paymentMethod: request.paymentMethod,
          transactionId
        }
      })

      // Simulate redirect URL for Fawry payment page
      const redirectUrl = `https://www.fawry.com/pay/${transactionId}`

      return {
        success: true,
        payment,
        redirectUrl,
        transactionId
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fawry payment failed'
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    // Simulate Fawry verification
    // In production, this would call Fawry's verification API
    return Math.random() > 0.1 // 90% success rate for simulation
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    try {
      // Simulate refund process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true,
        transactionId: `refund_${Date.now()}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      }
    }
  }

  getPaymentInstructions(method: PaymentMethod): string {
    const instructions = {
      [PaymentMethod.CREDIT_CARD]: 'ادخل بيانات بطاقتك الائتمانية الآمنة',
      [PaymentMethod.DEBIT_CARD]: 'ادخل بيانات بطاقتك المدينة',
      [PaymentMethod.MOBILE_WALLET]: 'اختر محفظتك المحمولة (فودافون، أورانج، إي)'
    }
    
    return instructions[method] || 'اختر طريقة الدفع'
  }

  getPaymentFees(method: PaymentMethod, amount: number): number {
    const feeStructure = {
      [PaymentMethod.CREDIT_CARD]: amount * 0.025, // 2.5%
      [PaymentMethod.DEBIT_CARD]: amount * 0.015, // 1.5%
      [PaymentMethod.MOBILE_WALLET]: amount * 0.02 // 2%
    }
    
    return feeStructure[method] || 0
  }

  isAvailable(): boolean {
    return true // Always available for simulation
  }
}

// Bank Transfer Gateway Implementation
class BankTransferGateway implements PaymentGateway {
  name = 'Bank Transfer'

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const payment = await db.payment.create({
        data: {
          id: `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          bookingId: request.bookingId,
          bookingType: request.bookingType.toUpperCase() as any,
          amount: request.amount,
          currency: request.currency,
          status: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.BANK_TRANSFER
        }
      })

      return {
        success: true,
        payment,
        transactionId: payment.id
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bank transfer failed'
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    // Bank transfers require manual verification
    return false
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    return {
      success: false,
      error: 'Bank transfer refunds require manual processing'
    }
  }

  getPaymentInstructions(method: PaymentMethod): string {
    return 'تحويل بنكي إلى الحساب: 1234567890 بنك القاهرة. الرجاء إرسال إيصال التحويل إلى support@elhamd-cars.com'
  }

  getPaymentFees(method: PaymentMethod, amount: number): number {
    return 0 // No fees for bank transfers
  }

  isAvailable(): boolean {
    return true
  }
}

// Cash Payment Gateway Implementation
class CashGateway implements PaymentGateway {
  name = 'Cash'

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const payment = await db.payment.create({
        data: {
          id: `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          bookingId: request.bookingId,
          bookingType: request.bookingType.toUpperCase() as any,
          amount: request.amount,
          currency: request.currency,
          status: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.CASH
        }
      })

      return {
        success: true,
        payment,
        transactionId: payment.id
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Cash payment failed'
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    // Cash payments require manual verification
    return false
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    return {
      success: false,
      error: 'Cash refunds require manual processing'
    }
  }

  getPaymentInstructions(method: PaymentMethod): string {
    return 'الدفع نقداً عند استلام الخدمة. يرجى إحضار المبلغ المحدد بالضبط'
  }

  getPaymentFees(method: PaymentMethod, amount: number): number {
    return 0 // No fees for cash payments
  }

  isAvailable(): boolean {
    return true
  }
}