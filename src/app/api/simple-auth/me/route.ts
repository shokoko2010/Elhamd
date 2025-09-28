import { NextRequest, NextResponse } from 'next/server'
import { getSimpleUser } from '@/lib/simple-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getSimpleUser(request)
    
    if (!user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

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