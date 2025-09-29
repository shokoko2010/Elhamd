interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'
import { TaskStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, taskIds } = body

    if (!action || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and taskIds are required' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'complete':
        updateData = {
          status: TaskStatus.COMPLETED,
          completedAt: new Date()
        }
        break
      case 'start':
        updateData = {
          status: TaskStatus.IN_PROGRESS
        }
        break
      case 'cancel':
        updateData = {
          status: TaskStatus.CANCELLED
        }
        break
      case 'reset':
        updateData = {
          status: TaskStatus.PENDING,
          completedAt: null
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedTasks = await db.task.updateMany({
      where: {
        id: {
          in: taskIds
        }
      },
      data: updateData
    })

    return NextResponse.json({
      message: `Successfully updated ${updatedTasks.count} tasks`,
      updatedCount: updatedTasks.count
    })
  } catch (error) {
    console.error('Error performing bulk action:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}