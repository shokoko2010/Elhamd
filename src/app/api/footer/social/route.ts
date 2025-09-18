import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get footer social links from database
    const footerSocial = await db.footerSocial.findFirst()
    
    if (!footerSocial) {
      // Return empty object if none exists
      return NextResponse.json({})
    }

    return NextResponse.json(footerSocial)
  } catch (error) {
    console.error('Error fetching footer social links:', error)
    return NextResponse.json(
      { error: 'Failed to fetch footer social links' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Update or create footer social links
    const existingSocial = await db.footerSocial.findFirst()
    
    if (existingSocial) {
      const updatedSocial = await db.footerSocial.update({
        where: { id: existingSocial.id },
        data
      })
      return NextResponse.json(updatedSocial)
    } else {
      const newSocial = await db.footerSocial.create({
        data
      })
      return NextResponse.json(newSocial)
    }
  } catch (error) {
    console.error('Error updating footer social links:', error)
    return NextResponse.json(
      { error: 'Failed to update footer social links' },
      { status: 500 }
    )
  }
}