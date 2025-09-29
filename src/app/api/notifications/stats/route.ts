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

    // Mock notification statistics
    const stats = {
      totalSent: 15420,
      delivered: 14230,
      opened: 8930,
      clicked: 2340,
      failed: 1190,
      byType: {
        email: {
          sent: 8920,
          delivered: 8340,
          opened: 6230,
          clicked: 1890
        },
        sms: {
          sent: 3450,
          delivered: 3320,
          opened: 0,
          clicked: 0
        },
        push: {
          sent: 2100,
          delivered: 1980,
          opened: 1560,
          clicked: 340
        },
        in_app: {
          sent: 950,
          delivered: 590,
          opened: 1140,
          clicked: 110
        }
      },
      byCategory: {
        'BOOKING': 5420,
        'MARKETING': 3890,
        'SERVICE': 3210,
        'PROMOTION': 1890,
        'REMINDER': 1010
      },
      recentActivity: [
        { date: '2024-01-01', sent: 120, delivered: 115, opened: 89 },
        { date: '2024-01-02', sent: 135, delivered: 128, opened: 95 },
        { date: '2024-01-03', sent: 142, delivered: 134, opened: 102 },
        { date: '2024-01-04', sent: 158, delivered: 149, opened: 118 },
        { date: '2024-01-05', sent: 167, delivered: 156, opened: 125 },
        { date: '2024-01-06', sent: 189, delivered: 178, opened: 142 },
        { date: '2024-01-07', sent: 201, delivered: 189, opened: 156 }
      ]
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching notification stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}