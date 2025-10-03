import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getUnifiedUser } from '@/lib/unified-auth'

// GET /api/auth/session - Get current session
export async function GET(request: NextRequest) {
  try {
    // Check if we're in development or production
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // In development, return null session to avoid auth issues
    if (isDevelopment) {
      return NextResponse.json({ 
        user: null,
        expires: null
      })
    }
    
    // Try NextAuth session first
    try {
      const session = await getServerSession(authOptions)
      
      if (session?.user) {
        return NextResponse.json({
          user: session.user,
          expires: session.expires
        })
      }
    } catch (authError) {
      console.error('NextAuth session error:', authError)
      // Continue to unified auth
    }

    // Fallback to unified auth
    try {
      const unifiedUser = await getUnifiedUser(request)
      
      if (unifiedUser) {
        return NextResponse.json({
          user: {
            id: unifiedUser.id,
            email: unifiedUser.email,
            name: unifiedUser.name,
            role: unifiedUser.role,
            phone: unifiedUser.phone,
            branchId: unifiedUser.branchId,
            permissions: unifiedUser.permissions
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })
      }
    } catch (unifiedError) {
      console.error('Unified auth error:', unifiedError)
      // Continue to null session
    }

    // No session found
    return NextResponse.json({ 
      user: null,
      expires: null
    })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الجلسة', user: null, expires: null },
      { status: 500 }
    )
  }
}