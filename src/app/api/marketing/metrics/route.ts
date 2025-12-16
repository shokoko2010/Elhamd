
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CampaignStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // 1. Aggregate Campaign Stats
    const totalCampaigns = await db.campaign.count()
    const activeCampaigns = await db.campaign.count({
      where: { status: CampaignStatus.RUNNING }
    })

    const campaignStats = await db.campaign.aggregate({
      _sum: {
        sentCount: true,
        openedCount: true,
        clickedCount: true,
        convertedCount: true,
        budget: true
      }
    })

    const totalMessages = campaignStats._sum.sentCount || 0
    const totalOpened = campaignStats._sum.openedCount || 0
    const totalClicked = campaignStats._sum.clickedCount || 0
    const totalConverted = campaignStats._sum.convertedCount || 0
    const totalBudget = campaignStats._sum.budget || 0

    // 2. Calculate Rates
    const openRate = totalMessages > 0 ? (totalOpened / totalMessages) * 100 : 0
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0
    const conversionRate = totalClicked > 0 ? (totalConverted / totalClicked) * 100 : 0

    // 3. Simple ROI Calculation (Assumption: 1 Conversion = Fixed Revenue, e.g., 5000 EGP)
    // In a real app, this would come from joined transaction data
    const ESTIMATED_REVENUE_PER_CONVERSION = 5000
    const totalRevenue = totalConverted * ESTIMATED_REVENUE_PER_CONVERSION

    const roi = totalBudget > 0
      ? ((totalRevenue - totalBudget) / totalBudget) * 100
      : 0

    return NextResponse.json({
      totalCampaigns,
      activeCampaigns,
      totalMessages,
      openRate,
      clickRate,
      conversionRate,
      roi
    })

  } catch (error) {
    console.error('Error fetching marketing metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketing metrics' },
      { status: 500 }
    )
  }
}