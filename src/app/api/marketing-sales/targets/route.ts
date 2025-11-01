interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { TargetType, TargetPeriod, TargetStatus, AssignedType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // For development, skip authentication temporarily
    // const user = await getAuthUser()
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const period = searchParams.get('period')
    const assignedTo = searchParams.get('assignedTo')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) where.status = status
    if (type) where.type = type
    if (period) where.period = period
    if (assignedTo) where.assignedTo = assignedTo

    try {
      const [targets, total] = await Promise.all([
        db.salesTarget.findMany({
          where,
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            branch: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        db.salesTarget.count({ where })
      ])

      // Transform the data to match the expected format
      const transformedTargets = targets.map(target => ({
        id: target.id,
        name: target.name,
        type: target.type,
        targetValue: target.targetValue,
        progress: target.progress || 0,
        status: target.status,
        period: target.period,
        assignedTo: target.assignee ? {
          id: target.assignee.id,
          name: target.assignee.name
        } : undefined,
        startDate: target.startDate,
        endDate: target.endDate
      }))

      return NextResponse.json(transformedTargets)
    } catch (dbError) {
      console.warn('Database error fetching targets:', dbError)
      // Return empty data on database error
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error fetching targets:', error)
    // Return empty data on error
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      type = TargetType.REVENUE,
      targetValue,
      period = TargetPeriod.MONTHLY,
      startDate,
      endDate,
      assignedTo,
      assignedType = AssignedType.USER,
      branchId,
      metadata
    } = body

    // Validate required fields
    if (!name || !targetValue || !startDate || !endDate || !assignedTo) {
      return NextResponse.json(
        { error: 'Name, target value, start date, end date, and assignee are required' },
        { status: 400 }
      )
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    const target = await db.salesTarget.create({
      data: {
        name,
        description,
        type,
        targetValue,
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        assignedTo,
        assignedType,
        branchId,
        metadata,
        status: TargetStatus.ACTIVE
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json(target, { status: 201 })
  } catch (error) {
    console.error('Error creating target:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}