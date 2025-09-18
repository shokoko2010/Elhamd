import { db } from './db'
import { Payment, PaymentStatus, PaymentMethod } from '@prisma/client'
import { emailService } from './email'

interface PaymentData {
  bookingId: string
  bookingType: 'SERVICE' | 'TEST_DRIVE'
  amount: number
  currency?: string
  paymentMethod: PaymentMethod
  transactionId?: string
  receiptUrl?: string
  notes?: string
}

class PaymentService {
  async createPayment(data: PaymentData): Promise<Payment> {
    try {
      const payment = await db.payment.create({
        data: {
          bookingId: data.bookingId,
          bookingType: data.bookingType,
          amount: data.amount,
          currency: data.currency || 'EGP',
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          receiptUrl: data.receiptUrl,
          notes: data.notes,
          status: PaymentStatus.PENDING
        }
      })

      return payment
    } catch (error) {
      console.error('Error creating payment:', error)
      throw new Error('Failed to create payment')
    }
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    transactionId?: string,
    receiptUrl?: string
  ): Promise<Payment> {
    try {
      const payment = await db.payment.update({
        where: { id: paymentId },
        data: {
          status,
          transactionId: transactionId,
          receiptUrl: receiptUrl
        }
      })

      // If payment is completed, update booking payment status and send email
      if (status === PaymentStatus.COMPLETED) {
        await this.handlePaymentCompletion(payment)
      }

      return payment
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw new Error('Failed to update payment status')
    }
  }

