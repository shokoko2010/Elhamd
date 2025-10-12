interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await requireStaffRole()

    // Fetch real tasks from the database
    const tasks = await db.task.findMany({
      where: {
        OR: [
          { assignedToId: session.user.id },
          { createdById: session.user.id }
        ]
      },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        createdBy: {
          select: {
            name: true
          }
        },
        customer: {
          select: {
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
            timeSlot: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    })

    // Format tasks for the frontend
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate.toISOString(),
      assignedBy: task.createdBy?.name || 'System',
      customer: task.customer ? {
        name: task.customer.name,
        email: task.customer.email,
        phone: task.customer.phone
      } : undefined,
      booking: task.booking ? {
        id: task.booking.id,
        type: task.booking.type,
        date: task.booking.date.toISOString(),
        timeSlot: task.booking.timeSlot
      } : undefined
    }))

    return NextResponse.json(formattedTasks)
  } catch (error) {
    console.error('Error fetching employee tasks:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (error.message.includes('Access denied')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}