interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({
    message: 'Logout successful'
  })

  // Clear the auth cookie
  response.cookies.set('staff_token', '', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })

  return response
}