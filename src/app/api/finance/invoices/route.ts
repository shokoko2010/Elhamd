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

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  return response
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== INVOICE CREATION START ===')
    
    // Check authentication and authorization
    const user = await getAuthUser()
    // Add CORS headers to all error responses
    const errorResponse = (error: any, status: number) => {
      const response = NextResponse.json(error, { status })
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      return response
    }

    if (!user) {
      console.log('No user authenticated')
      return errorResponse({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, 401)
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
      return errorResponse({ error: 'غير مصرح لك - صلاحيات غير كافية' }, 403)
    }
    
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
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
      return errorResponse(
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
        400
      )
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      console.log('Invalid items array:', items)
      return errorResponse(
        { error: 'Items must be a non-empty array' },
        400
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.description || !item.quantity || !item.unitPrice) {
        console.log('Invalid item:', item)
        return errorResponse(
          { 
            error: 'Each item must have description, quantity, and unitPrice',
            details: { invalidItem: item }
          },
          400
        )
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)

    console.log('Calculated subtotal:', subtotal)

    // Get tax rates - use simple approach
    let taxRates = []
    try {
      taxRates = await db.taxRate.findMany({
        where: { isActive: true }
      })
      console.log('Found tax rates:', taxRates.length)
    } catch (error) {
      console.log('Error fetching tax rates (table might not exist):', error)
      // Continue with default tax rates
    }

    // Use default VAT rate if no tax rates found or table doesn't exist
    if (taxRates.length === 0) {
      console.log('No tax rates found, using default 14% VAT')
      taxRates = [{
        id: 'default-vat',
        type: 'STANDARD',
        rate: 14.0,
        description: 'ضريبة القيمة المضافة القياسية'
      }]
    }

    // Calculate total tax amount
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

    // Create invoice - simplified approach
    try {
      const invoice = await db.invoice.create({
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
          branchId: branchId || user.branchId || null,
          items: {
            create: items.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              taxRate: item.taxRate || 0,
              taxAmount: (item.quantity * item.unitPrice) * (item.taxRate || 0) / 100,
              metadata: item.metadata || {}
            }))
          }
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
          items: true
        }
      })
      
      // Try to create taxes if table exists
      try {
        await db.invoiceTax.createMany({
          data: taxRates.map(taxRate => ({
            invoiceId: invoice.id,
            taxType: taxRate.type,
            rate: taxRate.rate,
            taxAmount: subtotal * taxRate.rate / 100,
            description: taxRate.description
          }))
        })
        console.log('Invoice taxes created successfully')
      } catch (taxError) {
        console.log('Could not create invoice taxes (table might not exist):', taxError)
        // Continue without taxes - invoice is still created
      }
      
      // Fetch complete invoice with taxes if possible
      let completeInvoice = invoice
      try {
        completeInvoice = await db.invoice.findUnique({
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
      } catch (fetchError) {
        console.log('Could not fetch taxes, returning invoice without taxes:', fetchError)
        // Return the invoice without taxes
      }
      
      console.log('Invoice created successfully:', invoice.invoiceNumber)

      const response = NextResponse.json({
        success: true,
        message: 'Invoice created successfully',
        invoice: completeInvoice
      }, { status: 201 })
      
      // Add CORS headers for Vercel deployment
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      
      return response
    } catch (createError) {
      console.error('Error creating invoice:', createError)
      throw createError
    }
    
  } catch (error) {
    console.error('=== INVOICE CREATION ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Check for specific errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return errorResponse({ 
          error: 'Invalid customer or branch. Please check your input.',
          code: 'FOREIGN_KEY_CONSTRAINT'
        }, 400)
      }
      
      if (error.message.includes('Unique constraint')) {
        return errorResponse({ 
          error: 'Duplicate invoice number. Please try again.',
          code: 'DUPLICATE_INVOICE'
        }, 400)
      }
      
      if (error.message.includes('connection') || error.message.includes('timeout')) {
        return errorResponse({ 
          error: 'Database connection error. Please try again.',
          code: 'DATABASE_CONNECTION_ERROR'
        }, 503)
      }
    }
    
    return errorResponse({ 
      error: 'Failed to create invoice',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_ERROR'
    }, 500)
  }
}