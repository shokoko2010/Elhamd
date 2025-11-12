interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PartStatus, PartCategory } from '@/types/maintenance'
import { backfillMaintenancePartsFromInventory } from '@/lib/maintenance-part-sync'
import { getAuthUser, UserRole } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.STAFF,
      UserRole.BRANCH_MANAGER
    ].includes(user.role)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await backfillMaintenancePartsFromInventory(user.id)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const category = searchParams.get('category') || 'all'

    const skip = (page - 1) * limit

    const filters: any[] = [
      {
        NOT: {
          partNumber: {
            startsWith: 'VEH-',
            mode: 'insensitive'
          }
        }
      }
    ]

    if (search) {
      filters.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { partNumber: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { supplier: { contains: search, mode: 'insensitive' } },
        ]
      })
    }

    if (status !== 'all') {
      filters.push({ status: status as PartStatus })
    }

    if (category !== 'all') {
      filters.push({ category: category as PartCategory })
    }

    const where = filters.length === 1 ? filters[0] : { AND: filters }

    const [parts, total] = await Promise.all([
      prisma.maintenancePart.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { name: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.maintenancePart.count({ where }),
    ])

    return NextResponse.json({
      parts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching maintenance parts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance parts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.STAFF,
      UserRole.BRANCH_MANAGER
    ].includes(user.role)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await request.json()
    const {
      partNumber,
      name,
      category,
      description,
      cost,
      price,
      quantity,
      minStock,
      maxStock,
      location,
      supplier,
      status,
      barcode,
      imageUrl,
    } = data

    // Validate required fields
    const parsedCost = Number(cost)
    const parsedPrice = Number(price)
    const parsedQuantity = Number(quantity)
    const parsedMinStock = Number(minStock)
    const parsedMaxStock = maxStock !== undefined && maxStock !== null ? Number(maxStock) : null

    if (!partNumber || !name || !category || Number.isNaN(parsedCost) || Number.isNaN(parsedPrice) || Number.isNaN(parsedQuantity) || Number.isNaN(parsedMinStock)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if part number already exists
    const existingPart = await prisma.maintenancePart.findUnique({
      where: { partNumber },
    })

    if (existingPart) {
      return NextResponse.json(
        { error: 'Part number already exists' },
        { status: 400 }
      )
    }

    const part = await prisma.maintenancePart.create({
      data: {
        partNumber,
        name,
        category: category as PartCategory,
        description,
        cost: parsedCost,
        price: parsedPrice,
        quantity: parsedQuantity,
        minStock: parsedMinStock,
        maxStock: parsedMaxStock,
        location,
        supplier,
        status: status ? (status as PartStatus) : PartStatus.AVAILABLE,
        barcode,
        imageUrl,
        createdBy: user.id,
      },
    })

    return NextResponse.json(part, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance part:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance part' },
      { status: 500 }
    )
  }
}