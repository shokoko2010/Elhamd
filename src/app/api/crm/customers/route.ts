interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateProductionUser } from '@/lib/production-auth-vercel'
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
    console.log('🔍 GET /api/crm/customers: Starting request...')
    
    // Check authentication using production method
    const user = await authenticateProductionUser(request)
    if (!user) {
      console.log('❌ GET /api/crm/customers: Authentication failed')
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
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.role === UserRole.BRANCH_MANAGER ||
                      user.role === UserRole.ACCOUNTANT ||
                      user.permissions.includes(PERMISSIONS.VIEW_CUSTOMERS)
    
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
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      }
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
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
  let isConnected = false
  
  try {
    console.log('🔍 POST /api/crm/customers: Starting request...')
    
    // Ensure database connection
    await db.$connect()
    isConnected = true
    
    // Check authentication using production method
    const user = await authenticateProductionUser(request)
    if (!user) {
      console.log('❌ POST /api/crm/customers: Authentication failed')
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
    
    console.log(`✅ POST /api/crm/customers: User authenticated: ${user.email}, Role: ${user.role}`)
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.role === UserRole.BRANCH_MANAGER ||
                      user.role === UserRole.ACCOUNTANT ||
                      user.permissions.includes(PERMISSIONS.CREATE_CUSTOMERS)
    
    console.log(`✅ POST /api/crm/customers: Access check: ${hasAccess}`)
    
    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'غير مصرح لك - صلاحيات غير كافية',
        details: {
          userRole: user.role,
          userPermissions: user.permissions,
          requiredPermission: PERMISSIONS.CREATE_CUSTOMERS
        }
      }, { 
        status: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        }
      })
    }
    
    const body = await request.json()
    console.log('✅ POST /api/crm/customers: Request body parsed:', body)
    
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

    console.log(`✅ POST /api/crm/customers: Checking if customer exists: ${email}`)
    
    // Check if customer already exists
    const existingCustomer = await db.user.findUnique({
      where: { email }
    })

    if (existingCustomer) {
      console.log(`❌ POST /api/crm/customers: Customer already exists: ${email}`)
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
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

    console.log(`✅ POST /api/crm/customers: Creating new customer: ${email}`)
    
    // Create customer with simplified data first
    try {
      const customer = await db.user.create({
        data: {
          email,
          name,
          phone,
          role: 'CUSTOMER',
          status: 'active',
          segment: 'CUSTOMER'
        }
      })

      console.log(`✅ POST /api/crm/customers: Basic customer created: ${customer.id}`)
      
      // Now create the customer profile
      try {
        const customerProfile = await db.customerProfile.create({
          data: {
            userId: customer.id,
            segment: segment as any,
            leadSource,
            preferences: {},
            riskScore: 0,
            satisfactionScore: 0,
            referralCount: 0,
            totalPurchases: 0,
            totalSpent: 0,
            isActive: true,
            notes,
            tags: tags.length > 0 ? tags : []
          }
        })

        console.log(`✅ POST /api/crm/customers: Customer profile created: ${customerProfile.id}`)
        
        // Return the complete customer data
        const completeCustomer = await db.user.findUnique({
          where: { id: customer.id },
          include: {
            customerProfile: true
          }
        })

        const response = NextResponse.json(completeCustomer, { 
          status: 201,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          }
        })
        
        console.log(`✅ POST /api/crm/customers: Response sent successfully`)
        return response

      } catch (profileError) {
        console.error('❌ POST /api/crm/customers: Error creating customer profile:', profileError)
        // Delete the user if profile creation fails
        await db.user.delete({ where: { id: customer.id } })
        throw profileError
      }

    } catch (userError) {
      console.error('❌ POST /api/crm/customers: Error creating user:', userError)
      throw userError
    }
    
  } catch (error) {
    console.error('=== CUSTOMER CREATION ERROR ===')
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
          error: 'Invalid data provided. Please check your input.',
          code: 'FOREIGN_KEY_CONSTRAINT',
          details: 'The provided data is invalid or references non-existent records.'
        }, { status: 400 })
        errorResponse.headers.set('Access-Control-Allow-Origin', '*')
        errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        return errorResponse
      }
    }
    
    const errorResponse = NextResponse.json({ 
      error: 'Failed to create customer',
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