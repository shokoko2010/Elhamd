interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const [totalEvents, todayEvents, upcomingEvents, completedEvents, meetingsScheduled, appointmentsScheduled] = await Promise.all([
      db.calendarEvent.count(),
      db.calendarEvent.count({
        where: {
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      db.calendarEvent.count({
        where: {
          startTime: {
            gte: today,
            lte: nextWeek
          },
          status: 'SCHEDULED'
        }
      }),
      db.calendarEvent.count({
        where: {
          status: 'COMPLETED'
        }
      }),
      db.calendarEvent.count({
        where: {
          type: 'MEETING',
          status: 'SCHEDULED'
        }
      }),
      db.calendarEvent.count({
        where: {
          type: 'APPOINTMENT',
          status: 'SCHEDULED'
        }
      })
    ])

    // Find conflicts (overlapping events)
    const events = await db.calendarEvent.findMany({
      where: {
        status: 'SCHEDULED'
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    let conflicts = 0
    for (let i = 0; i < events.length - 1; i++) {
      const currentEvent = events[i]
      const nextEvent = events[i + 1]
      
      if (new Date(currentEvent.endTime) > new Date(nextEvent.startTime)) {
        conflicts++
      }
    }

    return NextResponse.json({
      totalEvents,
      todayEvents,
      upcomingEvents,
      completedEvents,
      meetingsScheduled,
      appointmentsScheduled,
      conflicts
    })
  } catch (error) {
    console.error('Error fetching calendar stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar stats' },
      { status: 500 }
    )
  }
}