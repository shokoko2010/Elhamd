interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateProductionUser } from '@/lib/auth-server'
import { PERMISSIONS } from '@/lib/permissions'
import { PerformancePeriod, UserRole, InstallmentStatus } from '@prisma/client'
import {
  normalizeInvoiceItemsFromInput,
  normalizeInvoiceRecord,
  sanitizeNumber,
} from '@/lib/invoice-normalizer'
import { updateEmployeePerformanceMetrics } from '@/lib/performance-metric-sync'
import {
  clampInstallmentStatus,
  normalizeInstallmentInputs,
  calculateInstallmentTotals,
} from '@/lib/invoice-installments'

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        createdByEmployee: {
          select: {
            id: true,
            employeeNumber: true,
            department: {
              select: { name: true }
            },
            position: {
              select: { title: true }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        items: true,
        taxes: true,
        payments: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true,
                createdAt: true,
                paymentMethod: true,
                status: true,
                transactionId: true,
                notes: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        installments: {
          orderBy: {
            sequence: 'asc'
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

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

    const payload = {
      ...invoice,
      subtotal: normalized.subtotal,
      taxAmount: normalized.taxAmount,
      totalAmount: normalized.totalAmount,
      paidAmount,
      outstanding: normalized.outstanding,
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
      items: normalized.items,
      taxes: normalized.taxes,
      deletedAt: invoice.deletedAt,
      deletedBy: invoice.deletedBy,
      deletedReason: invoice.deletedReason,
      isDeleted: invoice.isDeleted,
      installments: normalizedInstallments,
      installmentSummary: {
        scheduled: installmentTotals.scheduled,
        paid: installmentTotals.paid,
        outstanding: Math.max(0, installmentTotals.scheduled - installmentTotals.paid),
      },
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  let isConnected = false
  
  try {
    
    // Ensure database connection
    await db.$connect()
    isConnected = true
    
    const { id } = await context.params
    const body = await request.json()
    
    const {
      customerId,
      type,
      items,
      issueDate,
      dueDate,
      notes,
      terms,
      status,
      installments: rawInstallments
    } = body

    // Validate required fields
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: customerId, items (non-empty array)',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 })
    }

    // Check if invoice exists
    const existingInvoice = await db.invoice.findUnique({
      where: { id },
      include: { payments: true, installments: true }
    })

    if (!existingInvoice) {
      return NextResponse.json({
        error: 'Invoice not found',
        code: 'INVOICE_NOT_FOUND'
      }, { status: 404 })
    }

    if (existingInvoice.isDeleted) {
      return NextResponse.json({
        error: 'Invoice has been archived and cannot be modified',
        code: 'INVOICE_ARCHIVED'
      }, { status: 400 })
    }

    const { items: normalizedItems, totals } = normalizeInvoiceItemsFromInput(items)

    const normalizedInstallments = normalizeInstallmentInputs(rawInstallments)

    if (normalizedInstallments.length) {
      const issueDateValue = new Date(issueDate)

      if (Number.isNaN(issueDateValue.getTime())) {
        return NextResponse.json({
          error: 'تاريخ الإصدار غير صالح عند تحديث خطة التقسيط',
          code: 'INVALID_ISSUE_DATE'
        }, { status: 400 })
      }

      const invalidDueDate = normalizedInstallments.some(installment => installment.dueDate.getTime() < issueDateValue.getTime())

      if (invalidDueDate) {
        return NextResponse.json({
          error: 'لا يمكن تعيين أقساط بتاريخ استحقاق أقدم من تاريخ إصدار الفاتورة',
          code: 'INVALID_INSTALLMENT_DUE_DATE'
        }, { status: 400 })
      }
    }

    const subtotal = totals.subtotal
    const totalTaxAmount = totals.taxAmount
    const totalAmount = totals.totalAmount
    
    // Update invoice with transaction
    const updatedInvoice = await db.$transaction(async (tx) => {
      // Delete existing items and taxes
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id }
      })
      
      await tx.invoiceTax.deleteMany({
        where: { invoiceId: id }
      })
      
      // Update invoice
      const invoice = await tx.invoice.update({
        where: { id },
        data: {
          customerId,
          type,
          status,
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate),
          subtotal,
          taxAmount: totalTaxAmount,
          totalAmount,
          notes,
          terms,
          // Don't reset paidAmount if there are existing payments
          paidAmount: existingInvoice.payments.length > 0 ? existingInvoice.paidAmount : 0
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          createdByEmployee: {
            select: {
              id: true,
              employeeNumber: true,
              department: {
                select: { name: true }
              },
              position: {
                select: { title: true }
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          },
          items: true,
          taxes: true,
          payments: {
            include: {
              payment: {
                select: {
                  id: true,
                  amount: true,
                  createdAt: true,
                  paymentMethod: true,
                  status: true,
                  transactionId: true,
                  notes: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          installments: {
            orderBy: {
              sequence: 'asc'
            }
          }
        }
      })
      
      // Create new items
      await tx.invoiceItem.createMany({
        data: normalizedItems.map(item => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          metadata: item.metadata ?? {},
        })),
      })

      if (totals.breakdown.length > 0) {
        await tx.invoiceTax.createMany({
          data: totals.breakdown.map(tax => ({
            invoiceId: id,
            taxType: tax.taxType,
            rate: tax.rate,
            taxAmount: tax.taxAmount,
            description: tax.description,
          })),
        })
      }

      const existingInstallments = await tx.invoiceInstallment.findMany({
        where: { invoiceId: id }
      })

      const normalizedWithSequence = normalizedInstallments.map((installment, index) => ({
        ...installment,
        sequence: index + 1,
      }))

      const incomingIds = new Set(
        normalizedWithSequence
          .map(installment => installment.id)
          .filter((value): value is string => Boolean(value))
      )

      const removableInstallments = existingInstallments.filter(installment => !incomingIds.has(installment.id))

      if (
        removableInstallments.some(
          installment => installment.paymentId || sanitizeNumber(installment.paidAmount) > 0
        )
      ) {
        throw new Error('لا يمكن حذف قسط مرتبط بسداد مسجل أو مدفوعات قائمة')
      }

      if (removableInstallments.length) {
        await tx.invoiceInstallment.deleteMany({
          where: { id: { in: removableInstallments.map(installment => installment.id) } }
        })
      }

      for (const installment of normalizedWithSequence) {
        const existing = installment.id
          ? existingInstallments.find(item => item.id === installment.id)
          : undefined

        const paidAmount = installment.paidAmount > 0
          ? installment.paidAmount
          : sanitizeNumber(existing?.paidAmount)

        const computedStatus = installment.hasManualStatus
          ? installment.status
          : clampInstallmentStatus({
              amount: installment.amount,
              paidAmount,
              dueDate: installment.dueDate,
              status: existing?.status ?? InstallmentStatus.SCHEDULED,
            })

        const installmentData = {
          sequence: installment.sequence,
          amount: installment.amount,
          dueDate: installment.dueDate,
          status: computedStatus,
          paidAmount,
          notes: installment.notes ?? null,
          metadata: installment.metadata ?? existing?.metadata ?? null,
        }

        if (existing) {
          await tx.invoiceInstallment.update({
            where: { id: existing.id },
            data: installmentData,
          })
        } else {
          await tx.invoiceInstallment.create({
            data: {
              invoiceId: id,
              ...installmentData,
            }
          })
        }
      }

      return invoice
    })
    

    const normalizedInvoice = normalizeInvoiceRecord({
      subtotal: updatedInvoice.subtotal,
      taxAmount: updatedInvoice.taxAmount,
      totalAmount: updatedInvoice.totalAmount,
      paidAmount: updatedInvoice.paidAmount,
      items: updatedInvoice.items,
      taxes: updatedInvoice.taxes,
    })

    const paidAmount = normalizedInvoice.totalAmount - normalizedInvoice.outstanding

    const normalizedInstallmentsResponse = updatedInvoice.installments.map(installment => {
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

    const updatedInstallmentTotals = calculateInstallmentTotals(updatedInvoice.installments)

    if (updatedInvoice.createdByEmployeeId) {
      await updateEmployeePerformanceMetrics({
        employeeId: updatedInvoice.createdByEmployeeId,
        periodType: PerformancePeriod.MONTHLY,
        referenceDate: updatedInvoice.issueDate,
      })
    }

    const successResponse = NextResponse.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: {
        ...updatedInvoice,
        subtotal: normalizedInvoice.subtotal,
        taxAmount: normalizedInvoice.taxAmount,
        totalAmount: normalizedInvoice.totalAmount,
        paidAmount,
        outstanding: normalizedInvoice.outstanding,
        items: normalizedInvoice.items,
        taxes: normalizedInvoice.taxes,
        createdBy: updatedInvoice.createdBy,
        creator: updatedInvoice.createdByEmployee
          ? {
              employeeId: updatedInvoice.createdByEmployee.id,
              employeeNumber: updatedInvoice.createdByEmployee.employeeNumber,
              department: updatedInvoice.createdByEmployee.department?.name ?? null,
              position: updatedInvoice.createdByEmployee.position?.title ?? null,
              user: updatedInvoice.createdByEmployee.user
                ? {
                    id: updatedInvoice.createdByEmployee.user.id,
                    name: updatedInvoice.createdByEmployee.user.name,
                    email: updatedInvoice.createdByEmployee.user.email,
                  }
                : null,
            }
          : null,
        installments: normalizedInstallmentsResponse,
        installmentSummary: {
          scheduled: updatedInstallmentTotals.scheduled,
          paid: updatedInstallmentTotals.paid,
          outstanding: Math.max(0, updatedInstallmentTotals.scheduled - updatedInstallmentTotals.paid),
        },
      },
    })
    
    successResponse.headers.set('Access-Control-Allow-Origin', '*')
    successResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    successResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    
    return successResponse
  } catch (error) {
    console.error('=== INVOICE UPDATE ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Check for specific database connection errors
    if (error instanceof Error) {
      if (error.message.includes('connection') || error.message.includes('timeout')) {
        const errorResponse = NextResponse.json({ 
          error: 'Database connection error. Please try again.',
          code: 'DATABASE_CONNECTION_ERROR',
          details: 'Unable to connect to the database. Please try again later.'
        }, { status: 503 })
        errorResponse.headers.set('Access-Control-Allow-Origin', '*')
        errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        return errorResponse
      }
      
      if (error.message.includes('prisma') || error.message.includes('query')) {
        const errorResponse = NextResponse.json({ 
          error: 'Database query error. Please try again.',
          code: 'DATABASE_QUERY_ERROR',
          details: 'A database error occurred while processing your request.'
        }, { status: 500 })
        errorResponse.headers.set('Access-Control-Allow-Origin', '*')
        errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        return errorResponse
      }
      
      if (error.message.includes('Foreign key constraint')) {
        const errorResponse = NextResponse.json({ 
          error: 'Invalid customer or related data. Please check your input.',
          code: 'FOREIGN_KEY_CONSTRAINT',
          details: 'The specified customer or related data does not exist.'
        }, { status: 400 })
        errorResponse.headers.set('Access-Control-Allow-Origin', '*')
        errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        return errorResponse
      }
    }
    
    const errorResponse = NextResponse.json({ 
      error: 'Failed to update invoice',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
    
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    
    return errorResponse
  } finally {
    if (isConnected) {
      await db.$disconnect()
    }
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    const applyCorsHeaders = (response: NextResponse) => {
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      return response
    }
    const user = await authenticateProductionUser(request)

    if (!user) {
      return applyCorsHeaders(NextResponse.json(
        { error: 'غير مصرح لك - يرجى تسجيل الدخول', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ))
    }

    const hasDeletePermission =
      user.permissions.includes('*') ||
      user.permissions.includes(PERMISSIONS.DELETE_INVOICES)

    const hasRoleAccess =
      user.role === UserRole.ADMIN ||
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.BRANCH_MANAGER ||
      user.role === UserRole.ACCOUNTANT

    if (!hasDeletePermission && !hasRoleAccess) {
      return applyCorsHeaders(NextResponse.json(
        { error: 'غير مصرح لك - صلاحيات غير كافية', code: 'FORBIDDEN' },
        { status: 403 }
      ))
    }

    let deleteReason: string | null = null

    const contentType = request.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const body = await request.json().catch(() => null)
      if (body && typeof body.reason === 'string') {
        const trimmed = body.reason.trim()
        if (trimmed.length > 0) {
          deleteReason = trimmed.slice(0, 500)
        }
      }
    }

    const invoice = await db.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        isDeleted: true,
        invoiceNumber: true,
        issueDate: true,
        createdByEmployeeId: true,
      },
    })

    if (!invoice) {
      return applyCorsHeaders(NextResponse.json(
        { error: 'Invoice not found', code: 'INVOICE_NOT_FOUND' },
        { status: 404 }
      ))
    }

    if (invoice.isDeleted) {
      return applyCorsHeaders(NextResponse.json(
        { error: 'Invoice already archived', code: 'INVOICE_ALREADY_ARCHIVED' },
        { status: 409 }
      ))
    }

    const archivedInvoice = await db.invoice.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: user.id,
        deletedReason: deleteReason,
      },
      select: {
        id: true,
        invoiceNumber: true,
        deletedAt: true,
        deletedBy: true,
        deletedReason: true,
        status: true,
      },
    })

    if (invoice.createdByEmployeeId) {
      await updateEmployeePerformanceMetrics({
        employeeId: invoice.createdByEmployeeId,
        periodType: PerformancePeriod.MONTHLY,
        referenceDate: invoice.issueDate,
      })
    }

    return applyCorsHeaders(NextResponse.json({
      success: true,
      invoice: archivedInvoice,
    }))
  } catch (error) {
    console.error('Error deleting invoice:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    return response
  }
}