import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const source = searchParams.get('source')
    const assignedTo = searchParams.get('assignedTo')
    const branchId = searchParams.get('branchId')

    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (source) where.source = source
    if (assignedTo) where.assignedToId = assignedTo
    if (branchId) where.branchId = branchId

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        opportunities: {
          select: {
            id: true,
            name: true,
            stage: true,
            amount: true,
            probability: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      company,
      position,
      source,
      status = 'NEW',
      priority = 'MEDIUM',
      estimatedValue,
      assignedToId,
      branchId,
      notes,
      tags,
      expectedCloseDate
    } = body

    // Validate required fields
    if (!name || !email || !phone || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, phone, source' },
        { status: 400 }
      )
    }

    // Check if lead already exists
    const existingLead = await prisma.lead.findFirst({
      where: {
        email,
        source
      }
    })

    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead with this email and source already exists' },
        { status: 409 }
      )
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        position,
        source,
        status,
        priority,
        estimatedValue,
        assignedToId,
        branchId,
        notes,
        tags,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
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

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}