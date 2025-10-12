import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

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
    const serviceType = searchParams.get('serviceType')

    const where: any = {}
    if (status) where.status = status
    if (serviceType) where.serviceType = serviceType

    const skip = (page - 1) * limit

    const [evaluations, total] = await Promise.all([
      db.serviceEvaluation.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.serviceEvaluation.count({ where })
    ])

    return NextResponse.json({
      evaluations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching evaluations:', error)
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
      customerId,
      serviceType,
      serviceId,
      overallRating,
      qualityRating,
      speedRating,
      staffRating,
      valueRating,
      recommendations,
      attachments,
      isPublic
    } = body

    if (!customerId || !serviceType || !overallRating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const evaluation = await db.serviceEvaluation.create({
      data: {
        customerId,
        serviceType,
        serviceId,
        overallRating,
        qualityRating,
        speedRating,
        staffRating,
        valueRating,
        recommendations,
        attachments,
        isPublic,
        status: 'PENDING'
      }
    })

    return NextResponse.json(evaluation, { status: 201 })
  } catch (error) {
    console.error('Error creating evaluation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}