interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireUnifiedAuth(request)
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      include: { role: true }
    })

    if (!user || ![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role.name as UserRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const dateRange = searchParams.get('dateRange') || 'month'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build date filter
    const now = new Date()
    let startDate = new Date()
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Build where clause
    const where: any = {
      createdAt: {
        gte: startDate
      }
    }

    if (status && status !== 'all') {
      where.status = status
    }

    // Add branch filter for branch managers
    if (user.role.name === UserRole.BRANCH_MANAGER && user.branchId) {
      where.customer = {
        branchId: user.branchId
      }
    }

    const [quotations, total] = await Promise.all([
      db.quotation.findMany({
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
          createdBy: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.quotation.count({ where })
    ])

    return NextResponse.json({
      quotations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching quotations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireUnifiedAuth(request)
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      include: { role: true }
    })

    if (!user || ![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role.name as UserRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { customerId, validUntil, notes, terms, items } = body

    if (!customerId || !validUntil || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate customer exists and user has access
    const customer = await db.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Check branch permissions
    if (user.role.name === UserRole.BRANCH_MANAGER && user.branchId && customer.branchId !== user.branchId) {
      return NextResponse.json({ error: 'Cannot create quotation for customer from different branch' }, { status: 403 })
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0)
    const taxAmount = items.reduce((sum: number, item: any) => sum + item.taxAmount, 0)
    const totalAmount = subtotal + taxAmount

    // Generate quotation number
    const lastQuotation = await db.quotation.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    const quotationNumber = lastQuotation 
      ? `Q-${parseInt(lastQuotation.quotationNumber.replace('Q-', '')) + 1}`.padStart(6, '0')
      : 'Q-000001'

    // Create quotation
    const quotation = await db.quotation.create({
      data: {
        quotationNumber,
        customerId,
        status: 'DRAFT',
        issueDate: new Date(),
        validUntil: new Date(validUntil),
        subtotal,
        taxAmount,
        totalAmount,
        currency: 'EGP',
        notes,
        terms,
        createdById: user.id,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
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
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'CREATE_QUOTATION',
        entityType: 'QUOTATION',
        entityId: quotation.id,
        userId: user.id,
        details: {
          quotationNumber: quotation.quotationNumber,
          customerId: customer.id,
          totalAmount: quotation.totalAmount
        }
      }
    })

    return NextResponse.json(quotation, { status: 201 })
  } catch (error) {
    console.error('Error creating quotation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}