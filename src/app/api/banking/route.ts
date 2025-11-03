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

    // Build where clause for bank transactions
    const where: any = {
      paymentMethod: {
        in: ['BANK_TRANSFER', 'BANK', 'CHECK']
      }
    }

    if (branchId && branchId !== 'all') {
      where.branchId = branchId
    }

    // Get all bank transactions
    const bankTransactions = await db.transaction.findMany({
      where,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Group transactions by account/category (simulating bank accounts)
    // In a real system, you might have a BankAccount model
    const accounts: any = {
      'current': { name: 'الحساب الجاري', balance: 0, transactions: [] },
      'savings': { name: 'حساب التوفير', balance: 0, transactions: [] },
      'payroll': { name: 'حساب الرواتب', balance: 0, transactions: [] }
    }

    // Calculate balances and group transactions
    bankTransactions.forEach(transaction => {
      // Determine account type based on category or metadata
      const metadata = transaction.metadata as any
      const accountType = metadata?.accountType || 
                         (transaction.category?.includes('ROYAL') ? 'payroll' :
                          transaction.category?.includes('SAVING') ? 'savings' : 'current')
      
      if (accounts[accountType]) {
        if (transaction.type === 'INCOME') {
          accounts[accountType].balance += transaction.amount
        } else {
          accounts[accountType].balance -= transaction.amount
        }
        accounts[accountType].transactions.push(transaction)
      }
    })

    // Calculate total balance
    const totalBalance = Object.values(accounts).reduce((sum: number, account: any) => {
      return sum + account.balance
    }, 0)

    // Calculate cash flow for current month
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const monthlyTransactions = bankTransactions.filter(t => {
      const tDate = new Date(t.date)
      return tDate >= monthStart && tDate <= monthEnd
    })

    const cashFlow = monthlyTransactions.reduce((sum, t) => {
      return sum + (t.type === 'INCOME' ? t.amount : -t.amount)
    }, 0)

    // Format accounts array
    const accountsList = Object.entries(accounts).map(([key, account]: [string, any]) => ({
      id: key,
      account: account.name,
      balance: account.balance,
      status: 'نشط',
      transactionCount: account.transactions.length
    }))

    return NextResponse.json({
      accounts: accountsList,
      summary: {
        totalBalance,
        cashFlow,
        transactionCount: bankTransactions.length,
        monthlyTransactionCount: monthlyTransactions.length
      },
      transactions: bankTransactions.slice(0, 50) // Limit to last 50 transactions
    })
  } catch (error) {
    console.error('Error fetching banking data:', error)
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
      accountType,
      amount,
      type,
      description,
      date,
      branchId,
      reference,
      category
    } = body

    if (!accountType || !amount || !type || !date) {
      return NextResponse.json({ 
        error: 'Missing required fields: accountType, amount, type, date' 
      }, { status: 400 })
    }

    // Generate unique referenceId
    const refCount = await db.transaction.count({
      where: {
        paymentMethod: {
          in: ['BANK_TRANSFER', 'BANK', 'CHECK']
        }
      }
    })
    const referenceId = `BNK-${String(refCount + 1).padStart(6, '0')}`

    // Create bank transaction
    const bankTransaction = await db.transaction.create({
      data: {
        referenceId,
        type: type.toUpperCase(), // INCOME or EXPENSE
        category: category || 'BANKING',
        amount: parseFloat(amount),
        currency: 'EGP',
        description,
        date: new Date(date),
        paymentMethod: 'BANK_TRANSFER',
        branchId: branchId || user.branchId,
        reference,
        metadata: {
          accountType,
          createdBy: user.id,
          createdAt: new Date().toISOString()
        }
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json(bankTransaction, { status: 201 })
  } catch (error) {
    console.error('Error creating bank transaction:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

