import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'
import { CalendarEventType, EventStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type') as CalendarEventType | null
    const employeeId = searchParams.get('employeeId')

    const where: any = {
      startTime: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined
      }
    }

    if (type) where.type = type
    if (employeeId) {
      // Filter events where the employee is an attendee
      where.attendees = {
        path: ['*'],
        array_contains: employeeId
      }
    }

    const events = await db.calendarEvent.findMany({
      where,
      include: {
        booking: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            vehicle: {
              select: {
                make: true,
                model: true,
                year: true
              }
            },
            serviceType: {
              select: {
                name: true,
                category: true
              }
            }
          }
        },
        task: {
          include: {
            assignee: {
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
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
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

    const body = await request.json()
    const {
      title,
      description,
      startTime,
      endTime,
      type,
      location,
      attendees,
      bookingId,
      taskId,
      notes
    } = body

    // Validate required fields
    if (!title || !startTime || !endTime || !type) {
      return NextResponse.json(
        { error: 'Title, start time, end time, and type are required' },
        { status: 400 }
      )
    }

    // Validate time range
    if (new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
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

    // Check if task exists if provided
    if (taskId) {
      const task = await db.task.findUnique({
        where: { id: taskId }
      })

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        )
      }
    }

    const event = await db.calendarEvent.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type,
        location,
        attendees: attendees || [],
        bookingId,
        taskId,
        notes
      },
      include: {
        booking: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            vehicle: {
              select: {
                make: true,
                model: true,
                year: true
              }
            },
            serviceType: {
              select: {
                name: true,
                category: true
              }
            }
          }
        },
        task: {
          include: {
            assignee: {
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
            }
          }
        }
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}