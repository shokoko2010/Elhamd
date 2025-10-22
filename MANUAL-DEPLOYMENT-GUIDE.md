# 🚨 دليل النشر اليدوي العاجل - إصلاح خطأ 500

## المشكلة الحالية
```
POST https://elhamdimport.com/api/finance/payments/offline 500 (Internal Server Error)
```

## الحل: النشر اليدوي

### الخطوة 1: نسخ الكود المعدل

#### الملف 1: `src/app/api/finance/payments/offline/route.ts`

استبدل الملف الحالي بالكود التالي:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { PaymentStatus, PaymentMethod } from '@prisma/client'

const createOfflinePaymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CHECK', 'OTHER']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  paymentDate: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== OFFLINE PAYMENT CREATION START ===')
    
    const user = await getAuthUser()
    if (!user) {
      console.log('❌ User not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ User authenticated:', user.email)

    const body = await request.json()
    console.log('📝 Request body:', body)
    
    const validatedData = createOfflinePaymentSchema.parse(body)
    console.log('✅ Data validated:', validatedData)
    
    const { invoiceId, amount, paymentMethod, referenceNumber, notes, paymentDate } = validatedData
    
    // Get invoice details
    console.log('🔍 Looking up invoice:', invoiceId)
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true }
    })
    
    if (!invoice) {
      console.log('❌ Invoice not found:', invoiceId)
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    
    console.log('✅ Invoice found:', invoice.invoiceNumber)
    
    // Check if invoice is already fully paid
    const totalPaid = await db.invoicePayment.aggregate({
      where: { invoiceId },
      _sum: { amount: true }
    })
    
    const currentPaid = totalPaid._sum.amount || 0
    const remaining = invoice.totalAmount - currentPaid
    
    if (amount > remaining) {
      console.log('❌ Payment amount exceeds remaining balance')
      return NextResponse.json({ 
        error: 'Payment amount exceeds remaining balance',
        remaining,
        requested: amount
      }, { status: 400 })
    }
    
    console.log('💰 Payment amount valid:', { amount, remaining })

    // Create payment record
    console.log('💳 Creating payment record...')
    const paymentData = {
      customerId: invoice.customerId,
      amount,
      currency: invoice.currency,
      status: PaymentStatus.COMPLETED,
      paymentMethod: paymentMethod as PaymentMethod,
      transactionId: referenceNumber || `OFFLINE-${Date.now()}`,
      notes: notes || `Offline payment - ${paymentMethod}`,
      branchId: invoice.branchId
    }
    
    // Add metadata only if the field exists in the database
    try {
      // Test if metadata field exists by attempting a query
      await db.payment.findFirst({ where: { metadata: { not: null } } })
      paymentData.metadata = {
        type: 'OFFLINE',
        recordedBy: user.id,
        referenceNumber,
        paymentDate: paymentDate || new Date().toISOString(),
        invoiceId: invoiceId // Track that this is an invoice payment
      }
      console.log('Metadata field exists, adding to payment data')
    } catch (metadataError) {
      console.log('Metadata field does not exist, skipping metadata')
      // Continue without metadata if the field doesn't exist
    }
    
    // Create payment with error handling
    let payment
    try {
      payment = await db.payment.create({
        data: paymentData
      })
      console.log('Payment record created:', payment.id)
    } catch (createError) {
      console.error('Failed to create payment:', createError)
      // If payment creation fails due to metadata, try without it
      if (paymentData.metadata) {
        console.log('Retrying payment creation without metadata')
        const { metadata, ...paymentDataWithoutMetadata } = paymentData
        payment = await db.payment.create({
          data: paymentDataWithoutMetadata
        })
        console.log('Payment record created without metadata:', payment.id)
      } else {
        throw createError
      }
    }

    // Create invoice payment relationship
    console.log('Creating invoice payment relationship...')
    await db.invoicePayment.create({
      data: {
        invoiceId,
        paymentId: payment.id,
        amount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date()
      }
    })
    console.log('✅ Invoice payment relationship created')

    // Update invoice status if fully paid
    const newTotalPaid = currentPaid + amount
    if (newTotalPaid >= invoice.totalAmount) {
      console.log('🎉 Invoice fully paid, updating status to PAID')
      await db.invoice.update({
        where: { id: invoiceId },
        data: { 
          status: 'PAID',
          paidAt: new Date()
        }
      })
    } else {
      console.log('💳 Invoice partially paid, updating status to PARTIALLY_PAID')
      await db.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PARTIALLY_PAID' }
      })
    }

    console.log('=== OFFLINE PAYMENT CREATION COMPLETE ===')
    
    return NextResponse.json({
      success: true,
      message: 'Offline payment recorded successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        notes: payment.notes,
        createdAt: payment.createdAt
      },
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        paidAmount: newTotalPaid,
        remaining: invoice.totalAmount - newTotalPaid,
        status: newTotalPaid >= invoice.totalAmount ? 'PAID' : 'PARTIALLY_PAID'
      }
    })

  } catch (error) {
    console.error('❌ Error creating offline payment:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    return NextResponse.json({ 
      error: 'Failed to record offline payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId')
    const branchId = searchParams.get('branchId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const paymentMethod = searchParams.get('paymentMethod')

    // Build where clause
    let where: any = {}
    
    if (invoiceId) {
      where.invoiceId = invoiceId
    }
    
    if (branchId) {
      where.invoice = { branchId }
    }
    
    if (startDate || endDate) {
      where.paymentDate = {}
      if (startDate) where.paymentDate.gte = new Date(startDate)
      if (endDate) where.paymentDate.lte = new Date(endDate)
    }
    
    if (paymentMethod) {
      where.paymentMethod = paymentMethod
    }

    let payments
    try {
      // Try to fetch with metadata field
      payments = await db.invoicePayment.findMany({
        where,
        include: {
          invoice: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          payment: true
        },
        orderBy: {
          paymentDate: 'desc'
        }
      })
    } catch (error) {
      // If metadata field doesn't exist, fetch without it
      console.log('Metadata field not found, fetching payments without metadata')
      payments = await db.invoicePayment.findMany({
        where,
        include: {
          invoice: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          payment: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              paymentMethod: true,
              transactionId: true,
              notes: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          paymentDate: 'desc'
        }
      })
    }

    // Filter for offline payments only (safely check metadata)
    const offlinePayments = payments.filter(ip => 
      ip.payment.notes?.includes('Offline') || 
      (ip.payment as any).metadata?.type === 'OFFLINE'
    )

    return NextResponse.json({
      payments: offlinePayments,
      total: offlinePayments.length,
      totalAmount: offlinePayments.reduce((sum, ip) => sum + ip.amount, 0)
    })

  } catch (error) {
    console.error('Error fetching offline payments:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch offline payments' 
    }, { status: 500 })
  }
}
```

### الخطوة 2: نشر التغييرات

#### الخيار أ: عبر Vercel Dashboard
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروعك
3. اضغط على "Redeploy" أو "Git Integration"
4. اضغط على "Redeploy"

#### الخيار ب: عبر Vercel CLI
```bash
vercel --prod
```

#### الخيار ج: عبر GitHub (إذا كان متصلاً)
```bash
git add .
git commit -m "Fix 500 error in offline payments API"
git push origin main
```

### الخطوة 3: إصلاح قاعدة البيانات

بعد النشر، افتح الرابط التالي في المتصفح (بعد تسجيل الدخول):
```
https://elhamdimport.com/api/fix-database-schema
```

أو استخدم curl:
```bash
curl -X POST https://elhamdimport.com/api/fix-database-schema
```

### الخطوة 4: التحقق

1. انتظر 5-10 دقائق بعد النشر
2. اذهب إلى `https://elhamdimport.com/admin/finance`
3. جرب تسجيل دفعة جديدة
4. تأكد من عدم ظهور خطأ 500

## التحقق من النجاح

### علامات النجاح:
- ✅ لا يظهر خطأ 500
- ✅ تظهر رسالة نجاح
- ✅ يتم تحديث حالة الفاتورة
- ✅ تظهر الدفعة في القائمة

### إذا استمر الخطأ:
1. تحقق من Vercel Function Logs
2. تأكد من أن الكود الجديد تم نشره
3. تحقق من إصلاح قاعدة البيانات

## الوقت المتوقع
- النشر: 5-10 دقائق
- إصلاح قاعدة البيانات: 1-2 دقيقة
- التحقق: 2-3 دقيقة

**الإجمالي**: 10-15 دقيقة

---
**ملاحظة هامة**: هذه التغييرات تضمن عمل الـ API في جميع الحالات، سواء كانت قاعدة البيانات تحتوي على حقل metadata أم لا.