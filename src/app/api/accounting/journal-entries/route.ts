import { NextRequest, NextResponse } from 'next/server'
import { resolveAuthUser } from '@/lib/resolve-auth-user'
import { db } from '@/lib/db'

type JournalEntryItemInput = {
  accountId: string
  description?: string
  debit?: number
  credit?: number
}
export async function GET(request: NextRequest) {
  try {
    const user = await resolveAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const journalEntries = await db.journalEntry.findMany({
      orderBy: {
        date: 'desc'
      }
    })

    if (journalEntries.length === 0) {
      return NextResponse.json([])
    }

    const entryIds = journalEntries.map((entry) => entry.id)

    const items = await db.journalEntryItem.findMany({
      where: { entryId: { in: entryIds } },
      orderBy: { createdAt: 'asc' }
    })

    const accountIds = Array.from(new Set(items.map((item) => item.accountId)))

    const accounts = accountIds.length
      ? await db.chartOfAccount.findMany({
          where: {
            id: {
              in: accountIds
            }
          }
        })
      : []

    const accountMap = new Map(accounts.map((account) => [account.id, account]))
    const itemsByEntry = new Map<string, typeof items>()

    items.forEach((item) => {
      if (!itemsByEntry.has(item.entryId)) {
        itemsByEntry.set(item.entryId, [])
      }
      itemsByEntry.get(item.entryId)!.push(item)
    })

    const response = journalEntries.map((entry) => {
      const entryItems = itemsByEntry.get(entry.id) || []
      const enrichedItems = entryItems.map((item) => {
        const account = accountMap.get(item.accountId)
        return {
          ...item,
          account: account
            ? {
                id: account.id,
                code: account.code,
                name: account.name,
                type: account.type,
                normalBalance: account.normalBalance
              }
            : {
                id: item.accountId,
                code: 'غير معرف',
                name: 'حساب غير موجود',
                type: 'UNKNOWN',
                normalBalance: 'DEBIT'
              }
        }
      })

      return {
        ...entry,
        items: enrichedItems
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await resolveAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      date,
      description,
      reference,
      branchId,
      status = 'DRAFT',
      items
    } = body

    if (!date || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedItems: JournalEntryItemInput[] = Array.isArray(items) ? items : []

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: 'At least one journal item is required' }, { status: 400 })
    }

    // Generate entry number
    const entryCount = await db.journalEntry.count()
    const entryNumber = `JE${String(entryCount + 1).padStart(6, '0')}`

    // Calculate totals
    const totalDebit = normalizedItems.reduce((sum: number, item) => sum + (item.debit || 0), 0)
    const totalCredit = normalizedItems.reduce((sum: number, item) => sum + (item.credit || 0), 0)

    // Validate debits equal credits
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ 
        error: 'Debits and credits must be equal',
        totalDebit,
        totalCredit
      }, { status: 400 })
    }

    const journalEntry = await db.$transaction(async (tx) => {
      const createdEntry = await tx.journalEntry.create({
        data: {
          entryNumber,
          date: new Date(date),
          description,
          reference,
          totalDebit,
          totalCredit,
          status,
          createdBy: user.id,
          branchId
        }
      })

      await tx.journalEntryItem.createMany({
        data: normalizedItems.map((item) => ({
          entryId: createdEntry.id,
          accountId: item.accountId,
          description: item.description,
          debit: item.debit || 0,
          credit: item.credit || 0
        }))
      })

      return createdEntry
    })

    const entryItems = await db.journalEntryItem.findMany({
      where: { entryId: journalEntry.id }
    })
    const accounts = entryItems.length
      ? await db.chartOfAccount.findMany({
          where: {
            id: {
              in: entryItems.map((item) => item.accountId)
            }
          }
        })
      : []

    const accountMap = new Map(accounts.map((account) => [account.id, account]))

    return NextResponse.json({
      ...journalEntry,
      items: entryItems.map((item) => {
        const account = accountMap.get(item.accountId)
        return {
          ...item,
          account: account
            ? {
                id: account.id,
                code: account.code,
                name: account.name,
                type: account.type,
                normalBalance: account.normalBalance
              }
            : null
        }
      })
    })
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}