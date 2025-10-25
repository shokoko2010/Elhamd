import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session) {
      return NextResponse.json({ 
        valid: true,
        user: session.user 
      })
    } else {
      return NextResponse.json({ 
        valid: false,
        user: null 
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json({ 
      valid: false,
      user: null,
      error: 'Session validation failed'
    }, { status: 500 })
  }
}