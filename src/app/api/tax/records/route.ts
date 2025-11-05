import { NextRequest, NextResponse } from 'next/server'
import { Prisma, TaxStatus, TaxType } from '@prisma/client'

import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const type = searchParams.get('type') as TaxType | null
    const status = searchParams.get('status') as TaxStatus | null
    const branchId = searchParams.get('branchId')
    const period = searchParams.get('period')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: Prisma.TaxRecordWhereInput = {}

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (branchId) {
      where.branchId = branchId
    }

    if (period) {
      where.period = { contains: period }
    }

    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { notes: { contains: search } }
      ]
    }

    const [taxRecords, total] = await Promise.all([
      db.taxRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.taxRecord.count({ where })
    ])

    const userIds = Array.from(
      new Set(
        taxRecords
          .flatMap(record => [record.createdBy, record.approvedBy])
          .filter(Boolean) as string[]
      )
    )

    const branchIds = Array.from(
      new Set(
        taxRecords
          .map(record => record.branchId)
          .filter(Boolean) as string[]
      )
    )

    const [users, branches, stats] = await Promise.all([
      userIds.length
        ? db.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true }
          })
        : Promise.resolve([]),
      branchIds.length
        ? db.branch.findMany({
            where: { id: { in: branchIds } },
            select: { id: true, name: true, code: true }
          })
        : Promise.resolve([]),
      db.taxRecord.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { id: true },
        where
      })
    ])

    const userMap = new Map(users.map(user => [user.id, user]))
    const branchMap = new Map(branches.map(branch => [branch.id, branch]))

    const serializedRecords = taxRecords.map(record => ({
      ...record,
      creator:
        userMap.get(record.createdBy) ?? {
          id: record.createdBy,
          name: 'مستخدم غير معروف',
          email: ''
        },
      approver: record.approvedBy ? userMap.get(record.approvedBy) ?? null : null,
      branch: record.branchId ? branchMap.get(record.branchId) ?? null : null
    }))

    const totalAmount = stats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0)
    const pendingCount = stats.find(s => s.status === TaxStatus.PENDING)?._count.id || 0
    const paidCount = stats.find(s => s.status === TaxStatus.PAID)?._count.id || 0
    const overdueCount = stats.find(s => s.status === TaxStatus.OVERDUE)?._count.id || 0

    return NextResponse.json({
      taxRecords: serializedRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalAmount,
        pendingCount,
        paidCount,
        overdueCount,
        totalRecords: total
      }
    })
  } catch (error) {
    console.error('Error fetching tax records:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch tax records',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
      type,
      period,
      amount,
      dueDate,
      reference,
      documents,
      notes,
      branchId
    } = body

    if (!type || !period || amount === undefined || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const taxType = (type as TaxType) || TaxType.VAT
    const parsedAmount = Number(amount)

    if (Number.isNaN(parsedAmount)) {
      return NextResponse.json(
        { error: 'Amount must be a number' },
        { status: 400 }
      )
    }

    const createdRecord = await db.taxRecord.create({
      data: {
        type: taxType,
        period,
        amount: parsedAmount,
        dueDate: new Date(dueDate),
        reference,
        documents: documents ?? null,
        notes,
        branchId: branchId || user.branchId || null,
        createdBy: user.id
      }
    })

    const creator = await db.user.findUnique({
      where: { id: createdRecord.createdBy },
      select: { id: true, name: true, email: true }
    })

    const branch = createdRecord.branchId
      ? await db.branch.findUnique({
          where: { id: createdRecord.branchId },
          select: { id: true, name: true, code: true }
        })
      : null

    return NextResponse.json(
      {
        ...createdRecord,
        creator: creator ?? {
          id: createdRecord.createdBy,
          name: 'مستخدم غير معروف',
          email: ''
        },
        approver: null,
        branch
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating tax record:', error)
    return NextResponse.json(
      {
        error: 'Failed to create tax record',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
