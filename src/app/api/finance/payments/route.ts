import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { PaymentStatus, PaymentMethod, UserRole } from '@prisma/client'
import { PERMISSIONS } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.role === UserRole.BRANCH_MANAGER ||
                      user.role === UserRole.ACCOUNTANT ||
                      user.permissions.includes(PERMISSIONS.VIEW_PAYMENTS)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('paymentMethod')
    const customerId = searchParams.get('customerId')
    const branchId = searchParams.get('branchId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (paymentMethod) {
      where.paymentMethod = paymentMethod
    }
    
    if (customerId) {
      where.serviceBooking = {
        customerId: customerId
      }
    }
    
    if (branchId) {
      where.branchId = branchId
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }
    
    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { serviceBooking: { customer: { name: { contains: search, mode: 'insensitive' } } } },
        { serviceBooking: { customer: { email: { contains: search, mode: 'insensitive' } } } }
      ]
    }

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          serviceBooking: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.payment.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.role === UserRole.BRANCH_MANAGER ||
                      user.role === UserRole.ACCOUNTANT ||
                      user.permissions.includes(PERMISSIONS.CREATE_PAYMENTS)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }

    const body = await request.json()
    
    const {
      bookingId,
      amount,
      paymentMethod,
      notes,
      transactionId,
      branchId
    } = body

    // Validate required fields
    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, amount, paymentMethod' },
        { status: 400 }
      )
    }

    // Validate amount is a positive number
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Payment amount must be a positive number' },
        { status: 400 }
      )
    }

    // Validate payment method
    const validPaymentMethods = Object.values(PaymentMethod)
    if (!validPaymentMethods.includes(paymentMethod as PaymentMethod)) {
      return NextResponse.json(
        { error: `Invalid payment method. Valid methods: ${validPaymentMethods.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate transaction ID if not provided
    const finalTransactionId = transactionId || `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create payment
    const payment = await db.payment.create({
      data: {
        bookingId,
        bookingType: 'SERVICE',
        amount: parsedAmount,
        currency: 'EGP',
        status: PaymentStatus.COMPLETED,
        paymentMethod: paymentMethod as PaymentMethod,
        transactionId: finalTransactionId,
        notes,
        branchId: branchId || user.branchId,
        metadata: {
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          source: 'MANUAL_ENTRY'
        }
      },
      include: {
        serviceBooking: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'CREATED_PAYMENT',
        entityType: 'PAYMENT',
        entityId: payment.id,
        userId: user.id,
        details: {
          amount: parsedAmount,
          paymentMethod,
          transactionId: finalTransactionId,
          bookingId
        }
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}