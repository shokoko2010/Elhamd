interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'
import { ComplaintCategory, ComplaintSeverity, ComplaintStatus, ComplaintSource } from '@prisma/client'

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
    const severity = searchParams.get('severity')
    const category = searchParams.get('category')
    const assignedTo = searchParams.get('assignedTo')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) where.status = status
    if (severity) where.severity = severity
    if (category) where.category = category
    if (assignedTo) where.assignedTo = assignedTo

    const [complaints, total] = await Promise.all([
      db.complaint.findMany({
        where,
        // include: { // No relations in Complaint model
    //   customer: {
    //     select: {
    //       id: true,
    //       name: true,
    //       email: true,
    //       phone: true
    //     }
    //   },
    //   assignee: {
    //     select: {
    //       id: true,
    //       name: true,
    //       email: true
    //     }
    //   },
    //   assigner: {
    //     select: {
    //       id: true,
    //       name: true
    //     }
    //   },
    //   resolver: {
    //     select: {
    //       id: true,
    //       name: true
    //     }
    //   },
    //   branch: {
    //     select: {
    //       id: true,
    //       name: true,
    //       code: true
    //     }
    //   }
    // },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.complaint.count({ where })
    ])

    return NextResponse.json({
      complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching complaints:', error)
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

    // TODO: Implement POST function properly
    return NextResponse.json({ error: 'Function temporarily disabled' }, { status: 503 })

  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}