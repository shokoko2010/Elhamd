import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getUnifiedUser } from '@/lib/unified-auth'

// GET /api/auth/session - Get current session
export async function GET(request: NextRequest) {
  try {
    // Try NextAuth session first
    const session = await getServerSession(authOptions)
    
    if (session?.user) {
      return NextResponse.json({
        user: session.user,
        expires: session.expires
      })
    }

    // Fallback to unified auth
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