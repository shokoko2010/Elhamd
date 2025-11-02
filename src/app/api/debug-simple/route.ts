import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'

export async function POST() {
  try {
    console.log('🔍 Debug API called')
    
    const user = await getAuthUser()
    console.log('🔍 Auth user result:', user ? user.email : 'No user')
    
    if (!user) {
      return NextResponse.json({ 
        error: 'No authenticated user found',
        message: 'Please login first'
      }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Authentication working',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      }
    })
  } catch (error) {
    console.error('❌ Debug API error:', error)
    return NextResponse.json({ 
      error: 'Debug API failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}