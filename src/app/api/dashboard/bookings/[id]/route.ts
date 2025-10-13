import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const userId = session.user.id

    // Try to find test drive booking first
    let booking = await db.testDriveBooking.findUnique({
      where: { id: bookingId }
    })

    if (booking && booking.customerId === userId) {
      return NextResponse.json({
        ...booking,
        type: 'TEST_DRIVE'
      })
    }

    // Try service booking
    booking = await db.serviceBooking.findUnique({
      where: { id: bookingId }
    })

    if (booking && booking.customerId === userId) {
      return NextResponse.json({
        ...booking,
        type: 'SERVICE'
      })
    }

    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const userId = session.user.id
    const body = await request.json()

    // Try to find and update test drive booking first
    let booking = await db.testDriveBooking.findUnique({
      where: { id: bookingId }
    })

    if (booking && booking.customerId === userId) {
      const updated = await db.testDriveBooking.update({
        where: { id: bookingId },
        data: {
          ...body,
          updatedAt: new Date()
        }
      })
      return NextResponse.json({
        ...updated,
        type: 'TEST_DRIVE'
      })
    }

    // Try service booking
    booking = await db.serviceBooking.findUnique({
      where: { id: bookingId }
    })

    if (booking && booking.customerId === userId) {
      const updated = await db.serviceBooking.update({
        where: { id: bookingId },
        data: {
          ...body,
          updatedAt: new Date()
        }
      })
      return NextResponse.json({
        ...updated,
        type: 'SERVICE'
      })
    }

    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const userId = session.user.id

    // Try to find and delete test drive booking first
    let booking = await db.testDriveBooking.findUnique({
      where: { id: bookingId }
    })

    if (booking && booking.customerId === userId) {
      await db.testDriveBooking.delete({
        where: { id: bookingId }
      })
      return NextResponse.json({ success: true })
    }

    // Try service booking
    booking = await db.serviceBooking.findUnique({
      where: { id: bookingId }
    })

    if (booking && booking.customerId === userId) {
      await db.serviceBooking.delete({
        where: { id: bookingId }
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}