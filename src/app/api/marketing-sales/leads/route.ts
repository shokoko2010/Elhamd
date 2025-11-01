interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { LeadSource, LeadStatus, LeadPriority } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // For development, skip authentication temporarily
    // const user = await getAuthUser()
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const source = searchParams.get('source')
    const assignedTo = searchParams.get('assignedTo')
    const stats = searchParams.get('stats') === 'true'

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) where.status = status
    if (priority) where.priority = priority
    if (source) where.source = source
    if (assignedTo) where.assignedTo = assignedTo

    try {
      const [leads, total] = await Promise.all([
        db.lead.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            campaign: {
              select: {
                id: true,
                name: true
              }
            },
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            assigner: {
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
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        db.lead.count({ where })
      ])

      // Transform the data to match the expected format
      const transformedLeads = leads.map(lead => ({
        id: lead.id,
        leadNumber: lead.leadNumber,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        source: lead.source,
        status: lead.status,
        priority: lead.priority,
        estimatedValue: lead.estimatedValue,
        assignedTo: lead.assignee ? {
          id: lead.assignee.id,
          name: lead.assignee.name
        } : undefined,
        createdAt: lead.createdAt
      }))

      if (stats) {
        // Return just the leads array for stats endpoint
        return NextResponse.json(transformedLeads)
      }

      return NextResponse.json({
        leads: transformedLeads,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      })
    } catch (dbError) {
      console.warn('Database error fetching leads:', dbError)
      // Return empty data on database error
      if (stats) {
        return NextResponse.json([])
      }
      return NextResponse.json({
        leads: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      })
    }
  } catch (error) {
    console.error('Error fetching leads:', error)
    // Return empty data on error
    const { searchParams } = new URL(request.url)
    const stats = searchParams.get('stats') === 'true'
    
    if (stats) {
      return NextResponse.json([])
    }
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    return NextResponse.json({
      leads: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    // For development, skip authentication temporarily
    // const user = await getAuthUser()
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const {
      customerId,
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      source = LeadSource.WEBSITE,
      campaignId,
      status = LeadStatus.NEW,
      priority = LeadPriority.MEDIUM,
      estimatedValue,
      assignedTo,
      branchId,
      tags,
      notes,
      customFields
    } = body

    // Validate required fields
    if (!firstName) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      )
    }

    // Generate lead number
    const leadCount = await db.lead.count()
    const leadNumber = `LD-${String(leadCount + 1).padStart(6, '0')}`

    const lead = await db.lead.create({
      data: {
        leadNumber,
        customerId,
        firstName,
        lastName,
        email,
        phone,
        company,
        position,
        source,
        campaignId,
        status,
        priority,
        estimatedValue,
        assignedTo,
        assignedBy: user.id,
        assignedAt: assignedTo ? new Date() : null,
        branchId,
        tags,
        notes,
        customFields
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        campaign: {
          select: {
            id: true,
            name: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assigner: {
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
        }
      }
    })

    // Create activity log
    await db.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'NOTE',
        title: 'تم إنشاء العميل المحتمل',
        description: `تم إنشاء العميل المحتمال ${lead.firstName} ${lead.lastName || ''}`,
        performedBy: user.id,
        metadata: {
          leadNumber: lead.leadNumber,
          source: lead.source,
          priority: lead.priority
        }
      }
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}