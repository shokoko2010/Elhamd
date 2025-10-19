interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { TicketCategory, TicketPriority, TicketStatus, TicketSource } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const assignedTo = searchParams.get('assignedTo')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) where.status = status
    if (priority) where.priority = priority
    if (category) where.category = category
    if (assignedTo) where.assignedTo = assignedTo

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
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
      db.supportTicket.count({ where })
    ])

    return NextResponse.json({
      tickets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerId,
      subject,
      description,
      category = TicketCategory.GENERAL,
      priority = TicketPriority.MEDIUM,
      source = TicketSource.WEB,
      branchId,
      tags,
      attachments
    } = body

    // Validate required fields
    if (!customerId || !subject || !description) {
      return NextResponse.json(
        { error: 'Customer ID, subject, and description are required' },
        { status: 400 }
      )
    }

    // Generate ticket number
    const ticketCount = await db.supportTicket.count()
    const ticketNumber = `TCK-${String(ticketCount + 1).padStart(6, '0')}`

    const ticket = await db.supportTicket.create({
      data: {
        ticketNumber,
        customerId,
        subject,
        description,
        category,
        priority,
        source,
        branchId,
        tags,
        attachments,
        assignedBy: user.id
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

    // Create timeline entry
    await db.ticketTimeline.create({
      data: {
        ticketId: ticket.id,
        action: 'CREATED',
        description: 'تم إنشاء التذكرة',
        performedBy: user.id,
        metadata: {
          ticketNumber: ticket.ticketNumber,
          priority: ticket.priority,
          category: ticket.category
        }
      }
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}