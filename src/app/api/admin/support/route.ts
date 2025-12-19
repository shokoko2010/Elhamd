
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const status = searchParams.get('status')
        const priority = searchParams.get('priority')
        const search = searchParams.get('search') || ''

        const skip = (page - 1) * limit

        const where: any = {}
        if (status && status !== 'all') where.status = status
        if (priority && priority !== 'all') where.priority = priority

        if (search) {
            where.OR = [
                { subject: { contains: search, mode: 'insensitive' } },
                { ticketNumber: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        const [tickets, total] = await Promise.all([
            db.supportTicket.findMany({
                where,
                include: {
                    customer: { select: { id: true, name: true, email: true, image: true } },
                    assignee: { select: { id: true, name: true, email: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            db.supportTicket.count({ where })
        ])

        return NextResponse.json({
            tickets,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        })
    } catch (error) {
        console.error('Error fetching tickets:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { subject, description, priority, category, customerId } = body

        const ticket = await db.supportTicket.create({
            data: {
                subject,
                description,
                priority: priority || 'MEDIUM',
                category: category || 'GENERAL',
                customerId: customerId || user.id, // Assign to self if not specified? Or separate logic.
                createdBy: user.id,
                status: 'OPEN'
            }
        })

        return NextResponse.json(ticket)
    } catch (error) {
        console.error('Error creating ticket:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
