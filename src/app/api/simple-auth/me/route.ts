interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getSimpleUser } from '@/lib/simple-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG: /api/simple-auth/me called ===')
    
    const user = await getSimpleUser(request)
    
    console.log('User from getSimpleUser:', user)
    
    if (!user) {
      console.log('No user found - returning 401')
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    console.log('User authenticated successfully:', {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    })

    return NextResponse.json({
      user
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}