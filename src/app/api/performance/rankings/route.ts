interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'MONTHLY'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get all employees with performance metrics
    const employees = await db.user.findMany({
      where: {
        role: {
          in: [UserRole.STAFF, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN]
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        performanceMetrics: {
          where: {
            period: period
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    // Calculate rankings
    const rankings = employees.map(employee => {
      const latestMetric = employee.performanceMetrics[0]
      
      return {
        id: employee.id,
        name: employee.name || 'Unknown',
        email: employee.email,
        avatar: employee.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}` : undefined,
        totalBookings: latestMetric?.bookingsHandled || 0,
        revenueGenerated: latestMetric?.revenueGenerated || 0,
        customerRating: latestMetric?.customerRating || 0,
        totalScore: (latestMetric?.bookingsHandled || 0) * 0.3 + 
                    (latestMetric?.revenueGenerated || 0) * 0.00001 + 
                    (latestMetric?.customerRating || 0) * 0.4 +
                    (latestMetric?.conversionRate || 0) * 0.3
      }
    })

    // Sort by total score and assign ranks
    rankings.sort((a, b) => b.totalScore - a.totalScore)
    
    const rankedEmployees = rankings.map((employee, index) => ({
      ...employee,
      rank: index + 1,
      change: Math.floor(Math.random() * 10) - 5 // Mock change data
    }))

    return NextResponse.json(rankedEmployees.slice(0, limit))
  } catch (error) {
    console.error('Error fetching performance rankings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance rankings' },
      { status: 500 }
    )
  }
}