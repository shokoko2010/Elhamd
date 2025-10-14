interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { CalendarService } from '@/lib/calendar-service'
import { z } from 'zod'

// Initialize calendar service
const calendarService = CalendarService.getInstance()

// Validation schema
const calendarSchema = z.object({
  view: z.enum(['month', 'week', 'day']).default('month'),
  currentDate: z.string().datetime().optional(),
  showHolidays: z.boolean().default(true),
  showBookings: z.boolean().default(true),
  showEvents: z.boolean().default(true),
  filterTypes: z.array(z.string()).default(['booking', 'holiday']),
  filterStatus: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireUnifiedAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to view calendar
    if (!['ADMIN', 'STAFF', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    
    // Parse and validate parameters
    const params = {
      view: searchParams.get('view') || 'month',
      currentDate: searchParams.get('currentDate'),
      showHolidays: searchParams.get('showHolidays') !== 'false',
      showBookings: searchParams.get('showBookings') !== 'false',
      showEvents: searchParams.get('showEvents') !== 'false',
      filterTypes: searchParams.get('filterTypes')?.split(',') || ['booking', 'holiday'],
      filterStatus: searchParams.get('filterStatus')?.split(',')
    }

    const validatedParams = calendarSchema.parse(params)
    
    const currentDate = validatedParams.currentDate 
      ? new Date(validatedParams.currentDate)
      : new Date()

    // Get calendar data
    const data = await calendarService.getCalendarData({
      view: validatedParams.view,
      currentDate,
      showHolidays: validatedParams.showHolidays,
      showBookings: validatedParams.showBookings,
      showEvents: validatedParams.showEvents,
      filterTypes: validatedParams.filterTypes,
      filterStatus: validatedParams.filterStatus
    })
    
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        view: validatedParams.view,
        currentDate: currentDate.toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching calendar data:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch calendar data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireUnifiedAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to manage calendar
    if (!['ADMIN', 'STAFF', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { action, date, timeSlotId, excludeBookingId } = body

    if (action === 'check-availability') {
      if (!date || !timeSlotId) {
        return NextResponse.json({ error: 'Date and timeSlotId are required' }, { status: 400 })
      }

      // Get time slot details
      const timeSlots = await calendarService['getTimeSlots']()
      const timeSlot = timeSlots.find(slot => slot.id === timeSlotId)
      
      if (!timeSlot) {
        return NextResponse.json({ error: 'Time slot not found' }, { status: 404 })
      }

      const availability = await calendarService.checkTimeSlotAvailability(
        new Date(date),
        timeSlot,
        excludeBookingId
      )

      return NextResponse.json({
        success: true,
        data: availability
      })
    }

    if (action === 'get-available-slots') {
      if (!date) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 })
      }

      const availableSlots = await calendarService.getAvailableTimeSlots(new Date(date))

      return NextResponse.json({
        success: true,
        data: availableSlots
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error processing calendar request:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    )
  }
}