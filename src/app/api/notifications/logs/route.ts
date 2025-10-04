import { NextRequest, NextResponse } from 'next/server'
import { authorize, UserRole } from '@/lib/unified-auth'
import { db } from '@/lib/db'

const authHandler = async (request: NextRequest) => {
  return await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })
}

export async function GET(request: NextRequest) {
  const auth = await authHandler(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Fetch real notification logs from database
    const logs = await db.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit * page,
      include: {
        template: {
          select: {
            name: true
          }
        }
      }
    })

    // Filter logs
    let filteredLogs = logs
    if (type && type !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.type === type)
    }
    if (status && status !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.status === status)
    }

    // Transform data to match expected format
    const transformedLogs = filteredLogs.map(log => ({
      id: log.id,
      templateId: log.templateId,
      templateName: log.template?.name || 'Unknown',
      recipient: log.recipient,
      type: log.type,
      status: log.status,
      channel: log.channel,
      sentAt: log.sentAt,
      deliveredAt: log.deliveredAt,
      openedAt: log.openedAt,
      clickedAt: log.clickedAt,
      errorMessage: log.errorMessage,
      metadata: log.metadata || {}
    }))

    // Pagination
    const offset = (page - 1) * limit
    const paginatedLogs = transformedLogs.slice(offset, offset + limit)

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total: filteredLogs.length,
        pages: Math.ceil(filteredLogs.length / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching notification logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}