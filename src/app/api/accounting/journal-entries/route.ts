interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const journalEntries = await db.journalEntry.findMany({
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(journalEntries)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      date,
      description,
      reference,
      branchId,
      items
    } = body

    // Generate entry number
    const entryCount = await db.journalEntry.count()
    const entryNumber = `JE${String(entryCount + 1).padStart(6, '0')}`

    // Calculate totals
    const totalDebit = items.reduce((sum: number, item: any) => sum + (item.debit || 0), 0)
    const totalCredit = items.reduce((sum: number, item: any) => sum + (item.credit || 0), 0)

    // Validate debits equal credits
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ 
        error: 'Debits and credits must be equal',
        totalDebit,
        totalCredit
      }, { status: 400 })
    }

    const journalEntry = await db.journalEntry.create({
      data: {
        entryNumber,
        date: new Date(date),
        description,
        reference,
        totalDebit,
        totalCredit,
        createdBy: session.user.id,
        branchId
      }
    })

    return NextResponse.json(journalEntry)
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}