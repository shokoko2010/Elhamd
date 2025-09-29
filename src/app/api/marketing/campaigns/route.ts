interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Campaign, CampaignType, CampaignStatus } from '@prisma/client'

interface CampaignWithDetails extends Campaign {
  targetAudience?: any
  opened: number
  clicked: number
  converted: number
}

export async function GET(request: NextRequest) {
  try {
    // Fetch campaigns from database
    const campaigns = await db.campaign.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        template: true
      }
    })

    // Transform database campaigns to match the expected interface
    const transformedCampaigns: CampaignWithDetails[] = campaigns.map(campaign => ({
      ...campaign,
      opened: campaign.openedCount,
      clicked: campaign.clickedCount,
      converted: campaign.convertedCount,
      targetAudience: campaign.targetAudience ? JSON.parse(campaign.targetAudience as string) : undefined
    }))

    return NextResponse.json({ campaigns: transformedCampaigns })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, targetAudience, message, scheduledDate, budget } = body

    // Create new campaign in database
    const newCampaign = await db.campaign.create({
      data: {
        name,
        type: type as CampaignType,
        status: CampaignStatus.DRAFT,
        targetAudience: targetAudience ? JSON.stringify(targetAudience) : null,
        budget: budget ? parseFloat(budget) : null,
        startDate: scheduledDate ? new Date(scheduledDate) : null,
        createdBy: 'system', // In real app, get from authenticated user
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        convertedCount: 0
      }
    })

    // Transform to match expected interface
    const transformedCampaign: CampaignWithDetails = {
      ...newCampaign,
      opened: newCampaign.openedCount,
      clicked: newCampaign.clickedCount,
      converted: newCampaign.convertedCount,
      targetAudience: newCampaign.targetAudience ? JSON.parse(newCampaign.targetAudience as string) : undefined
    }

    return NextResponse.json({
      success: true,
      campaign: transformedCampaign,
      message: 'Campaign created successfully'
    })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}