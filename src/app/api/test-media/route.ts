import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const mediaCount = await db.media.count()
    const allMedia = await db.media.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Media API is working',
      count: mediaCount,
      sample: allMedia.map(m => ({
        id: m.id,
        filename: m.filename,
        category: m.category,
        createdAt: m.createdAt
      }))
    })
  } catch (error) {
    console.error('Test media API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      }
    }, { status: 500 })
  }
}