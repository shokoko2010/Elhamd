import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const segment = searchParams.get('segment')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      role: 'CUSTOMER',
      isActive: true
    }
    
    if (segment) {
      where.customerProfile = {
        segment: segment
      }
    }
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get customers with pagination
    const [customers, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          customerProfile: {
            include: {
              tagAssignments: true,
              lifecycles: {
                orderBy: { entryDate: 'desc' },
                take: 1
              }
            }
          },
          feedback: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.user.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    // Transform customer data
    const transformedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name || customer.email,
      email: customer.email,
      phone: customer.phone,
      segment: customer.customerProfile?.segment || 'LEAD',
      status: customer.status || 'active',
      lastContactDate: customer.customerProfile?.lastContactDate,
      totalSpent: customer.customerProfile?.totalSpent || 0,
      satisfactionScore: customer.feedback[0]?.rating || undefined,
      tags: customer.customerProfile?.tagAssignments?.map(ta => ta.tag) || [],
      lifecycle: customer.customerProfile?.lifecycles[0] || null
    }))

    return NextResponse.json({
      customers: transformedCustomers,
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
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      email,
      phone,
      segment = 'LEAD',
      leadSource,
      tags = [],
      notes
    } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if customer already exists
    const existingCustomer = await db.user.findUnique({
      where: { email }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 400 }
      )
    }

    // Create customer
    const customer = await db.user.create({
      data: {
        email,
        name,
        phone,
        role: 'CUSTOMER',
        status: 'active',
        customerProfile: {
          create: {
            segment,
            leadSource,
            tags,
            notes,
            preferences: {},
            riskScore: 0,
            satisfactionScore: 0,
            referralCount: 0,
            totalPurchases: 0,
            totalSpent: 0,
            isActive: true
          }
        }
      },
      include: {
        customerProfile: {
          include: {
            tagAssignments: true
          }
        }
      }
    })

    // Add tags if provided
    if (tags.length > 0) {
      await db.customerTagAssignment.createMany({
        data: tags.map((tag: string) => ({
          customerId: customer.customerProfile!.id,
          tag: tag as any,
          assignedBy: 'system'
        }))
      })
    }

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}