import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== FINANCE DEBUG API START ===')
    
    // Test database connection
    await db.$connect()
    console.log('✅ Database connected')
    
    // Test authentication
    const user = await getAuthUser()
    console.log('✅ Authentication test:', !!user ? 'User found' : 'No user found')
    
    // Test Payment model
    try {
      const paymentCount = await db.payment.count()
      console.log('✅ Payment model test:', paymentCount, 'records')
      
      // Test Payment with metadata
      const paymentWithMetadata = await db.payment.findFirst({
        where: { metadata: { not: null } }
      })
      console.log('✅ Payment metadata test:', !!paymentWithMetadata ? 'Found payment with metadata' : 'No payment with metadata found')
      
    } catch (paymentError) {
      console.error('❌ Payment model error:', paymentError)
      return NextResponse.json({
        error: 'Payment model issue',
        details: paymentError instanceof Error ? paymentError.message : 'Unknown error',
        stack: paymentError instanceof Error ? paymentError.stack : undefined
      }, { status: 500 })
    }
    
    // Test Invoice model
    try {
      const invoiceCount = await db.invoice.count()
      console.log('✅ Invoice model test:', invoiceCount, 'records')
      
      // Test specific invoice from error
      const testInvoice = await db.invoice.findUnique({
        where: { id: 'cmh0pqqxs0001rqzkx8yii2cq' }
      })
      console.log('✅ Specific invoice test:', !!testInvoice ? 'Invoice found' : 'Invoice not found')
      
    } catch (invoiceError) {
      console.error('❌ Invoice model error:', invoiceError)
      return NextResponse.json({
        error: 'Invoice model issue',
        details: invoiceError instanceof Error ? invoiceError.message : 'Unknown error',
        stack: invoiceError instanceof Error ? invoiceError.stack : undefined
      }, { status: 500 })
    }
    
    // Test ActivityLog model
    try {
      const activityCount = await db.activityLog.count()
      console.log('✅ ActivityLog model test:', activityCount, 'records')
    } catch (activityError) {
      console.error('❌ ActivityLog model error:', activityError)
      return NextResponse.json({
        error: 'ActivityLog model issue',
        details: activityError instanceof Error ? activityError.message : 'Unknown error',
        stack: activityError instanceof Error ? activityError.stack : undefined
      }, { status: 500 })
    }
    
    // Test Transaction model
    try {
      const transactionCount = await db.transaction.count()
      console.log('✅ Transaction model test:', transactionCount, 'records')
    } catch (transactionError) {
      console.error('❌ Transaction model error:', transactionError)
      return NextResponse.json({
        error: 'Transaction model issue',
        details: transactionError instanceof Error ? transactionError.message : 'Unknown error',
        stack: transactionError instanceof Error ? transactionError.stack : undefined
      }, { status: 500 })
    }
    
    // Test InvoicePayment model
    try {
      const invoicePaymentCount = await db.invoicePayment.count()
      console.log('✅ InvoicePayment model test:', invoicePaymentCount, 'records')
    } catch (invoicePaymentError) {
      console.error('❌ InvoicePayment model error:', invoicePaymentError)
      return NextResponse.json({
        error: 'InvoicePayment model issue',
        details: invoicePaymentError instanceof Error ? invoicePaymentError.message : 'Unknown error',
        stack: invoicePaymentError instanceof Error ? invoicePaymentError.stack : undefined
      }, { status: 500 })
    }
    
    console.log('=== FINANCE DEBUG API SUCCESS ===')
    
    return NextResponse.json({
      success: true,
      message: 'All finance API components are working correctly',
      user: !!user,
      database: 'connected',
      models: {
        payment: 'ok',
        invoice: 'ok',
        activityLog: 'ok',
        transaction: 'ok',
        invoicePayment: 'ok'
      }
    })
    
  } catch (error) {
    console.error('❌ Finance debug failed:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json({
      success: false,
      error: 'Finance debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}