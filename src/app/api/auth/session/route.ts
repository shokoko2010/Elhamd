import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Return session in NextAuth format
    if (session) {
      return NextResponse.json(session)
    } else {
      return NextResponse.json(null)
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json(null, { status: 500 })
  }
}