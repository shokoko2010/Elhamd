
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params
        const body = await request.json()

        // Validate body (allow updating status, priority, assignee)
        const { status, priority, assignedTo } = body

        const ticket = await db.supportTicket.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(priority && { priority }),
                ...(assignedTo && { assignedTo })
            }
        })

        return NextResponse.json(ticket)
    } catch (error) {
        console.error('Error updating ticket:', error)
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Check role? Admin only?
        // Assuming admin middleware or check here

        const { id } = await params

        await db.supportTicket.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting ticket:', error)
        return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 })
    }
}
