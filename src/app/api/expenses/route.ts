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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const category = searchParams.get('category')
    const branchId = searchParams.get('branchId')
    const status = searchParams.get('status') // يمكن استخدامه لاحقاً

    // Calculate date range for current month if not provided
    const now = new Date()
    const monthStart = startDate 
      ? new Date(startDate) 
      : new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = endDate 
      ? new Date(endDate) 
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Build where clause
    const where: any = {
      type: 'EXPENSE',
      date: {
        gte: monthStart,
        lte: monthEnd
      }
    }

    if (category) {
      where.category = category
    }

    if (branchId && branchId !== 'all') {
      where.branchId = branchId
    }

    // Fetch expenses
    const expenses = await db.transaction.findMany({
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
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Calculate summary statistics
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    
    // Group by category
    const expensesByCategory = expenses.reduce((acc: any, exp) => {
      const cat = exp.category || 'غير محدد'
      if (!acc[cat]) {
        acc[cat] = { category: cat, amount: 0, count: 0 }
      }
      acc[cat].amount += exp.amount
      acc[cat].count += 1
      return acc
    }, {})

    // Calculate operational vs capital expenses
    const operationalCategories = ['الإيجار', 'الرواتب', 'الكهرباء والمياه', 'التسويق', 'الصيانة', 'OPERATIONAL', 'SALARIES', 'RENT', 'UTILITIES', 'MARKETING']
    const operationalExpenses = expenses
      .filter(exp => operationalCategories.includes(exp.category))
      .reduce((sum, exp) => sum + exp.amount, 0)
    
    const capitalExpenses = totalExpenses - operationalExpenses

    // Get pending expenses (if status field exists in metadata)
    const pendingExpenses = expenses
      .filter(exp => {
        const metadata = exp.metadata as any
        return metadata?.status === 'pending' || metadata?.status === 'PENDING'
      })
      .reduce((sum, exp) => sum + exp.amount, 0)

    return NextResponse.json({
      expenses,
      summary: {
        totalExpenses,
        operationalExpenses,
        capitalExpenses,
        pendingExpenses,
        expensesByCategory: Object.values(expensesByCategory),
        count: expenses.length
      }
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
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
      category,
      amount,
      description,
      date,
      paymentMethod,
      branchId,
      reference,
      status = 'pending'
    } = body

    if (!category || !amount || !date) {
      return NextResponse.json({ 
        error: 'Missing required fields: category, amount, date' 
      }, { status: 400 })
    }

    // Generate unique referenceId
    const refCount = await db.transaction.count({
      where: {
        type: 'EXPENSE'
      }
    })
    const referenceId = `EXP-${String(refCount + 1).padStart(6, '0')}`

    // Create expense transaction
    const expense = await db.transaction.create({
      data: {
        referenceId,
        type: 'EXPENSE',
        category,
        amount: parseFloat(amount),
        currency: 'EGP',
        description,
        date: new Date(date),
        paymentMethod: paymentMethod || 'CASH',
        branchId: branchId || user.branchId,
        reference,
        metadata: {
          status,
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

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

