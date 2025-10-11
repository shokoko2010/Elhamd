interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assignedTo = searchParams.get('assignedTo')

    const where: any = {}
    if (assignedTo) where.assignedTo = assignedTo

    const [totalTasks, completedTasks, inProgressTasks, overdueTasks, highPriorityTasks] = await Promise.all([
      db.task.count({ where }),
      db.task.count({ 
        where: { 
          ...where,
          status: 'COMPLETED'
        }
      }),
      db.task.count({ 
        where: { 
          ...where,
          status: 'IN_PROGRESS'
        }
      }),
      db.task.count({ 
        where: { 
          ...where,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        }
      }),
      db.task.count({ 
        where: { 
          ...where,
          priority: 'URGENT'
        }
      })
    ])

    // Calculate average completion time
    const completedTasksWithTime = await db.task.findMany({
      where: {
        ...where,
        status: 'COMPLETED',
        completedAt: { not: null }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    })

    const avgCompletionTime = completedTasksWithTime.length > 0
      ? completedTasksWithTime.reduce((acc, task) => {
          const completionTime = task.completedAt!.getTime() - task.createdAt.getTime()
          return acc + completionTime
        }, 0) / completedTasksWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0

    const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return NextResponse.json({
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      overdue: overdueTasks,
      highPriority: highPriorityTasks,
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
      productivity
    })
  } catch (error) {
    console.error('Error fetching task stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task stats' },
      { status: 500 }
    )
  }
}