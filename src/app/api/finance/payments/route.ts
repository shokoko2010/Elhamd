import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { PaymentMethod, UserRole } from '@prisma/client'
import { PERMISSIONS } from '@/lib/permissions'
import { FinanceManager } from '@/lib/finance-utilities'

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
    const type = searchParams.get('type')
    const payrollPeriod = searchParams.get('payrollPeriod')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (paymentMethod) {
      where.paymentMethod = paymentMethod
    }

    if (type === 'PAYROLL') {
      where.payrollRecordId = { not: null }
      if (payrollPeriod) {
        where.payrollRecord = {
          period: payrollPeriod
        }
      }
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
          payrollRecord: {
            include: {
              employee: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true
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
      type,
      bookingId,
      invoiceId,
      payrollRecordId,
      amount,
      paymentMethod,
      notes,
      transactionId,
      branchId
    } = body

    const paymentType = (type || (invoiceId ? 'INVOICE' : 'SERVICE')).toUpperCase()
    const allowedTypes = ['SERVICE', 'INVOICE', 'PAYROLL']

    if (!allowedTypes.includes(paymentType)) {
      return NextResponse.json(
        { error: `Invalid payment type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const requiresPayrollPermissions = paymentType === 'PAYROLL'
    if (requiresPayrollPermissions) {
      const hasPayrollPermissions =
        user.permissions.includes(PERMISSIONS.PROCESS_OFFLINE_PAYMENTS) &&
        user.permissions.includes(PERMISSIONS.MANAGE_PAYMENTS)

      if (!hasPayrollPermissions && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        return NextResponse.json({ error: 'غير مصرح لك - صلاحيات الرواتب غير كافية' }, { status: 403 })
      }
    }

    // Validate required fields
    if (paymentType === 'SERVICE' && !bookingId) {
      return NextResponse.json(
        { error: 'Missing required field: bookingId' },
        { status: 400 }
      )
    }

    if (paymentType === 'INVOICE' && !invoiceId) {
      return NextResponse.json(
        { error: 'Missing required field: invoiceId' },
        { status: 400 }
      )
    }

    if (paymentType === 'PAYROLL' && !payrollRecordId) {
      return NextResponse.json(
        { error: 'Missing required field: payrollRecordId' },
        { status: 400 }
      )
    }

    let payrollRecord: any = null

    if (paymentType === 'PAYROLL') {
      payrollRecord = await db.payrollRecord.findUnique({
        where: { id: payrollRecordId },
        include: {
          employee: {
            include: {
              branch: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          }
        }
      })

      if (!payrollRecord) {
        return NextResponse.json(
          { error: 'سجل الرواتب غير موجود' },
          { status: 404 }
        )
      }
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required field: paymentMethod' },
        { status: 400 }
      )
    }

    let resolvedAmount: number | string | undefined = amount

    if (paymentType === 'PAYROLL' && (resolvedAmount === undefined || resolvedAmount === null || resolvedAmount === '')) {
      resolvedAmount = payrollRecord?.netSalary
    }

    if (resolvedAmount === undefined || resolvedAmount === null || resolvedAmount === '') {
      return NextResponse.json(
        { error: 'Missing required field: amount' },
        { status: 400 }
      )
    }

    const parsedAmount = typeof resolvedAmount === 'string' ? parseFloat(resolvedAmount) : resolvedAmount

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

    const branchForPayment = branchId || user.branchId || payrollRecord?.employee?.branch?.id

    // Create payment
    const payment = await FinanceManager.createPayment({
      type: paymentType as 'INVOICE' | 'SERVICE' | 'PAYROLL',
      bookingId,
      invoiceId,
      payrollRecordId,
      amount: parsedAmount,
      paymentMethod,
      notes,
      transactionId: finalTransactionId,
      userId: user.id,
      branchId: branchForPayment,
      metadata: {
        source: 'MANUAL_ENTRY',
        ...(paymentType === 'PAYROLL' && payrollRecord
          ? {
              payrollRecord: {
                id: payrollRecord.id,
                period: payrollRecord.period,
                employeeId: payrollRecord.employeeId
              }
            }
          : {})
      }
    })

    const createdPayment = await db.payment.findUnique({
      where: { id: payment.id },
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
        payrollRecord: {
          include: {
            employee: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
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
          bookingId,
          payrollRecordId,
          payrollPeriod: payrollRecord?.period,
          type: paymentType
        }
      }
    })

    const responsePayload = createdPayment ?? payment

    return NextResponse.json(responsePayload, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}