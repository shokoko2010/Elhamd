import { NextRequest, NextResponse } from 'next/server'
import { authenticateProductionUser } from '@/lib/simple-production-auth'
import { db } from '@/lib/db'
import { PERMISSIONS } from '@/lib/permissions'
import { PaymentMethod, UserRole } from '@prisma/client'

type ExpenseStatus = 'PAID' | 'PENDING' | 'DRAFT'

const OPERATING_KEYWORDS = ['SALARY', 'OPERAT', 'SERVICE', 'UTILITY', 'RENT', 'MAINT', 'PAYROLL']
const CAPITAL_KEYWORDS = ['CAPITAL', 'ASSET', 'PURCHASE', 'EQUIPMENT']

function classifyExpense(category: string, metadata?: Record<string, any>) {
  const normalized = category.toUpperCase()
  const metadataType = metadata?.expenseType?.toString()?.toUpperCase()

  if (metadataType === 'CAPITAL') return 'capital'
  if (metadataType === 'OPERATING') return 'operational'

  if (CAPITAL_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'capital'
  }

  if (OPERATING_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'operational'
  }

  return 'operational'
}

function resolveStatus(metadata?: Record<string, any>): ExpenseStatus {
  const status = metadata?.status?.toString()?.toUpperCase()
  switch (status) {
    case 'PENDING':
      return 'PENDING'
    case 'DRAFT':
      return 'DRAFT'
    default:
      return 'PAID'
  }
}

function hasFinanceAccess(user: { role: UserRole; permissions: string[] }) {
  if ([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.ACCOUNTANT].includes(user.role)) {
    return true
  }

  const allowedPermissions = [
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_FINANCIAL_OVERVIEW,
    PERMISSIONS.ACCESS_FINANCE_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS
  ]

  return allowedPermissions.some((permission) => user.permissions.includes(permission))
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateProductionUser(request)
    if (!user || !hasFinanceAccess(user)) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول إلى المصروفات' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId') || undefined
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const categoryFilter = searchParams.get('category') || undefined
    const statusFilter = searchParams.get('status')?.toUpperCase() as ExpenseStatus | undefined

    const where: any = {
      type: 'EXPENSE'
    }

    if (branchId) {
      where.branchId = branchId
    }

    if (startDateParam || endDateParam) {
      where.date = {}
      if (startDateParam) {
        where.date.gte = new Date(startDateParam)
      }
      if (endDateParam) {
        where.date.lte = new Date(endDateParam)
      }
    }

    if (categoryFilter) {
      where.category = { contains: categoryFilter, mode: 'insensitive' }
    }

    const transactions = await db.transaction.findMany({
      where,
      include: {
        branch: {
          select: { id: true, name: true, code: true }
        }
      },
      orderBy: { date: 'desc' }
    })

    const expenses = transactions
      .map((transaction) => {
        const status = resolveStatus(transaction.metadata as Record<string, any> | undefined)
        return {
          id: transaction.id,
          referenceId: transaction.referenceId,
          amount: transaction.amount,
          currency: transaction.currency,
          description: transaction.description,
          date: transaction.date.toISOString(),
          category: transaction.category,
          status,
          branch: transaction.branch,
          metadata: transaction.metadata ?? null
        }
      })
      .filter((expense) => {
        if (!statusFilter) return true
        return expense.status === statusFilter
      })

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const currentMonth = new Date()
    const currentMonthExpenses = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getFullYear() === currentMonth.getFullYear() &&
          expenseDate.getMonth() === currentMonth.getMonth()
      })
      .reduce((sum, expense) => sum + expense.amount, 0)

    let operationalExpenses = 0
    let capitalExpenses = 0
    let pendingExpenses = 0

    const categoriesMap = new Map<string, { total: number; count: number }>()

    expenses.forEach((expense) => {
      if (expense.status === 'PENDING') {
        pendingExpenses += expense.amount
      }

      const categoryType = classifyExpense(expense.category, expense.metadata || undefined)
      if (categoryType === 'capital') {
        capitalExpenses += expense.amount
      } else {
        operationalExpenses += expense.amount
      }

      const current = categoriesMap.get(expense.category) || { total: 0, count: 0 }
      categoriesMap.set(expense.category, {
        total: current.total + expense.amount,
        count: current.count + 1
      })
    })

    const categories = Array.from(categoriesMap.entries()).map(([category, data]) => ({
      category,
      amount: data.total,
      percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      count: data.count
    }))

    return NextResponse.json({
      totals: {
        totalExpenses,
        currentMonth: currentMonthExpenses,
        operationalExpenses,
        capitalExpenses,
        pendingExpenses
      },
      categories,
      expenses
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'فشل في جلب بيانات المصروفات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateProductionUser(request)
    if (!user || !hasFinanceAccess(user)) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول إلى المصروفات' }, { status: 401 })
    }

    const body = await request.json()
    const {
      category,
      amount,
      date,
      description,
      paymentMethod,
      branchId,
      status = 'PAID',
      reference
    } = body

    if (!category || !amount || !date) {
      return NextResponse.json({ error: 'الرجاء تزويد فئة المصروف، المبلغ والتاريخ' }, { status: 400 })
    }

    const payment: PaymentMethod = paymentMethod && Object.values(PaymentMethod).includes(paymentMethod)
      ? paymentMethod
      : PaymentMethod.CASH

    const transaction = await db.transaction.create({
      data: {
        referenceId: reference || `EXP-${Date.now()}`,
        branchId: branchId || user.branchId || null,
        type: 'EXPENSE',
        category,
        amount: parseFloat(amount),
        currency: 'EGP',
        description,
        date: new Date(date),
        paymentMethod: payment,
        metadata: {
          ...(body.metadata ?? {}),
          status,
          createdBy: user.id,
          expenseType: classifyExpense(category, body.metadata || undefined)
        }
      },
      include: {
        branch: {
          select: { id: true, name: true, code: true }
        }
      }
    })

    return NextResponse.json({
      id: transaction.id,
      referenceId: transaction.referenceId,
      amount: transaction.amount,
      currency: transaction.currency,
      description: transaction.description,
      date: transaction.date.toISOString(),
      category: transaction.category,
      status: resolveStatus(transaction.metadata as Record<string, any> | undefined),
      branch: transaction.branch,
      metadata: transaction.metadata
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'فشل في تسجيل المصروف' }, { status: 500 })
  }
}
