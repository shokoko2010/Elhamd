import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

const VIEW_PERMISSIONS = [
  'view_financials',
  'view_financial_overview',
  'view_financial_reports',
  'view_reports'
]

const MANAGE_PERMISSIONS = [
  'manage_financials',
  'export_financial_data',
  'access_finance_dashboard'
]

function hasAnyPermission(user: Awaited<ReturnType<typeof getAuthUser>>, permissions: string[]) {
  if (!user) {
    return false
  }

  if (user.role === UserRole.SUPER_ADMIN || user.permissions.includes('*')) {
    return true
  }

  return permissions.some((permission) => user.permissions.includes(permission))
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasAnyPermission(user, VIEW_PERMISSIONS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const account = await db.chartOfAccount.findUnique({
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
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasAnyPermission(user, [...VIEW_PERMISSIONS, ...MANAGE_PERMISSIONS])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
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
    const existingAccount = await db.chartOfAccount.findUnique({
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
      const codeConflict = await db.chartOfAccount.findUnique({
        where: { code }
      })

      if (codeConflict) {
        return NextResponse.json(
          { error: 'Account with this code already exists' },
          { status: 409 }
        )
      }
    }

    const account = await db.chartOfAccount.update({
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
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasAnyPermission(user, MANAGE_PERMISSIONS)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if account has any journal entry items
    const itemsCount = await db.journalEntryItem.count({
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

    await db.chartOfAccount.delete({
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