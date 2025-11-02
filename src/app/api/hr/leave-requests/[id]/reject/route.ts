import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Leave request ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { reason } = body

    const leaveRequest = await db.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedBy: user.id,
        rejectedAt: new Date(),
        rejectedReason: reason
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