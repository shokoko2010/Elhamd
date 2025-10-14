interface RouteParams {
  params: Promise<{ id: string }>
}

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

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { technician: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status !== 'all') {
      where.status = status as MaintenanceStatus
    }

    if (type !== 'all') {
      where.type = type as MaintenanceType
    }

    if (vehicleId) {
      where.vehicleId = vehicleId
    }

    const [records, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
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
          schedule: {
            select: {
              id: true,
              title: true,
              type: true,
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
          { startDate: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.maintenanceRecord.count({ where }),
    ])

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching maintenance records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance records' },
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
      scheduleId,
      type,
      title,
      description,
      cost,
      technician,
      startDate,
      endDate,
      status,
      notes,
      parts,
      laborHours,
      odometer,
    } = data

    // Validate required fields
    if (!vehicleId || !type || !title || !description || !cost || !technician || !startDate) {
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

    // If scheduleId is provided, check if it exists
    if (scheduleId) {
      const schedule = await prisma.maintenanceSchedule.findUnique({
        where: { id: scheduleId },
      })

      if (!schedule) {
        return NextResponse.json(
          { error: 'Maintenance schedule not found' },
          { status: 404 }
        )
      }
    }

    const record = await prisma.maintenanceRecord.create({
      data: {
        vehicleId,
        scheduleId,
        type: type as MaintenanceType,
        title,
        description,
        cost,
        technician,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status as MaintenanceStatus || MaintenanceStatus.IN_PROGRESS,
        notes,
        parts,
        laborHours,
        odometer,
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
        schedule: {
          select: {
            id: true,
            title: true,
            type: true,
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

    // Update the maintenance schedule if this record is linked to one
    if (scheduleId && status === MaintenanceStatus.COMPLETED) {
      await prisma.maintenanceSchedule.update({
        where: { id: scheduleId },
        data: {
          lastService: new Date(),
          priority: MaintenanceStatus.COMPLETED,
        },
      })
    }

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance record' },
      { status: 500 }
    )
  }
}