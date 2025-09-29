interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getUnifiedUser, createAuthHandler, UserRole } from '@/lib/unified-auth'

const authHandler = createAuthHandler([UserRole.ADMIN, UserRole.SUPER_ADMIN])

export async function GET(request: NextRequest) {
  const auth = await authHandler(request)
  if (auth.error) return auth.error
  
  try {

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Mock notification logs data
    const mockLogs: any[] = [
      {
        id: '1',
        templateId: '1',
        templateName: 'تأكيد الحجز',
        recipient: 'customer@example.com',
        type: 'email',
        status: 'delivered',
        channel: 'email',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        deliveredAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        openedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        metadata: { bookingId: '123' }
      },
      {
        id: '2',
        templateId: '2',
        templateName: 'تذكير الصيانة',
        recipient: '+201234567890',
        type: 'sms',
        status: 'sent',
        channel: 'sms',
        sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        metadata: { customerId: '456' }
      },
      {
        id: '3',
        templateId: '3',
        templateName: 'عرض خاص',
        recipient: 'user@example.com',
        type: 'email',
        status: 'failed',
        channel: 'email',
        sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        errorMessage: 'Invalid email address',
        metadata: { campaignId: '789' }
      },
      {
        id: '4',
        templateId: '4',
        templateName: 'تحديث الحالة',
        recipient: 'customer2@example.com',
        type: 'email',
        status: 'opened',
        channel: 'email',
        sentAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        deliveredAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        openedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        clickedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        metadata: { orderId: '101' }
      },
      {
        id: '5',
        templateId: '5',
        templateName: 'إشعار داخل التطبيق',
        recipient: 'user123',
        type: 'in_app',
        status: 'delivered',
        channel: 'in_app',
        sentAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        metadata: { userId: '123' }
      }
    ]

    // Add more mock data
    for (let i = 6; i <= 50; i++) {
      const types = ['email', 'sms', 'push', 'in_app']
      const statuses = ['pending', 'sent', 'delivered', 'failed', 'opened', 'clicked']
      const templateNames = ['تأكيد الحجز', 'تذكير الصيانة', 'عرض خاص', 'تحديث الحالة', 'إشعار داخل التطبيق']
      
      mockLogs.push({
        id: i.toString(),
        templateId: i.toString(),
        templateName: templateNames[Math.floor(Math.random() * templateNames.length)],
        recipient: Math.random() > 0.5 ? `customer${i}@example.com` : `+2012${Math.floor(Math.random() * 100000000)}`,
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        channel: types[Math.floor(Math.random() * types.length)],
        sentAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        ...(Math.random() > 0.7 && { deliveredAt: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString() }),
        ...(Math.random() > 0.8 && { openedAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString() }),
        ...(Math.random() > 0.9 && { clickedAt: new Date(Date.now() - Math.random() * 3 * 60 * 60 * 1000).toISOString() }),
        ...(Math.random() > 0.95 && { errorMessage: 'Network error' }),
        metadata: { id: i }
      })
    }

    // Filter logs
    let filteredLogs = mockLogs
    if (type && type !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.type === type)
    }
    if (status && status !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.status === status)
    }

    // Sort by sentAt (newest first)
    filteredLogs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

    // Pagination
    const offset = (page - 1) * limit
    const paginatedLogs = filteredLogs.slice(offset, offset + limit)

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