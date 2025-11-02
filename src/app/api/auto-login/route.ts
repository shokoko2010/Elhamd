import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { db } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔍 Auto login API called')
    
    // Check if already logged in
    const session = await getServerSession(authOptions)
    if (session?.user) {
      console.log('✅ User already logged in:', session.user.email)
      return NextResponse.json({ 
        success: true,
        message: 'Already logged in',
        user: session.user
      })
    }
    
    // Get admin user
    const adminUser = await db.user.findFirst({
      where: {
        role: 'SUPER_ADMIN',
        isActive: true
      }
    })
    
    if (!adminUser) {
      return NextResponse.json({ 
        error: 'No admin user found',
        message: 'Please create an admin user first'
      }, { status: 404 })
    }
    
    console.log('✅ Found admin user:', adminUser.email)
    
    // For testing purposes, we'll create a mock session
    // In production, you should use proper login flow
    return NextResponse.json({ 
      success: true,
      message: 'Please login through the login page',
      loginUrl: '/login',
      adminEmail: adminUser.email,
      note: 'Auto login is not secure. Please use the login page.'
    })
  } catch (error) {
    console.error('❌ Auto login error:', error)
    return NextResponse.json({ 
      error: 'Auto login failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}