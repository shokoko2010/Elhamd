import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

interface RouteContext {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = params?.id

    if (!id) {
      return NextResponse.json({ error: 'Leave request ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { reason } = body

    const leaveRequest = await db.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedReason: reason || null
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error('Error rejecting leave request:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}