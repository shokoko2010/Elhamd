
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { UserRole, ContactStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser()
        if (!user || ![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || ''

        const skip = (page - 1) * limit
        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (status && status !== 'all') {
            where.status = status as ContactStatus
        }

        const [messages, total] = await Promise.all([
            db.contactMessage.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            db.contactMessage.count({ where })
        ])

        return NextResponse.json({
            messages,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
