import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {

    
    const user = await getAuthUser()
    
    if (!user) {
  
      return NextResponse.json({
        authenticated: false,
        user: null,
        error: 'No authenticated user found'
      })
    }


    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        permissionsCount: user.permissions.length
      }
    })
  } catch (error) {
    console.error('Error in auth check:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}