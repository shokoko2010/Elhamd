import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const {
      category,
      amount,
      description,
      date,
      paymentMethod,
      reference,
      status
    } = body

    // Check if transaction exists
    const existingTransaction = await db.transaction.findUnique({
      where: { id }
    })

    if (!existingTransaction || existingTransaction.type !== 'EXPENSE') {
      return NextResponse.json({ error: 'المصروف غير موجود' }, { status: 404 })
    }

    // Update expense
    const updatedExpense = await db.transaction.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(paymentMethod && { paymentMethod }),
        ...(reference !== undefined && { reference }),
        ...(status && {
          metadata: {
            ...(existingTransaction.metadata as any || {}),
            status,
            updatedBy: user.id,
            updatedAt: new Date().toISOString()
          }
        })
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

    return NextResponse.json(updatedExpense)
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Check if transaction exists
    const existingTransaction = await db.transaction.findUnique({
      where: { id }
    })

    if (!existingTransaction || existingTransaction.type !== 'EXPENSE') {
      return NextResponse.json({ error: 'المصروف غير موجود' }, { status: 404 })
    }

    // Delete expense
    await db.transaction.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'تم حذف المصروف بنجاح' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

