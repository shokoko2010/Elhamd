import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        user: null
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'User is authenticated',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      }
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      user: null
    }, { status: 500 })
  }
}