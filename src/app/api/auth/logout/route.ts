import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    // Get the token to check if user is logged in
    const secret = process.env.NEXTAUTH_SECRET

    if (!secret) {
      console.error('NEXTAUTH_SECRET is not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const token = await getToken({
      req: request,
      secret
    })

    if (!token) {
      return NextResponse.json({
        message: 'No active session found',
        alreadyLoggedOut: true
      })
    }

    // Clear NextAuth session cookie
    const response = NextResponse.json({
      message: 'Logout successful',
      clearToken: true,
      timestamp: new Date().toISOString()
    })

    // Clear NextAuth session cookies
    response.cookies.set('next-auth.session-token', '', {
      expires: new Date(0),
      path: '/',
    })
    
    response.cookies.set('next-auth.csrf-token', '', {
      expires: new Date(0),
      path: '/',
    })
    
    response.cookies.set('next-auth.callback-url', '', {
      expires: new Date(0),
      path: '/',
    })

    // Clear any custom auth cookies
    response.cookies.set('auth_token', '', {
      expires: new Date(0),
      path: '/',
    })

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error during logout' },
      { status: 500 }
    )
  }
}