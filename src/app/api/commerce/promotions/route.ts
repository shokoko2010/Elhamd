interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await requireUnifiedAuth(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to access promotions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const active = searchParams.get('active')
    const type = searchParams.get('type')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (active !== null) {
      where.active = active === 'true'
    }
    
    if (type) {
      where.type = type
    }

    // Get promotions with pagination
    const [promotions, total] = await Promise.all([
      db.promotion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.promotion.count({ where })
    ])

    return NextResponse.json({
      promotions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireUnifiedAuth(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create promotions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      value,
      code,
      startDate,
      endDate,
      usageLimit,
      active = true
    } = body

    // Validate required fields
    if (!title || !description || !type || value === undefined || !code || !startDate || !endDate || !usageLimit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if code already exists
    const existingPromotion = await db.promotion.findUnique({
      where: { code }
    })

    if (existingPromotion) {
      return NextResponse.json({ error: 'Promotion code already exists' }, { status: 400 })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    // Create promotion
    const promotion = await db.promotion.create({
      data: {
        title,
        description,
        type,
        value: parseFloat(value),
        code: code.toUpperCase(),
        startDate: start,
        endDate: end,
        usageLimit: parseInt(usageLimit),
        usedCount: 0,
        active,
        createdBy: session.user.id
      }
    })

    return NextResponse.json(promotion)
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 })
  }
}