import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test basic connection without Prisma first
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
    
    return NextResponse.json({
      success: true,
      message: 'Debug info',
      env: {
        DATABASE_URL: dbUrl ? 'SET' : 'NOT_SET',
        POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT_SET',
        NODE_ENV: process.env.NODE_ENV,
        PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL ? 'SET' : 'NOT_SET'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}