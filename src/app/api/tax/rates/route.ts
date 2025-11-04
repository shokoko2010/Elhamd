import { NextRequest, NextResponse } from 'next/server'
import { Prisma, TaxRateType } from '@prisma/client'

import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

function parseTaxRateType(value: string | null): TaxRateType | undefined {
  if (!value) return undefined
  const normalized = value.toUpperCase() as TaxRateType
  return (Object.values(TaxRateType) as string[]).includes(normalized)
    ? normalized
    : undefined
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const typeParam = parseTaxRateType(searchParams.get('type'))
    const isActiveParam = searchParams.get('isActive')

    const where: Prisma.TaxRateWhereInput = {}
    if (typeParam) {
      where.type = typeParam
    }
    if (isActiveParam !== null) {
      where.isActive = isActiveParam === 'true'
    }

    const rates = await db.taxRate.findMany({
      where,
      orderBy: [
        { effectiveFrom: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ rates })
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
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      rate,
      type,
      description,
      isActive = true,
      effectiveFrom,
      effectiveTo
    } = body

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (typeof rate !== 'number' || Number.isNaN(rate)) {
      return NextResponse.json({ error: 'Rate must be a number' }, { status: 400 })
    }

    if (rate < 0 || rate > 100) {
      return NextResponse.json({ error: 'Rate must be between 0 and 100' }, { status: 400 })
    }

    const parsedType = parseTaxRateType(type) || TaxRateType.STANDARD

    if (!effectiveFrom) {
      return NextResponse.json({ error: 'effectiveFrom is required' }, { status: 400 })
    }

    const data: Prisma.TaxRateCreateInput = {
      name: name.trim(),
      rate,
      type: parsedType,
      description,
      isActive: Boolean(isActive),
      effectiveFrom: new Date(effectiveFrom)
    }

    if (effectiveTo) {
      data.effectiveTo = new Date(effectiveTo)
    }

    const createdRate = await db.taxRate.create({ data })

    return NextResponse.json({ rate: createdRate }, { status: 201 })
  } catch (error) {
    console.error('Error creating tax rate:', error)
    return NextResponse.json(
      { error: 'Failed to create tax rate' },
      { status: 500 }
    )
  }
}