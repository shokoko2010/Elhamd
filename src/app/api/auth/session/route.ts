import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// GET /api/auth/session - Get current session
export async function GET(request: NextRequest) {
  try {
    // Check if we're in development or production
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // In development, return null session to avoid auth issues
    if (isDevelopment) {
      return NextResponse.json({ 
        user: null,
        expires: null
      })
    }
    
    // Get NextAuth session
    const session = await getServerSession(authOptions)
    
    if (session?.user) {
      return NextResponse.json({
        user: session.user,
        expires: session.expires
      })
    }

    // No session found
    return NextResponse.json({ 
      user: null,
      expires: null
    })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الجلسة', user: null, expires: null },
      { status: 500 }
    )
  }
}