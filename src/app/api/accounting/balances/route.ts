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

    // Get all accounts
    const accounts = await db.chartOfAccount.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        code: 'asc'
      }
    })

    // Get all journal entry items to calculate balances
    const where: any = {
      entry: {
        status: {
          in: ['POSTED', 'APPROVED']
        }
      }
    }

    if (branchId && branchId !== 'all') {
      where.entry = {
        ...where.entry,
        branchId
      }
    }

    const journalItems = await db.journalEntryItem.findMany({
      where,
      include: {
        entry: {
          select: {
            id: true,
            date: true,
            status: true
          }
        },
        account: true
      }
    })

    // Calculate balances for each account
    const accountBalances = accounts.map(account => {
      const items = journalItems.filter(item => item.accountId === account.id)
      
      let debitTotal = 0
      let creditTotal = 0
      
      items.forEach(item => {
        debitTotal += item.debit || 0
        creditTotal += item.credit || 0
      })

      // Calculate balance based on normal balance type
      let balance = 0
      if (account.normalBalance === 'DEBIT') {
        balance = debitTotal - creditTotal
      } else {
        balance = creditTotal - debitTotal
      }

      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        normalBalance: account.normalBalance,
        debitTotal,
        creditTotal,
        balance,
        transactionCount: items.length
      }
    })

    // Calculate financial summary by account type
    const summary = {
      totalAssets: accountBalances
        .filter(b => b.accountType === 'ASSET')
        .reduce((sum, b) => sum + Math.max(0, b.balance), 0),
      
      totalLiabilities: accountBalances
        .filter(b => b.accountType === 'LIABILITY')
        .reduce((sum, b) => sum + Math.max(0, b.balance), 0),
      
      totalEquity: accountBalances
        .filter(b => b.accountType === 'EQUITY')
        .reduce((sum, b) => sum + Math.max(0, b.balance), 0),
      
      totalRevenue: accountBalances
        .filter(b => b.accountType === 'REVENUE')
        .reduce((sum, b) => sum + Math.max(0, b.balance), 0),
      
      totalExpenses: accountBalances
        .filter(b => b.accountType === 'EXPENSE')
        .reduce((sum, b) => sum + Math.max(0, b.balance), 0)
    }

    summary.totalEquity = summary.totalAssets - summary.totalLiabilities
    const netIncome = summary.totalRevenue - summary.totalExpenses

    return NextResponse.json({
      accountBalances,
      summary: {
        ...summary,
        netIncome,
        equity: summary.totalEquity
      }
    })
  } catch (error) {
    console.error('Error calculating account balances:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

