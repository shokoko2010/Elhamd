import { NextResponse } from 'next/server'

export async function POST() {
  console.log('=== LOGOUT API CALLED ===')
  
  try {
    const response = NextResponse.json({
      message: 'Logout successful',
      success: true
    })

    // Clear the auth cookie with multiple approaches to ensure it's removed
    response.cookies.set('staff_token', '', {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0) // Set to past date
    })

    // Also try to clear with different settings
    response.cookies.set('staff_token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
      maxAge: 0
    })

    console.log('Logout cookies cleared')
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed', success: false },
      { status: 500 }
    )
  }
}