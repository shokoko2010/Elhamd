import { NextRequest, NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { Prisma, UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  let page = 1
  let limit = 10

  try {
    const user = await getApiUser(request)

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER && user.role !== UserRole.STAFF)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    page = parseInt(searchParams.get('page') || '1')
    limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    // Build where clause
    let whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get warehouses
    const [warehouses, total] = await Promise.all([
      db.warehouse.findMany({
        where: whereClause,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          _count: {
            select: {
              inventoryItems: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      db.warehouse.count({ where: whereClause })
    ])

    // Transform warehouses data
    const transformedWarehouses = warehouses.map(warehouse => ({
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity,
      currentItems: warehouse._count.inventoryItems,
      isActive: warehouse.status === 'active',
      branch: warehouse.branch
    }))

    return NextResponse.json({
      warehouses: transformedWarehouses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching warehouses:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2021' || error.code === 'P2010')) {
      return NextResponse.json({
        warehouses: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      location,
      capacity,
      manager,
      contact,
      branchId
    } = body

    // Validate required fields
    if (!name || !location || !capacity || !manager) {
      return NextResponse.json(
        { error: 'Name, location, capacity, and manager are required' },
        { status: 400 }
      )
    }

    // Create new warehouse
    const warehouse = await db.warehouse.create({
      data: {
        name,
        location,
        capacity,
        manager,
        contact,
        branchId,
        status: 'active'
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            inventoryItems: true
          }
        }
      }
    })

    const transformedWarehouse = {
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity,
      currentItems: warehouse._count.inventoryItems,
      isActive: warehouse.status === 'active',
      branch: warehouse.branch
    }

    return NextResponse.json(transformedWarehouse, { status: 201 })

  } catch (error) {
    console.error('Error creating warehouse:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2021' || error.code === 'P2010')) {
      return NextResponse.json(
        { error: 'Warehouse storage is not initialized. Please run the latest database migrations.' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}