import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

const accountTypeOrder: Record<string, number> = {
  ASSET: 1,
  LIABILITY: 2,
  EQUITY: 3,
  REVENUE: 4,
  EXPENSE: 5,
}
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accounts = await db.chartOfAccount.findMany({
      orderBy: [
        {
          type: 'asc'
        },
        {
          code: 'asc'
        }
      ]
    })

    const parentIds = accounts
      .map((account) => account.parentId)
      .filter((parentId): parentId is string => Boolean(parentId))

    const parentAccounts = parentIds.length
      ? await db.chartOfAccount.findMany({
          where: { id: { in: parentIds } },
          select: { id: true, name: true }
        })
      : []

    const parentMap = new Map(parentAccounts.map((parent) => [parent.id, parent]))

    // Calculate current balances from journal entry items to expose a quick view
    const balanceAggregates = await db.journalEntryItem.groupBy({
      by: ['accountId'],
      _sum: { debit: true, credit: true }
    })

    const balanceMap = new Map(
      balanceAggregates.map((aggregate) => {
        const debit = aggregate._sum.debit ?? 0
        const credit = aggregate._sum.credit ?? 0
        return [aggregate.accountId, { debit, credit }]
      })
    )

    const enhancedAccounts = accounts
      .map((account) => {
        const balances = balanceMap.get(account.id) || { debit: 0, credit: 0 }
        const normalBalance = account.normalBalance
        const balance =
          normalBalance === 'DEBIT'
            ? balances.debit - balances.credit
            : balances.credit - balances.debit

        return {
          ...account,
          currentBalance: balance,
          parent: account.parentId ? parentMap.get(account.parentId) ?? null : null,
        }
      })
      .sort((a, b) => {
        const typeRankDiff = (accountTypeOrder[a.type] ?? 99) - (accountTypeOrder[b.type] ?? 99)
        if (typeRankDiff !== 0) {
          return typeRankDiff
        }
        return a.code.localeCompare(b.code)
      })

    return NextResponse.json(enhancedAccounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
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
      code,
      name,
      type,
      parentId,
      normalBalance
    } = body

    const account = await db.chartOfAccount.create({
      data: {
        code,
        name,
        type,
        parentId,
        normalBalance
      }
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}