interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { VehicleCategory } from '@prisma/client'
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
    
    // Check if user has required role or permissions (public access for customers, staff access for others)
    const hasAccess = user.role === UserRole.CUSTOMER ||
                      user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.role === UserRole.STAFF ||
                      user.role === UserRole.BRANCH_MANAGER ||
                      user.role === UserRole.SALES_MANAGER ||
                      user.permissions.includes(PERMISSIONS.VIEW_VEHICLES)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const fuelType = searchParams.get('fuelType') || ''
    const transmission = searchParams.get('transmission') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'AVAILABLE'
    }

    if (category && category !== 'all') {
      where.category = category as VehicleCategory
    }

    if (fuelType && fuelType !== 'all') {
      where.fuelType = fuelType
    }

    if (transmission && transmission !== 'all') {
      where.transmission = transmission
    }

    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [vehicles, total] = await Promise.all([
      db.vehicle.findMany({
        where,
        include: {
          images: {
            orderBy: {
              order: 'asc'
            },
            select: {
              id: true,
              imageUrl: true,
              altText: true,
              isPrimary: true,
              order: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      db.vehicle.count({ where })
    ])

    return NextResponse.json({
      vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { error: 'فشل في جلب المركبات' },
      { status: 500 }
    )
  }
}