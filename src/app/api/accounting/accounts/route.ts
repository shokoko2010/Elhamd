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
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')
    const parentId = searchParams.get('parentId')

    const where: any = {}
    if (type) where.type = type
    if (isActive !== null) where.isActive = isActive === 'true'
    if (parentId) where.parentId = parentId

    const accounts = await db.chartOfAccount.findMany({
      where,
      include: {
        items: {
          include: {
            entry: {
              select: {
                entryNumber: true,
                date: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: [
        { code: 'asc' }
      ]
    })

    const parentIds = Array.from(
      new Set(
        accounts
          .map((account) => account.parentId)
          .filter((parentId): parentId is string => typeof parentId === 'string' && parentId.length > 0)
      )
    )

    let parents: Array<{ id: string; name: string; code: string | null }> = []
    if (parentIds.length > 0) {
      parents = await db.chartOfAccount.findMany({
        where: { id: { in: parentIds } },
        select: { id: true, name: true, code: true }
      })
    }

    const parentMap = new Map(parents.map((parent) => [parent.id, parent]))

    const enrichedAccounts = accounts.map((account) => ({
      ...account,
      parent: account.parentId ? parentMap.get(account.parentId) ?? null : null
    }))

    return NextResponse.json(enrichedAccounts)
  } catch (error) {
    console.error('Error fetching chart of accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart of accounts' },
      { status: 500 }
    )
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
      normalBalance,
      isActive = true
    } = body

    // Validate required fields
    if (!code || !name || !type || !normalBalance) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, type, normalBalance' },
        { status: 400 }
      )
    }

    // Check if account code already exists
    const existingAccount = await db.chartOfAccount.findUnique({
      where: { code }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account with this code already exists' },
        { status: 409 }
      )
    }

    const account = await db.chartOfAccount.create({
      data: {
        code,
        name,
        type,
        parentId,
        normalBalance,
        isActive
      },
      include: {
        items: true
      }
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Error creating chart of account:', error)
    return NextResponse.json(
      { error: 'Failed to create chart of account' },
      { status: 500 }
    )
  }
}