import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Signout API called, session exists:', !!session)
    
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
      timestamp: new Date().toISOString(),
      sessionCleared: true
    })

    // Clear all NextAuth related cookies with comprehensive settings
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Secure-next-auth.csrf-token',
      '__Secure-next-auth.callback-url',
      'auth_token',
      'next-auth.pkce.code_verifier',
      '__Host-next-auth.csrf-token'
    ]

    cookiesToClear.forEach(cookieName => {
      // Clear cookie for all possible domains and paths
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: process.env.NODE_ENV === 'production' ? '.elhamdimport.com' : undefined
      })
      
      // Also clear with root path
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: process.env.NODE_ENV === 'production' ? '.elhamdimport.com' : undefined
      })
    })

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Clear-Site-Data', '"cookies", "storage"')

    console.log('Signout API completed successfully')
    return response
    
  } catch (error) {
    console.error('NextAuth logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error during logout' },
      { status: 500 }
    )
  }
}