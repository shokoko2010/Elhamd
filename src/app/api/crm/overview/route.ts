import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get total customers
    const totalCustomers = await db.user.count({
      where: {
        role: 'CUSTOMER',
        isActive: true
      }
    })

    // Get active leads (customers with LEAD or PROSPECT segment)
    const activeLeads = await db.customerProfile.count({
      where: {
        segment: {
          in: ['LEAD', 'PROSPECT']
        },
        user: {
          isActive: true
        }
      }
    })

    // Get conversion rate (simplified)
    const conversionRate = 25 // Placeholder value

    // Get average satisfaction score
    const feedbacks = await db.customerFeedback.findMany({
      where: {
        rating: {
          not: null
        }
      },
      select: {
        rating: true
      }
    })

    const averageSatisfaction = feedbacks.length > 0
      ? Math.round((feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length) * 10) / 10
      : 0

    // Get total interactions
    const totalInteractions = await db.customerInteraction.count({})

    // Get pending follow-ups
    const pendingFollowUps = 0 // Placeholder value

    const overview = {
      totalCustomers,
      activeLeads,
      conversionRate,
      averageSatisfaction,
      totalInteractions,
      pendingFollowUps
    }

    return NextResponse.json(overview)
  } catch (error) {
    console.error('Error fetching CRM overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CRM overview' },
      { status: 500 }
    )
  }
}