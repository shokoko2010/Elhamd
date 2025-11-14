interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateProductionUser } from '@/lib/auth-server'
import {
  InstallmentStatus,
  InvoicePaymentStatus,
  InvoiceStatus,
  PerformancePeriod,
  UserRole
} from '@prisma/client'
import { PERMISSIONS } from '@/lib/permissions'
import {
  normalizeInvoiceItemsFromInput,
  normalizeInvoiceRecord,
} from '@/lib/invoice-normalizer'
import {
  applyInvoiceSideEffects,
  extractInvoiceItemLinks,
} from '@/lib/invoice-fulfillment'
import {
  clampInstallmentStatus,
  normalizeInstallmentInputs,
  calculateInstallmentTotals,
} from '@/lib/invoice-installments'
import { updateEmployeePerformanceMetrics } from '@/lib/performance-metric-sync'

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/finance/invoices: Starting request...')
    
    // Check authentication using production method
    const user = await authenticateProductionUser(request)
    if (!user) {
      console.log('❌ GET /api/finance/invoices: Authentication failed')
      return NextResponse.json({ 
        error: 'غير مصرح لك - يرجى تسجيل الدخول',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString()
      }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        }
      })
    }
    
    // Check if user has required role or permissions
    const hasWildcard = user.permissions.includes('*')
    const hasAccess =
      user.role === UserRole.ADMIN ||
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.BRANCH_MANAGER ||
      user.role === UserRole.ACCOUNTANT ||
      hasWildcard ||
      user.permissions.includes(PERMISSIONS.VIEW_INVOICES)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { 
        status: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        }
      })
    }
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const lifecycle = (searchParams.get('lifecycle') || 'active').toLowerCase()
    const customerId = searchParams.get('customerId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (lifecycle === 'deleted') {
      where.isDeleted = true
    } else if (lifecycle !== 'all') {
      where.isDeleted = false
    }
    
    if (status) {
      where.status = status
    }
    
    if (customerId) {
      where.customerId = customerId
    }
    
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Get invoices with pagination
    const orderBy = lifecycle === 'deleted'
      ? [
          { deletedAt: 'desc' as const },
          { issueDate: 'desc' as const },
        ]
      : [
          { issueDate: 'desc' as const },
          { createdAt: 'desc' as const },
        ]

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          createdByEmployee: {
            select: {
              id: true,
              employeeNumber: true,
              department: {
                select: { name: true },
              },
              position: {
                select: { title: true },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          items: true,
          payments: {
            include: {
              payment: true,
            },
          },
          taxes: true,
          installments: {
            orderBy: {
              sequence: 'asc',
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.invoice.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    const serializedInvoices = invoices.map(invoice => {
      const normalized = normalizeInvoiceRecord({
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        items: invoice.items,
        taxes: invoice.taxes,
      })

      const paidAmount = normalized.totalAmount - normalized.outstanding

      const normalizedInstallments = invoice.installments.map(installment => {
        const status = clampInstallmentStatus({
          amount: installment.amount,
          paidAmount: installment.paidAmount,
          dueDate: installment.dueDate,
          status: installment.status,
        })

        return {
          id: installment.id,
          sequence: installment.sequence,
          amount: installment.amount,
          dueDate: installment.dueDate,
          status,
          paidAmount: installment.paidAmount,
          paidAt: installment.paidAt,
          notes: installment.notes,
          paymentId: installment.paymentId,
        }
      })

      const installmentTotals = calculateInstallmentTotals(invoice.installments)

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        paymentStatus: invoice.paymentStatus,
        type: invoice.type,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        subtotal: normalized.subtotal,
        taxAmount: normalized.taxAmount,
        totalAmount: normalized.totalAmount,
        paidAmount,
        outstanding: normalized.outstanding,
        currency: invoice.currency,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        createdBy: invoice.createdBy,
        creator: invoice.createdByEmployee
          ? {
              employeeId: invoice.createdByEmployee.id,
              employeeNumber: invoice.createdByEmployee.employeeNumber,
              department: invoice.createdByEmployee.department?.name ?? null,
              position: invoice.createdByEmployee.position?.title ?? null,
              user: invoice.createdByEmployee.user
                ? {
                    id: invoice.createdByEmployee.user.id,
                    name: invoice.createdByEmployee.user.name,
                    email: invoice.createdByEmployee.user.email,
                  }
                : null,
            }
          : null,
        deletedAt: invoice.deletedAt,
        deletedBy: invoice.deletedBy,
        deletedReason: invoice.deletedReason,
        isDeleted: invoice.isDeleted,
        customer: invoice.customer,
        branch: invoice.branch,
        items: normalized.items,
        taxes: normalized.taxes,
        payments: invoice.payments.map(payment => ({
          id: payment.id,
          amount: Number(payment.amount ?? payment.payment?.amount ?? 0),
          paymentDate:
            payment.paymentDate instanceof Date
              ? payment.paymentDate
              : new Date(payment.paymentDate),
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          notes: payment.notes,
          payment: payment.payment
            ? {
                id: payment.payment.id,
                amount: payment.payment.amount,
                paymentMethod: payment.payment.paymentMethod,
                status: payment.payment.status,
                transactionId: payment.payment.transactionId,
                createdAt: payment.payment.createdAt,
                notes: payment.payment.notes,
              }
            : null,
        })),
        installments: normalizedInstallments,
        installmentSummary: {
          scheduled: installmentTotals.scheduled,
          paid: installmentTotals.paid,
          outstanding: Math.max(0, installmentTotals.scheduled - installmentTotals.paid),
        },
      }
    })

    const pageTotals = serializedInvoices.reduce(
      (acc, invoice) => {
        acc.totalAmount += invoice.totalAmount
        acc.totalPaid += invoice.paidAmount
        acc.outstanding += invoice.outstanding
        return acc
      },
      { totalAmount: 0, totalPaid: 0, outstanding: 0 }
    )

    return NextResponse.json({
      invoices: serializedInvoices,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      summary: {
        page: pageTotals,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        }
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/finance/invoices: Starting request...')
    
    // Check authentication using production method
    const user = await authenticateProductionUser(request)
    if (!user) {
      console.log('❌ POST /api/finance/invoices: Authentication failed')
      return NextResponse.json({ 
        error: 'غير مصرح لك - يرجى تسجيل الدخول',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString()
      }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        }
      })
    }
    
    // Check if user has required role or permissions
    const hasCreatePermission = user.permissions.includes('*') ||
      user.permissions.includes(PERMISSIONS.CREATE_INVOICES)
    const hasAccess =
      user.role === UserRole.ADMIN ||
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.BRANCH_MANAGER ||
      user.role === UserRole.ACCOUNTANT ||
      hasCreatePermission
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { 
        status: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        }
      })
    }
    
    const body = await request.json()

    const {
      customerId,
      type,
      items,
      issueDate,
      dueDate,
      notes,
      terms,
      branchId,
      status: requestedStatus,
      metadata: rawMetadata,
      installments: rawInstallments,
    } = body

    // Validate required fields
    if (!customerId || !items || !items.length || !issueDate || !dueDate) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: {
            customerId: !!customerId,
            items: !!items && items.length > 0,
            issueDate: !!issueDate,
            dueDate: !!dueDate,
          }
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          }
        }
      )
    }

    const creator = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    })

    if (!creator) {
      return NextResponse.json(
        {
          error: 'لم يتم العثور على حساب المستخدم المنشئ للفاتورة',
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          },
        },
      )
    }

    const actualUserId = creator.id

    const employeeRecord = await db.employee.findUnique({
      where: { userId: actualUserId },
      select: { id: true },
    })

    // Check if customer exists
    const existingCustomer = await db.user.findUnique({
      where: { id: customerId }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          }
        }
      )
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items must be a non-empty array' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          }
        }
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.description || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          { 
            error: 'Each item must have description, quantity, and unitPrice',
            details: { invalidItem: item }
          },
          { 
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            }
          }
        )
      }
    }

    // Normalize invoice items and totals
    const { items: normalizedItems, totals } = normalizeInvoiceItemsFromInput(items)

    const normalizedInstallments = normalizeInstallmentInputs(rawInstallments)
    const installmentTotals = calculateInstallmentTotals(normalizedInstallments)

    if (normalizedInstallments.length) {
      const issueDateValue = new Date(issueDate)

      if (Number.isNaN(issueDateValue.getTime())) {
        return NextResponse.json(
          {
            error: 'تاريخ الإصدار غير صالح للفاتورة عند إعداد خطة التقسيط',
          },
          {
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            },
          }
        )
      }

      const hasInvalidDueDate = normalizedInstallments.some(installment => {
        return installment.dueDate.getTime() < issueDateValue.getTime()
      })

      if (hasInvalidDueDate) {
        return NextResponse.json(
          {
            error: 'لا يمكن أن يكون تاريخ استحقاق القسط أقدم من تاريخ إصدار الفاتورة',
          },
          {
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            },
          }
        )
      }
    }

    const { links, inventoryIds, vehicleIds } = extractInvoiceItemLinks(normalizedItems)

    const [inventoryRecords, vehicleRecords] = await Promise.all([
      inventoryIds.length
        ? db.inventoryItem.findMany({ where: { id: { in: inventoryIds } } })
        : Promise.resolve([]),
      vehicleIds.length
        ? db.vehicle.findMany({ where: { id: { in: vehicleIds } } })
        : Promise.resolve([]),
    ])

    const inventoryMap = new Map(inventoryRecords.map((record) => [record.id, record]))
    const vehicleMap = new Map(vehicleRecords.map((record) => [record.id, record]))

    for (const link of links) {
      if (link.type === 'PART' && link.inventoryItemId) {
        const inventoryItem = inventoryMap.get(link.inventoryItemId)
        if (!inventoryItem) {
          return NextResponse.json({
            error: `لم يتم العثور على صنف المخزون المحدد (${link.inventoryItemId})`,
          }, { status: 400 })
        }

        const requestedQuantity = Math.max(0, Math.round(link.normalized.quantity))
        if (requestedQuantity > inventoryItem.quantity) {
          return NextResponse.json({
            error: `الكمية المطلوبة للصنف ${inventoryItem.name} تتجاوز المخزون المتاح`,
            details: {
              requested: requestedQuantity,
              available: inventoryItem.quantity,
            },
          }, { status: 400 })
        }
      }

      if (link.type === 'VEHICLE' && link.vehicleId) {
        const vehicle = vehicleMap.get(link.vehicleId)
        if (!vehicle) {
          return NextResponse.json({
            error: `لم يتم العثور على المركبة المحددة (${link.vehicleId})`,
          }, { status: 400 })
        }

        if (vehicle.status !== 'AVAILABLE') {
          return NextResponse.json({
            error: `المركبة ${vehicle.make} ${vehicle.model} غير متاحة حالياً للحجز`,
            details: { status: vehicle.status },
          }, { status: 400 })
        }
      }
    }

    const subtotal = totals.subtotal
    const totalTaxAmount = totals.taxAmount
    const totalAmount = totals.totalAmount

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const normalizedStatus = (() => {
      if (!requestedStatus) {
        return InvoiceStatus.DRAFT
      }

      const upper = String(requestedStatus).toUpperCase()
      if ((Object.keys(InvoiceStatus) as Array<keyof typeof InvoiceStatus>).includes(upper as keyof typeof InvoiceStatus)) {
        return InvoiceStatus[upper as keyof typeof InvoiceStatus]
      }

      return InvoiceStatus.DRAFT
    })()

    const paymentStatus = (() => {
      if (normalizedStatus === InvoiceStatus.PAID) {
        return InvoicePaymentStatus.PAID
      }

      if (normalizedStatus === InvoiceStatus.PARTIALLY_PAID) {
        return InvoicePaymentStatus.PARTIALLY_PAID
      }

      return InvoicePaymentStatus.PENDING
    })()

    const baseMetadata: Record<string, unknown> =
      rawMetadata && typeof rawMetadata === 'object' && !Array.isArray(rawMetadata)
        ? (rawMetadata as Record<string, unknown>)
        : {}

    const shouldAdjustInventory =
      normalizedStatus === InvoiceStatus.PAID || normalizedStatus === InvoiceStatus.SENT || normalizedStatus === InvoiceStatus.PARTIALLY_PAID

    const existingInventoryAdjusted =
      typeof baseMetadata['inventoryAdjusted'] === 'boolean'
        ? (baseMetadata['inventoryAdjusted'] as boolean)
        : false

    const invoiceMetadata = {
      ...baseMetadata,
      inventoryAdjusted: shouldAdjustInventory ? false : existingInventoryAdjusted,
    }

    // Create invoice with transaction
    const invoice = await db.$transaction(async (tx) => {
      // Create the invoice first
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId,
          type: type || 'SERVICE',
          status: normalizedStatus,
          paymentStatus,
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate),
          subtotal,
          taxAmount: totalTaxAmount,
          totalAmount,
          paidAmount: 0,
          currency: 'EGP',
          notes,
          terms,
          createdBy: actualUserId,
          createdByEmployeeId: employeeRecord?.id ?? null,
          branchId: branchId || user.branchId || null,
          metadata: invoiceMetadata,
        }
      })

      // Create invoice items
      await tx.invoiceItem.createMany({
        data: normalizedItems.map(item => ({
          invoiceId: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          inventoryItemId: (() => {
            const link = links.find(linkItem => linkItem.normalized === item)
            return link?.type === 'PART' ? link.inventoryItemId ?? null : null
          })(),
          vehicleId: (() => {
            const link = links.find(linkItem => linkItem.normalized === item)
            return link?.type === 'VEHICLE' ? link.vehicleId ?? null : null
          })(),
          metadata: item.metadata ?? {},
        })),
      })

      if (totals.breakdown.length > 0) {
        await tx.invoiceTax.createMany({
          data: totals.breakdown.map(tax => ({
            invoiceId: newInvoice.id,
            taxType: tax.taxType,
            rate: tax.rate,
            taxAmount: tax.taxAmount,
            description: tax.description,
          })),
        })
      }

      if (normalizedInstallments.length) {
        await tx.invoiceInstallment.createMany({
          data: normalizedInstallments.map((installment, index) => ({
            invoiceId: newInvoice.id,
            sequence: index + 1,
            amount: installment.amount,
            dueDate: installment.dueDate,
            status: installment.hasManualStatus
              ? installment.status
              : InstallmentStatus.SCHEDULED,
            paidAmount: installment.paidAmount,
            notes: installment.notes ?? null,
            metadata: installment.metadata,
          })),
        })
      }

      return newInvoice
    })

    const completeInvoice = await db.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        createdByEmployee: {
          select: {
            id: true,
            employeeNumber: true,
            department: {
              select: { name: true },
            },
            position: {
              select: { title: true },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        items: true,
        taxes: true,
        installments: {
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    })

    if (completeInvoice) {
      await applyInvoiceSideEffects({
        invoice: completeInvoice,
        links,
        inventoryMap,
        vehicleMap,
        totals,
        adjustInventory: shouldAdjustInventory,
      })
    }

    if (employeeRecord?.id) {
      await updateEmployeePerformanceMetrics({
        employeeId: employeeRecord.id,
        periodType: PerformancePeriod.MONTHLY,
        referenceDate: invoice.issueDate,
      })
    }

    const refreshedInvoice = await db.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        createdByEmployee: {
          select: {
            id: true,
            employeeNumber: true,
            department: {
              select: { name: true },
            },
            position: {
              select: { title: true },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        items: true,
        taxes: true,
        installments: {
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    })

    const responseInvoice = refreshedInvoice
      ? (() => {
          const normalized = normalizeInvoiceRecord({
            subtotal: refreshedInvoice.subtotal,
            taxAmount: refreshedInvoice.taxAmount,
            totalAmount: refreshedInvoice.totalAmount,
            paidAmount: refreshedInvoice.paidAmount,
            items: refreshedInvoice.items,
            taxes: refreshedInvoice.taxes,
          })

          const paidAmount = normalized.totalAmount - normalized.outstanding

          const normalizedInstallments = refreshedInvoice.installments.map(installment => {
            const status = clampInstallmentStatus({
              amount: installment.amount,
              paidAmount: installment.paidAmount,
              dueDate: installment.dueDate,
              status: installment.status,
            })

            return {
              id: installment.id,
              sequence: installment.sequence,
              amount: installment.amount,
              dueDate: installment.dueDate,
              status,
              paidAmount: installment.paidAmount,
              paidAt: installment.paidAt,
              notes: installment.notes,
              paymentId: installment.paymentId,
            }
          })

          const refreshedInstallmentTotals = calculateInstallmentTotals(refreshedInvoice.installments)

          return {
            ...refreshedInvoice,
            subtotal: normalized.subtotal,
            taxAmount: normalized.taxAmount,
            totalAmount: normalized.totalAmount,
            paidAmount,
            outstanding: normalized.outstanding,
            items: normalized.items,
            taxes: normalized.taxes,
            installments: normalizedInstallments,
            installmentSummary: {
              scheduled: refreshedInstallmentTotals.scheduled,
              paid: refreshedInstallmentTotals.paid,
              outstanding: Math.max(0, refreshedInstallmentTotals.scheduled - refreshedInstallmentTotals.paid),
            },
            createdBy: refreshedInvoice.createdBy,
            creator: refreshedInvoice.createdByEmployee
              ? {
                  employeeId: refreshedInvoice.createdByEmployee.id,
                  employeeNumber: refreshedInvoice.createdByEmployee.employeeNumber,
                  department: refreshedInvoice.createdByEmployee.department?.name ?? null,
                  position: refreshedInvoice.createdByEmployee.position?.title ?? null,
                  user: refreshedInvoice.createdByEmployee.user
                    ? {
                        id: refreshedInvoice.createdByEmployee.user.id,
                        name: refreshedInvoice.createdByEmployee.user.name,
                        email: refreshedInvoice.createdByEmployee.user.email,
                      }
                    : null,
                }
              : null,
          }
        })()
      : null

    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      invoice: responseInvoice,
    }, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      }
    })
    
  } catch (error) {
    console.error('Invoice creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      }
    })
  }
}