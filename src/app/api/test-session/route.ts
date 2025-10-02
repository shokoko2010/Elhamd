import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  try {
    console.log('Testing session...')
    
    // Test basic session retrieval
    const session = await getServerSession(authOptions)
    
    console.log('Session result:', session ? 'Session found' : 'No session')
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No session found',
        session: null
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Session found',
      session: {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          role: session.user?.role
        },
        expires: session.expires
      }
    })
  } catch (error) {
    console.error('Session test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}