  private async handlePaymentCompletion(payment: Payment) {
    try {
      // Update booking payment status
      if (payment.bookingType === 'SERVICE') {
        await db.serviceBooking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: PaymentStatus.COMPLETED }
        })
      } else if (payment.bookingType === 'TEST_DRIVE') {
        await db.testDriveBooking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: PaymentStatus.COMPLETED }
        })
      }

      // Get customer email
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
    } catch (error) {
      console.error('Error handling payment completion:', error)
      // Don't throw here as payment is already completed
    }
  }

  async processPayment(data: PaymentData): Promise<{
    success: boolean
    payment?: Payment
    error?: string
    redirectUrl?: string
  }> {
    try {
      // Create payment record
      const payment = await this.createPayment(data)

      // Process payment based on method
      let result: { success: boolean; transactionId?: string; receiptUrl?: string; redirectUrl?: string }

      switch (data.paymentMethod) {
        case PaymentMethod.CASH:
          result = await this.processCashPayment(payment)
          break
        case PaymentMethod.CREDIT_CARD:
        case PaymentMethod.DEBIT_CARD:
          result = await this.processCardPayment(payment, data)
          break
        case PaymentMethod.BANK_TRANSFER:
          result = await this.processBankTransfer(payment)
          break
        case PaymentMethod.MOBILE_WALLET:
          result = await this.processMobileWalletPayment(payment, data)
          break
        default:
          throw new Error('Unsupported payment method')
      }

      if (result.success) {
        // Update payment status
        await this.updatePaymentStatus(
          payment.id,
          PaymentStatus.COMPLETED,
          result.transactionId,
          result.receiptUrl
        )

        return {
          success: true,
          payment,
          redirectUrl: result.redirectUrl
        }
      } else {
        // Mark payment as failed
        await this.updatePaymentStatus(payment.id, PaymentStatus.FAILED)
        return {
          success: false,
          error: 'Payment processing failed'
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      }
    }
  }

  private async processCashPayment(payment: Payment): Promise<{
    success: boolean
    transactionId?: string
    receiptUrl?: string
  }> {
    // Cash payments are manually verified
    // In a real system, you might generate a cash receipt
    return {
      success: true,
      transactionId: `CASH-${payment.id}-${Date.now()}`
    }
  }

  private async processCardPayment(
    payment: Payment,
    data: PaymentData
  ): Promise<{
    success: boolean
    transactionId?: string
    receiptUrl?: string
    redirectUrl?: string
  }> {
    // In a real implementation, you would integrate with:
    // - Stripe
    // - PayPal
    // - Fawry (for Egypt)
    // - PayMob (for Egypt)
    
    // For now, we'll simulate the payment
    console.log('Processing card payment:', {
      amount: payment.amount,
      currency: payment.currency,
      paymentId: payment.id
    })

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate payment processing
    const success = Math.random() > 0.1 // 90% success rate for demo

    if (success) {
      const transactionId = `CARD-${payment.id}-${Date.now()}`
      const receiptUrl = `/api/payments/${payment.id}/receipt`

      return {
        success: true,
        transactionId,
        receiptUrl
      }
    } else {
      return {
        success: false
      }
    }
  }

  private async processBankTransfer(payment: Payment): Promise<{
    success: boolean
    transactionId?: string
    receiptUrl?: string
    redirectUrl?: string
  }> {
    // Bank transfers require manual verification
    // Generate bank transfer instructions
    const transactionId = `BT-${payment.id}-${Date.now()}`
    
    return {
      success: true,
      transactionId,
      redirectUrl: `/payments/bank-transfer/${payment.id}`
    }
  }

  private async processMobileWalletPayment(
    payment: Payment,
    data: PaymentData
  ): Promise<{
    success: boolean
    transactionId?: string
    receiptUrl?: string
    redirectUrl?: string
  }> {
    // In Egypt, you would integrate with:
    // - Vodafone Cash
    // - Etisalat Cash
    // - Orange Money
    // - Fawry
    
    console.log('Processing mobile wallet payment:', {
      amount: payment.amount,
      currency: payment.currency,
      paymentId: payment.id
    })

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulate payment processing
    const success = Math.random() > 0.15 // 85% success rate for demo

    if (success) {
      const transactionId = `MW-${payment.id}-${Date.now()}`
      const receiptUrl = `/api/payments/${payment.id}/receipt`

      return {
        success: true,
        transactionId,
        receiptUrl
      }
    } else {
      return {
        success: false
      }
    }
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    try {
      return await db.payment.findUnique({
        where: { id: paymentId },
        include: {
          serviceBooking: {
            include: {
              customer: true,
              serviceType: true,
              vehicle: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error fetching payment:', error)
      return null
    }
  }

  async getPaymentsByBooking(bookingId: string, bookingType: 'SERVICE' | 'TEST_DRIVE'): Promise<Payment[]> {
    try {
      return await db.payment.findMany({
        where: {
          bookingId,
          bookingType
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Error fetching payments:', error)
      return []
    }
  }

  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<Payment> {
    try {
      const payment = await db.payment.findUnique({
        where: { id: paymentId }
      })

      if (!payment) {
        throw new Error('Payment not found')
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new Error('Can only refund completed payments')
      }

      // Create refund record (you might want a separate refunds table)
      const refundAmount = amount || payment.amount
      
      // Update payment status
      const updatedPayment = await this.updatePaymentStatus(
        paymentId,
        PaymentStatus.REFUNDED
      )

      // In a real system, you would:
      // 1. Call the payment gateway's refund API
      // 2. Create a refund record
      // 3. Send refund confirmation email

      return updatedPayment
    } catch (error) {
      console.error('Error processing refund:', error)
      throw error
    }
  }

  generatePaymentReceipt(payment: Payment): string {
    // Generate HTML receipt
    return `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="text-align: center; color: #333; margin-bottom: 20px;">
            إيصال دفع - الحمد للسيارات
          </h2>
          
          <div style="margin-bottom: 20px;">
            <p><strong>رقم المعاملة:</strong> ${payment.transactionId || payment.id}</p>
            <p><strong>التاريخ:</strong> ${new Date(payment.createdAt).toLocaleDateString('ar-EG')}</p>
            <p><strong>طريقة الدفع:</strong> ${this.getPaymentMethodLabel(payment.paymentMethod)}</p>
            <p><strong>الحالة:</strong> ${this.getPaymentStatusLabel(payment.status)}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>المبلغ:</strong> ${payment.amount.toLocaleString()} ${payment.currency}</p>
          </div>
          
          ${payment.receiptUrl ? `
            <div style="text-align: center; margin-top: 20px;">
              <a href="${payment.receiptUrl}" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                تحميل الإيصال
              </a>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
            <p>شكراً لتعاملك مع الحمد للسيارات</p>
            <p>للاستفسار: 01000000000</p>
          </div>
        </div>
      </div>
    `
  }

  private getPaymentMethodLabel(method: PaymentMethod): string {
    const labels = {
      [PaymentMethod.CASH]: 'نقدي',
      [PaymentMethod.CREDIT_CARD]: 'بطاقة ائتمان',
      [PaymentMethod.DEBIT_CARD]: 'بطاقة خصم',
      [PaymentMethod.BANK_TRANSFER]: 'تحويل بنكي',
      [PaymentMethod.MOBILE_WALLET]: 'محفظة إلكترونية'
    }
    return labels[method] || method
  }

  private getPaymentStatusLabel(status: PaymentStatus): string {
    const labels = {
      [PaymentStatus.PENDING]: 'قيد الانتظار',
      [PaymentStatus.COMPLETED]: 'مكتمل',
      [PaymentStatus.FAILED]: 'فشل',
      [PaymentStatus.REFUNDED]: 'مسترد',
      [PaymentStatus.CANCELLED]: 'ملغي'
    }
    return labels[status] || status
  }
}

export const paymentService = new PaymentService()
export default PaymentService