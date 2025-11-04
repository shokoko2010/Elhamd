import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const account = await prisma.chartOfAccount.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            entry: {
              select: {
                entryNumber: true,
                date: true,
                description: true,
                status: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error fetching chart of account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart of account' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      code,
      name,
      type,
      parentId,
      normalBalance,
      isActive
    } = body

    // Check if account exists
    const existingAccount = await prisma.chartOfAccount.findUnique({
      where: { id: params.id }
    })

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    // Check if new code conflicts with existing account
    if (code && code !== existingAccount.code) {
      const codeConflict = await prisma.chartOfAccount.findUnique({
        where: { code }
      })

      if (codeConflict) {
        return NextResponse.json(
          { error: 'Account with this code already exists' },
          { status: 409 }
        )
      }
    }

    const account = await prisma.chartOfAccount.update({
      where: { id: params.id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(type && { type }),
        ...(parentId !== undefined && { parentId }),
        ...(normalBalance && { normalBalance }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        items: true
      }
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error updating chart of account:', error)
    return NextResponse.json(
      { error: 'Failed to update chart of account' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if account has any journal entry items
    const itemsCount = await prisma.journalEntryItem.count({
      where: { accountId: params.id }
    })

    if (itemsCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete account with existing journal entries',
          itemsCount 
        },
        { status: 409 }
      )
    }

    await prisma.chartOfAccount.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting chart of account:', error)
    return NextResponse.json(
      { error: 'Failed to delete chart of account' },
      { status: 500 }
    )
  }
}