interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'
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
                      user.permissions.includes(PERMISSIONS.VIEW_INVOICES)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
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
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  let isConnected = false
  
  try {
    console.log('=== INVOICE CREATION START ===')
    
    // Ensure database connection
    await db.$connect()
    isConnected = true
    console.log('Database connected successfully')
    
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    console.log('User authenticated:', user.email, user.role)
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.role === UserRole.BRANCH_MANAGER ||
                      user.role === UserRole.ACCOUNTANT ||
                      user.permissions.includes(PERMISSIONS.CREATE_INVOICES)
    
    if (!hasAccess) {
      console.log('Permission denied for user:', user.email)
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }
    
    const body = await request.json()
    console.log('Request body:', body)
    
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
      console.log('Missing required fields:', {
        customerId: !!customerId,
        items: !!items,
        itemsLength: items?.length,
        issueDate: !!issueDate,
        dueDate: !!dueDate,
        createdBy: !!createdBy
      })
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
        { status: 400 }
      )
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      console.log('Invalid items array:', items)
      return NextResponse.json(
        { error: 'Items must be a non-empty array' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.description || !item.quantity || !item.unitPrice) {
        console.log('Invalid item:', item)
        return NextResponse.json(
          { 
            error: 'Each item must have description, quantity, and unitPrice',
            details: { invalidItem: item }
          },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)

    console.log('Calculated subtotal:', subtotal)

    // Calculate taxes from database tax rates
    let taxRates = await db.taxRate.findMany({
      where: { isActive: true }
    })

    // Create default VAT rate if none exists
    if (taxRates.length === 0) {
      console.log('No tax rates found, creating default VAT rate...')
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
      console.log('Created default VAT rate:', defaultVAT)
    }

    // Calculate total tax amount from all applicable tax rates
    const totalTaxAmount = taxRates.reduce((sum, taxRate) => {
      return sum + (subtotal * taxRate.rate / 100)
    }, 0)

    const totalAmount = subtotal + totalTaxAmount
    
    console.log('Calculated amounts:', {
      subtotal,
      totalTaxAmount,
      totalAmount
    })

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
      
      console.log('Invoice created:', newInvoice.id)
      
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
      
      console.log('Invoice items created')
      
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
      
      console.log('Invoice taxes created')
      
      return newInvoice
    })
    
    console.log('Invoice created successfully:', invoice.invoiceNumber)

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
    
    const successResponse = NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      invoice: completeInvoice
    }, { status: 201 })
    
    successResponse.headers.set('Access-Control-Allow-Origin', '*')
    successResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    successResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    
    return successResponse
    
  } catch (error) {
    console.error('=== INVOICE CREATION ERROR ===')
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
          error: 'Invalid customer or branch. Please check your input.',
          code: 'FOREIGN_KEY_CONSTRAINT',
          details: 'The specified customer or branch does not exist.'
        }, { status: 400 })
        errorResponse.headers.set('Access-Control-Allow-Origin', '*')
        errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        return errorResponse
      }
      
      if (error.message.includes('Unique constraint')) {
        const errorResponse = NextResponse.json({ 
          error: 'Duplicate invoice number. Please try again.',
          code: 'DUPLICATE_INVOICE',
          details: 'An invoice with this number already exists.'
        }, { status: 400 })
        errorResponse.headers.set('Access-Control-Allow-Origin', '*')
        errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        return errorResponse
      }
    }
    
    const errorResponse = NextResponse.json({ 
      error: 'Failed to create invoice',
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
      console.log('Database disconnected')
    }
  }
}