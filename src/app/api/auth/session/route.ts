import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      // Return null with 200 status for unauthenticated sessions
      // This is what NextAuth expects
      return NextResponse.json(null, { status: 200 })
    }

    // Return the session object directly
    return NextResponse.json(session, { status: 200 })
  } catch (error) {
    console.error('Session API error:', error)
    // Return null with 200 status even on error
    // This prevents CLIENT_FETCH_ERROR
    return NextResponse.json(null, { status: 200 })
  }
}