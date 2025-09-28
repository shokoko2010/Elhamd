import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { MaintenanceStatus, MaintenanceType } from '@/types/maintenance'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const type = searchParams.get('type') || 'all'
    const vehicleId = searchParams.get('vehicleId')

    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status !== 'all') {
      where.priority = status as MaintenanceStatus
    }

    if (type !== 'all') {
      where.type = type as MaintenanceType
    }

    if (vehicleId) {
      where.vehicleId = vehicleId
    }

    const [schedules, total] = await Promise.all([
      prisma.maintenanceSchedule.findMany({
        where,
        include: {
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              stockNumber: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              records: true,
              reminders: true,
            },
          },
        },
        orderBy: [
          { priority: 'asc' },
          { nextService: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.maintenanceSchedule.count({ where }),
    ])

    return NextResponse.json({
      schedules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance schedules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      vehicleId,
      type,
      title,
      description,
      interval,
      intervalKm,
      estimatedCost,
      priority,
    } = data

    // Validate required fields
    if (!vehicleId || !type || !title || !interval) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Calculate next service date
    const nextService = new Date()
    nextService.setDate(nextService.getDate() + interval)

    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        vehicleId,
        type: type as MaintenanceType,
        title,
        description,
        interval,
        intervalKm,
        estimatedCost,
        priority: priority as MaintenanceStatus || MaintenanceStatus.PENDING,
        isActive: true,
        createdBy: user.id,
        nextService,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            stockNumber: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance schedule' },
      { status: 500 }
    )
  }
}