import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({
        message: 'No active session found',
        alreadyLoggedOut: true
      })
    }

    // Create response with logout instructions
    const response = NextResponse.json({
      message: 'Logout successful',
      redirectTo: '/login',
      timestamp: new Date().toISOString()
    })

    // Clear all NextAuth related cookies
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      'auth_token'
    ]

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: process.env.NODE_ENV === 'production' ? '.elhamdimport.com' : undefined
      })
    })

    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('NextAuth logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error during logout' },
      { status: 500 }
    )
  }
}