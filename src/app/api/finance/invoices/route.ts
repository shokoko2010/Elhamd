interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'
import { PERMISSIONS } from '@/lib/permissions'

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
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        }
      })
    }
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.role === UserRole.BRANCH_MANAGER ||
                      user.role === UserRole.ACCOUNTANT ||
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
    const customerId = searchParams.get('customerId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
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
    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          items: true,
          payments: {
            include: {
              payment: true
            }
          },
          taxes: {
            include: {
              taxRate: true
            }
          }
        },
        orderBy: {
          issueDate: 'desc'
        },
        skip,
        take: limit
      }),
      db.invoice.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
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
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        }
      })
    }
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.role === UserRole.BRANCH_MANAGER ||
                      user.role === UserRole.ACCOUNTANT ||
                      user.permissions.includes(PERMISSIONS.CREATE_INVOICES)
    
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
      createdBy,
      branchId
    } = body

    // Validate required fields
    if (!customerId || !items || !items.length || !issueDate || !dueDate || !createdBy) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: {
            customerId: !!customerId,
            items: !!items && items.length > 0,
            issueDate: !!issueDate,
            dueDate: !!dueDate,
            createdBy: !!createdBy
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

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)

    // Calculate taxes from database tax rates
    let taxRates = await db.taxRate.findMany({
      where: { isActive: true }
    })

    // Create default VAT rate if none exists
    if (taxRates.length === 0) {
      const defaultVAT = await db.taxRate.create({
        data: {
          name: 'ضريبة القيمة المضافة',
          type: 'STANDARD',
          rate: 14.0, // 14% VAT in Egypt
          description: 'ضريبة القيمة المضافة القياسية في مصر',
          isActive: true,
          effectiveFrom: new Date('2020-01-01')
        }
      })
      taxRates = [defaultVAT]
    }

    // Calculate total tax amount from all applicable tax rates
    const totalTaxAmount = taxRates.reduce((sum, taxRate) => {
      return sum + (subtotal * taxRate.rate / 100)
    }, 0)

    const totalAmount = subtotal + totalTaxAmount

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create invoice with transaction
    const invoice = await db.$transaction(async (tx) => {
      // Create the invoice first
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId,
          type: type || 'SERVICE',
          status: 'DRAFT',
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate),
          subtotal,
          taxAmount: totalTaxAmount,
          totalAmount,
          paidAmount: 0,
          currency: 'EGP',
          notes,
          terms,
          createdBy,
          branchId: branchId || user.branchId || null
        }
      })
      
      // Create invoice items
      await tx.invoiceItem.createMany({
        data: items.map((item: any) => ({
          invoiceId: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          taxRate: item.taxRate || 0,
          taxAmount: (item.quantity * item.unitPrice) * (item.taxRate || 0) / 100,
          metadata: item.metadata || {}
        }))
      })
      
      // Create invoice taxes
      await tx.invoiceTax.createMany({
        data: taxRates.map(taxRate => ({
          invoiceId: newInvoice.id,
          taxType: taxRate.type,
          rate: taxRate.rate,
          taxAmount: subtotal * taxRate.rate / 100,
          description: taxRate.description
        }))
      })
      
      return newInvoice
    })
    
    // Fetch the complete invoice with relations
    const completeInvoice = await db.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: true,
        taxes: true
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      invoice: completeInvoice
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