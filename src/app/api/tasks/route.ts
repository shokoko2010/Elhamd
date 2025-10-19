interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { TaskPriority, TaskStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as TaskStatus | null
    const priority = searchParams.get('priority') as TaskPriority | null
    const assignedTo = searchParams.get('assignedTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}
    
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assignedTo) where.assignedTo = assignedTo

    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          assigner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          booking: {
            select: {
              id: true,
              type: true,
              date: true,
              timeSlot: true,
              status: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      db.task.count({ where })
    ])

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
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

    const body = await request.json()
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      customerId,
      bookingId,
      notes,
      estimatedHours,
      tags
    } = body

    // Validate required fields
    if (!title || !assignedTo) {
      return NextResponse.json(
        { error: 'Title and assignee are required' },
        { status: 400 }
      )
    }

    // Check if assignee exists
    const assignee = await db.user.findUnique({
      where: { id: assignedTo }
    })

    if (!assignee) {
      return NextResponse.json(
        { error: 'Assignee not found' },
        { status: 404 }
      )
    }

    // Check if customer exists if provided
    if (customerId) {
      const customer = await db.user.findUnique({
        where: { id: customerId }
      })

      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
    }

    // Check if booking exists if provided
    if (bookingId) {
      const booking = await db.booking.findUnique({
        where: { id: bookingId }
      })

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        priority: priority || TaskPriority.MEDIUM,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo,
        assignedBy: user.id,
        customerId,
        bookingId,
        notes,
        estimatedHours: estimatedHours || 0,
        tags: tags || []
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        assigner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        booking: {
          select: {
            id: true,
            type: true,
            date: true,
            timeSlot: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}