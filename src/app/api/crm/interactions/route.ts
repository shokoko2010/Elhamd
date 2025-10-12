interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const customerId = searchParams.get('customerId')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (customerId) {
      where.customerId = customerId
    }
    
    if (type) {
      where.type = type
    }
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get interactions with pagination
    const [interactions, total] = await Promise.all([
      (db.customerInteraction as any).findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        } as any,
        skip,
        take: limit
      }),
      db.customerInteraction.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    // Transform interaction data
    const transformedInteractions = interactions.map(interaction => ({
      id: interaction.id,
      customerId: interaction.customerId,
      customerName: interaction.customer.name || interaction.customer.email,
      type: interaction.type,
      title: interaction.title,
      description: interaction.description,
      date: interaction.date.toISOString(),
      outcome: interaction.outcome,
      priority: interaction.priority,
      duration: interaction.duration,
      nextAction: interaction.nextAction,
      nextActionDate: interaction.nextActionDate
    }))

    return NextResponse.json({
      interactions: transformedInteractions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching interactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customerId,
      type,
      title,
      description,
      direction = 'OUTBOUND',
      duration,
      outcome,
      nextAction,
      nextActionDate,
      priority = 'MEDIUM',
      tags,
      attachments
    } = body

    // Validate required fields
    if (!customerId || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, type, title' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const customer = await db.customerProfile.findUnique({
      where: { userId: customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Create interaction
    const interaction = await (db.customerInteraction as any).create({
      data: {
        customerId: customer.id,
        type,
        title,
        description,
        direction,
        duration,
        outcome,
        nextAction,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
        priority,
        tags,
        attachments,
        followUpRequired: !!nextAction
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    })

    // Update customer's last contact date
    await db.customerProfile.update({
      where: { id: customer.id },
      data: {
        lastContactDate: new Date()
      }
    })

    return NextResponse.json(interaction, { status: 201 })
  } catch (error) {
    console.error('Error creating interaction:', error)
    return NextResponse.json(
      { error: 'Failed to create interaction' },
      { status: 500 }
    )
  }
}