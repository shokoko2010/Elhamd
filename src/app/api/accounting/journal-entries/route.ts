interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')
    const status = searchParams.get('status')

    const where: any = {}
    if (branchId && branchId !== 'all') {
      where.branchId = branchId
    }
    if (status) {
      where.status = status
    }

    const journalEntries = await db.journalEntry.findMany({
      where,
      include: {
        items: {
          include: {
            account: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    const branchIds = Array.from(
      new Set(
        journalEntries
          .map(entry => entry.branchId)
          .filter(Boolean) as string[]
      )
    )

    const branches = branchIds.length
      ? await db.branch.findMany({
          where: { id: { in: branchIds } },
          select: { id: true, name: true, code: true }
        })
      : []

    const branchMap = new Map(branches.map(branch => [branch.id, branch]))

    const serializedEntries = journalEntries.map(entry => ({
      ...entry,
      branch: entry.branchId ? branchMap.get(entry.branchId) ?? null : null
    }))

    return NextResponse.json(serializedEntries)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
      date,
      description,
      reference,
      branchId,
      items
    } = body

    // Generate entry number
    const entryCount = await db.journalEntry.count()
    const entryNumber = `JE${String(entryCount + 1).padStart(6, '0')}`

    // Calculate totals
    const totalDebit = items.reduce((sum: number, item: any) => sum + (item.debit || 0), 0)
    const totalCredit = items.reduce((sum: number, item: any) => sum + (item.credit || 0), 0)

    // Validate debits equal credits
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ 
        error: 'Debits and credits must be equal',
        totalDebit,
        totalCredit
      }, { status: 400 })
    }

    // Create journal entry with items
    const journalEntry = await db.journalEntry.create({
      data: {
        entryNumber,
        date: new Date(date),
        description,
        reference,
        totalDebit,
        totalCredit,
        createdBy: user.id,
        branchId,
        items: {
          create: items.map((item: any) => ({
            accountId: item.accountId,
            description: item.description,
            debit: item.debit || 0,
            credit: item.credit || 0
          }))
        }
      },
      include: {
        items: {
          include: {
            account: true
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

    const branch = journalEntry.branchId
      ? await db.branch.findUnique({
          where: { id: journalEntry.branchId },
          select: { id: true, name: true, code: true }
        })
      : null

    return NextResponse.json({
      ...journalEntry,
      branch
    })
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}