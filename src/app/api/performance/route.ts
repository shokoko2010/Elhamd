interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'
import { PerformancePeriod } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId') || session.session.user.id
    const period = searchParams.get('period') as PerformancePeriod || PerformancePeriod.MONTHLY
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {
      employeeId,
      period
    }

    if (startDate && endDate) {
      // For custom date ranges, we'll calculate metrics on the fly
      return await calculateCustomMetrics(employeeId, new Date(startDate), new Date(endDate))
    }

    const metrics = await db.performanceMetric.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: 12 // Get last 12 periods
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    )
  }
}

async function calculateCustomMetrics(employeeId: string, startDate: Date, endDate: Date) {
  try {
    // Get bookings handled by the employee in the date range
    const bookings = await db.booking.findMany({
      where: {
        customerId: employeeId, // This should be updated to track which employee handled the booking
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Get tasks completed by the employee
    const tasks = await db.task.findMany({
      where: {
        assignedTo: employeeId,
        status: 'completed',
        completedAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Calculate metrics
    const bookingsHandled = bookings.length
    const tasksCompleted = tasks.length
    
    // Calculate average handling time (mock data for now)
    const averageHandlingTime = bookings.length > 0 ? 45 : 0 // 45 minutes average
    
    // Calculate customer rating (mock data for now)
    const customerRating = bookings.length > 0 ? 4.5 : 0 // 4.5 stars average
    
    // Calculate conversion rate (mock data for now)
    const conversionRate = bookings.length > 0 ? 75 : 0 // 75% conversion rate
    
    // Calculate revenue generated (mock data for now)
    const revenueGenerated = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)
    
    // Calculate customer satisfaction (mock data for now)
    const customerSatisfaction = bookings.length > 0 ? 92 : 0 // 92% satisfaction rate

    const metrics = {
      employeeId,
      period: 'CUSTOM' as any,
      bookingsHandled,
      averageHandlingTime,
      customerRating,
      conversionRate,
      revenueGenerated,
      tasksCompleted,
      customerSatisfaction,
      notes: `Custom period: ${startDate.toDateString()} - ${endDate.toDateString()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json([metrics])
  } catch (error) {
    console.error('Error calculating custom metrics:', error)
    return NextResponse.json(
      { error: 'Failed to calculate performance metrics' },
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

    const body = await request.json()
    const {
      employeeId,
      period,
      bookingsHandled,
      averageHandlingTime,
      customerRating,
      conversionRate,
      revenueGenerated,
      tasksCompleted,
      customerSatisfaction,
      notes
    } = body

    // Validate required fields
    if (!employeeId || !period) {
      return NextResponse.json(
        { error: 'Employee ID and period are required' },
        { status: 400 }
      )
    }

    // Check if employee exists
    const employee = await db.session.user.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Check if metric already exists for this employee and period
    const existingMetric = await db.performanceMetric.findUnique({
      where: {
        employeeId_period: {
          employeeId,
          period
        }
      }
    })

    let metric
    if (existingMetric) {
      // Update existing metric
      metric = await db.performanceMetric.update({
        where: {
          employeeId_period: {
            employeeId,
            period
          }
        },
        data: {
          bookingsHandled,
          averageHandlingTime,
          customerRating,
          conversionRate,
          revenueGenerated,
          tasksCompleted,
          customerSatisfaction,
          notes
        }
      })
    } else {
      // Create new metric
      metric = await db.performanceMetric.create({
        data: {
          employeeId,
          period,
          bookingsHandled,
          averageHandlingTime,
          customerRating,
          conversionRate,
          revenueGenerated,
          tasksCompleted,
          customerSatisfaction,
          notes
        }
      })
    }

    return NextResponse.json(metric, { status: 201 })
  } catch (error) {
    console.error('Error creating performance metric:', error)
    return NextResponse.json(
      { error: 'Failed to create performance metric' },
      { status: 500 }
    )
  }
}