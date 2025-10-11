interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { MaintenanceStatus } from '@/types/maintenance'

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
    const vehicleId = searchParams.get('vehicleId')

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status !== 'all') {
      where.status = status as MaintenanceStatus
    }

    if (vehicleId) {
      where.vehicleId = vehicleId
    }

    const [reminders, total] = await Promise.all([
      prisma.maintenanceReminder.findMany({
        where,
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
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' },
          { reminderDate: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.maintenanceReminder.count({ where }),
    ])

    return NextResponse.json({
      reminders,
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
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
    if (!scheduleId || !vehicleId || !title || !message || !reminderDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if schedule exists
    const schedule = await prisma.maintenanceSchedule.findUnique({
      where: { id: scheduleId },
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Maintenance schedule not found' },
        { status: 404 }
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

    const reminder = await prisma.maintenanceReminder.create({
      data: {
        scheduleId,
        vehicleId,
        title,
        message,
        reminderDate: new Date(reminderDate),
        type: type || 'EMAIL',
        status: MaintenanceStatus.PENDING,
        createdBy: session.session.user.id,
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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
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