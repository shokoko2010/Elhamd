import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      hasSession: !!session,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          role: session.user?.role,
        },
        permissions: session.user?.permissions?.length || 0,
        expires: session.expires
      } : null,
      headers: {
        host: request.headers.get('host'),
        userAgent: request.headers.get('user-agent'),
        cookie: request.headers.get('cookie') ? 'Present' : 'Missing'
      },
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    }
    
    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}