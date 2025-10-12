interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PartStatus, PartCategory } from '@/types/maintenance'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const category = searchParams.get('category') || 'all'

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { partNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { supplier: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status !== 'all') {
      where.status = status as PartStatus
    }

    if (category !== 'all') {
      where.category = category as PartCategory
    }

    const [parts, total] = await Promise.all([
      prisma.maintenancePart.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              usedIn: true,
            },
          },
        },
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    if (!partNumber || !name || !category || !cost || !price || !quantity || !minStock) {
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
        cost,
        price,
        quantity,
        minStock,
        maxStock,
        location,
        supplier,
        status: status as PartStatus || PartStatus.AVAILABLE,
        barcode,
        imageUrl,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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