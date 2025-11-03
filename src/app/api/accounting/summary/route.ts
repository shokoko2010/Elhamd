import { NextRequest, NextResponse } from 'next/server'
import { resolveAuthUser } from '@/lib/resolve-auth-user'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await resolveAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [accounts, balanceAggregates, statusAggregates] = await Promise.all([
      db.chartOfAccount.findMany({
        select: {
          id: true,
          type: true,
          normalBalance: true,
          isActive: true
        }
      }),
      db.journalEntryItem.groupBy({
        by: ['accountId'],
        _sum: { debit: true, credit: true }
      }),
      db.journalEntry.groupBy({
        by: ['status'],
        _count: { _all: true }
      })
    ])

    const accountMap = new Map(accounts.map((account) => [account.id, account]))

    const totals = {
      totalAssets: 0,
      totalLiabilities: 0,
      totalRevenue: 0,
      totalExpenses: 0
    }

    balanceAggregates.forEach((aggregate) => {
      const account = accountMap.get(aggregate.accountId)
      if (!account) return

      const debit = aggregate._sum.debit ?? 0
      const credit = aggregate._sum.credit ?? 0
      const balance = account.normalBalance === 'DEBIT' ? debit - credit : credit - debit

      switch (account.type) {
        case 'ASSET':
          totals.totalAssets += balance
          break
        case 'LIABILITY':
          totals.totalLiabilities += balance
          break
        case 'REVENUE':
          totals.totalRevenue += balance
          break
        case 'EXPENSE':
          totals.totalExpenses += balance
          break
        case 'EQUITY':
          break
      }
    })

    const netIncome = totals.totalRevenue - totals.totalExpenses
    const equity = totals.totalAssets - totals.totalLiabilities

    const activeAccounts = accounts.filter((account) => account.isActive).length

    const entryStatus = statusAggregates.reduce<Record<string, number>>((acc, aggregate) => {
      acc[aggregate.status] = aggregate._count._all
      return acc
    }, {})

    return NextResponse.json({
      totals: {
        ...totals,
        netIncome,
        equity
      },
      accounts: {
        total: accounts.length,
        active: activeAccounts
      },
      entryStatus
    })
  } catch (error) {
    console.error('Error building accounting summary:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
