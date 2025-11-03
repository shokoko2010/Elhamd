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
      reference
    } = body

    // Check if transaction exists
    const existingTransaction = await db.transaction.findUnique({
      where: { id }
    })

    if (!existingTransaction || existingTransaction.type !== 'INCOME') {
      return NextResponse.json({ error: 'الإيراد غير موجود' }, { status: 404 })
    }

    // Update revenue
    const updatedRevenue = await db.transaction.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(paymentMethod && { paymentMethod }),
        ...(reference !== undefined && { reference })
      },
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
      }
    })

    return NextResponse.json(updatedRevenue)
  } catch (error) {
    console.error('Error updating revenue:', error)
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

    if (!existingTransaction || existingTransaction.type !== 'INCOME') {
      return NextResponse.json({ error: 'الإيراد غير موجود' }, { status: 404 })
    }

    // Delete revenue
    await db.transaction.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'تم حذف الإيراد بنجاح' })
  } catch (error) {
    console.error('Error deleting revenue:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

