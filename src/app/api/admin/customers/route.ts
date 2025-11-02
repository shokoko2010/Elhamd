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
                      user.permissions.includes(PERMISSIONS.VIEW_USERS)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    // Build where clause - only show customers
    const where: any = {
      role: UserRole.CUSTOMER
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }
    
    if (isActive !== null && isActive !== 'all') {
      where.isActive = isActive === 'true'
    }

    const [customers, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              testDriveBookings: true,
              serviceBookings: true,
              permissions: true
            }
          },
          permissions: {
            include: {
              permission: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.user.count({ where })
    ])

    // Calculate additional fields for the frontend
    const customersWithStats = customers.map(customer => ({
      ...customer,
      totalBookings: (customer._count.testDriveBookings || 0) + (customer._count.serviceBookings || 0),
      totalSpent: 0 // Calculate from bookings/invoices when implemented
    }))

    return NextResponse.json({
      customers: customersWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'فشل في جلب العملاء' },
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
                      user.permissions.includes(PERMISSIONS.CREATE_USERS)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }
    
    const body = await request.json()
    const { email, name, phone, address, licenseNumber } = body

    // Check if customer already exists
    const existingCustomer = await db.user.findUnique({
      where: { email }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'العميل موجود بالفعل' },
        { status: 400 }
      )
    }

    // Create customer
    const newCustomer = await db.user.create({
      data: {
        email,
        name,
        role: UserRole.CUSTOMER,
        phone,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({ customer: newCustomer }, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء العميل' },
      { status: 500 }
    )
  }
}