interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface MarketingMetrics {
  totalCampaigns: number
  activeCampaigns: number
  totalMessages: number
  openRate: number
  clickRate: number
  conversionRate: number
  roi: number
}

export async function GET(request: NextRequest) {
  try {
    // Fetch campaigns from database to calculate real metrics
    const campaigns = await db.campaign.findMany()
    
    // Calculate metrics from actual data
    const totalCampaigns = campaigns.length
    const activeCampaigns = campaigns.filter(c => 
      c.status === 'ACTIVE' || c.status === 'SCHEDULED'
    ).length
    
    const totalMessages = campaigns.reduce((sum, c) => sum + c.sentCount, 0)
    const totalOpened = campaigns.reduce((sum, c) => sum + c.openedCount, 0)
    const totalClicked = campaigns.reduce((sum, c) => sum + c.clickedCount, 0)
    const totalConverted = campaigns.reduce((sum, c) => sum + c.convertedCount, 0)
    
    // Calculate rates
    const openRate = totalMessages > 0 ? (totalOpened / totalMessages) * 100 : 0
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0
    const conversionRate = totalClicked > 0 ? (totalConverted / totalClicked) * 100 : 0
    
    // Calculate ROI (simplified - would need actual revenue data in real system)
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
    const estimatedRevenue = totalConverted * 1000 // Assume $1000 per conversion
    const roi = totalBudget > 0 ? ((estimatedRevenue - totalBudget) / totalBudget) * 100 : 0

    const metrics: MarketingMetrics = {
      totalCampaigns,
      activeCampaigns,
      totalMessages,
      openRate: Math.round(openRate * 10) / 10,
      clickRate: Math.round(clickRate * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
      roi: Math.round(roi * 10) / 10
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching marketing metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketing metrics' },
      { status: 500 }
    )
  }
}