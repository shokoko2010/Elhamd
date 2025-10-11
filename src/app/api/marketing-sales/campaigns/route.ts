interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'
import { CampaignType, CampaignStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const branchId = searchParams.get('branchId')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) where.status = status
    if (type) where.type = type
    if (branchId) where.branchId = branchId

    const [campaigns, total] = await Promise.all([
      db.marketingCampaign.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          approver: {
            select: {
              id: true,
              name: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          _count: {
            select: {
              members: true,
              leads: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.marketingCampaign.count({ where })
    ])

    // Transform campaigns to include counts
    const transformedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      membersCount: campaign._count.members,
      leadsCount: campaign._count.leads
    }))

    return NextResponse.json({
      campaigns: transformedCampaigns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      type = CampaignType.EMAIL,
      category,
      status = CampaignStatus.DRAFT,
      startDate,
      endDate,
      budget,
      targetAudience,
      content,
      channels,
      goals,
      branchId,
      tags,
      attachments
    } = body

    // Validate required fields
    if (!name || !startDate) {
      return NextResponse.json(
        { error: 'Name and start date are required' },
        { status: 400 }
      )
    }

    const campaign = await db.marketingCampaign.create({
      data: {
        name,
        description,
        type,
        category,
        status,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        budget,
        targetAudience,
        content,
        channels,
        goals,
        branchId,
        tags,
        attachments,
        createdBy: session.session.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            members: true,
            leads: true
          }
        }
      }
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}