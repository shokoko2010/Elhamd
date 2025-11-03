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
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (type) where.type = type
    if (isActive !== null) where.isActive = isActive === 'true'

    const taxRates = await prisma.taxRate.findMany({
      where,
      orderBy: [
        { effectiveDate: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(taxRates)
  } catch (error) {
    console.error('Error fetching tax rates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tax rates' },
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
      rate,
      type,
      description,
      isActive = true,
      effectiveDate
    } = body

    // Validate required fields
    if (!name || rate === undefined || !type || !effectiveDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, rate, type, effectiveDate' },
        { status: 400 }
      )
    }

    // Validate rate
    if (rate < 0 || rate > 100) {
      return NextResponse.json(
        { error: 'Rate must be between 0 and 100' },
        { status: 400 }
      )
    }

    const taxRate = await prisma.taxRate.create({
      data: {
        name,
        rate,
        type,
        description,
        isActive,
        effectiveDate: new Date(effectiveDate)
      }
    })

    return NextResponse.json(taxRate, { status: 201 })
  } catch (error) {
    console.error('Error creating tax rate:', error)
    return NextResponse.json(
      { error: 'Failed to create tax rate' },
      { status: 500 }
    )
  }
}