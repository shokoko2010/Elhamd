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
    const scheduleId = searchParams.get('scheduleId')

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status !== 'all') {
      where.status = status
    }

    if (scheduleId) {
      where.scheduleId = scheduleId
    }

    const [reminders, total] = await Promise.all([
      db.maintenanceReminder.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { reminderDate: 'asc' },
        ],
        skip,
        take: limit,
      }),
      db.maintenanceReminder.count({ where }),
    ])

    // Get related information for each reminder
    const remindersWithDetails = await Promise.all(
      reminders.map(async (reminder) => {
        const schedule = await db.maintenanceSchedule.findUnique({
          where: { id: reminder.scheduleId },
          select: {
            id: true,
            title: true,
            type: true,
          },
        })

        const vehicle = await db.vehicle.findUnique({
          where: { id: reminder.vehicleId },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            stockNumber: true,
          },
        })

        return {
          ...reminder,
          schedule,
          vehicle,
        }
      })
    )

    return NextResponse.json({
      reminders: remindersWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Error fetching maintenance reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance reminders' },
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
      scheduleId,
      vehicleId,
      title,
      message,
      reminderDate,
      type,
    } = data

    // Validate required fields
    if (!scheduleId || !vehicleId || !title || !message || !reminderDate || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if schedule exists
    const schedule = await db.maintenanceSchedule.findUnique({
      where: { id: scheduleId },
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Maintenance schedule not found' },
        { status: 404 }
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

    const reminder = await db.maintenanceReminder.create({
      data: {
        scheduleId,
        vehicleId,
        title,
        message,
        reminderDate: new Date(reminderDate),
        type,
        status: 'PENDING',
        createdBy: user.id,
      },
      include: {
        schedule: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
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

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance reminder:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance reminder' },
      { status: 500 }
    )
  }
}