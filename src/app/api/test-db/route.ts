import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Testing database connection ===')
    
    // Test basic connection
    const userCount = await db.user.count()
    console.log('User count:', userCount)
    
    const siteSettingsCount = await db.siteSettings.count()
    console.log('Site settings count:', siteSettingsCount)
    
    return NextResponse.json({
      success: true,
      userCount,
      siteSettingsCount,
      message: 'Database connection successful'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}