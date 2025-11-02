import { NextRequest, NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER && user.role !== UserRole.STAFF)) {
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

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status !== 'all') {
      where.status = status
    }

    if (type !== 'all') {
      where.type = type
    }

    if (vehicleId) {
      where.vehicleId = vehicleId
    }

    const [schedules, total] = await Promise.all([
      db.maintenanceSchedule.findMany({
        where,
        orderBy: [
          { priority: 'asc' },
          { nextService: 'asc' },
        ],
        skip,
        take: limit,
      }),
      db.maintenanceSchedule.count({ where }),
    ])

    // Get vehicle information for each schedule
    const schedulesWithVehicles = await Promise.all(
      schedules.map(async (schedule) => {
        const vehicle = await db.vehicle.findUnique({
          where: { id: schedule.vehicleId },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            stockNumber: true,
          },
        })

        const recordsCount = await db.maintenanceRecord.count({
          where: { scheduleId: schedule.id }
        })

        const remindersCount = await db.maintenanceReminder.count({
          where: { scheduleId: schedule.id }
        })

        return {
          ...schedule,
          vehicle,
          _count: {
            records: recordsCount,
            reminders: remindersCount,
          },
        }
      })
    )

    return NextResponse.json({
      schedules: schedulesWithVehicles,
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
    const user = await getApiUser(request)
    
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER)) {
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
    const vehicle = await db.vehicle.findUnique({
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

    const schedule = await db.maintenanceSchedule.create({
      data: {
        vehicleId,
        type,
        title,
        description,
        interval,
        intervalKm,
        estimatedCost,
        priority: priority || 'PENDING',
        isActive: true,
        nextService,
        createdBy: user.id,
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