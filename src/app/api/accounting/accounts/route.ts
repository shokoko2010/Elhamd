import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
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

    const accounts = await prisma.chartOfAccount.findMany({
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

    return NextResponse.json(accounts)
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
    const existingAccount = await prisma.chartOfAccount.findUnique({
      where: { code }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account with this code already exists' },
        { status: 409 }
      )
    }

    const account = await prisma.chartOfAccount.create({
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