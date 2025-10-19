interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { EvaluationStatus } from '@prisma/client'

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
    const serviceType = searchParams.get('serviceType')
    const customerId = searchParams.get('customerId')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) where.status = status
    if (serviceType) where.serviceType = serviceType
    if (customerId) where.customerId = customerId

    const [evaluations, total] = await Promise.all([
      db.serviceEvaluation.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reviewer: {
            select: {
              id: true,
              name: true
            }
          }
        },
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
    const user = await getAuthUser()
    
    if (!user) {
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
      wouldRecommend,
      feedback,
      tags,
      attachments,
      isPublic = false
    } = body

    // Validate required fields
    if (!customerId || !serviceType || overallRating === undefined) {
      return NextResponse.json(
        { error: 'Customer ID, service type, and overall rating are required' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (overallRating < 1 || overallRating > 5) {
      return NextResponse.json(
        { error: 'Overall rating must be between 1 and 5' },
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
        wouldRecommend,
        feedback,
        tags,
        attachments,
        isPublic,
        status: EvaluationStatus.PENDING
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true
          }
        }
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