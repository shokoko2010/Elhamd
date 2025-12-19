
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, context: RouteParams) {
    try {
        const { id } = await context.params
        const user = await getAuthUser()
        if (!user || user.role === 'CUSTOMER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await db.contactMessage.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, context: RouteParams) {
    try {
        const { id } = await context.params
        const user = await getAuthUser()
        if (!user || user.role === 'CUSTOMER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { status } = await request.json()

        const message = await db.contactMessage.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(message)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
    }
}
