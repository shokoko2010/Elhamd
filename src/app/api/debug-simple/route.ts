import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('Debug: POST request received')
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Simple debug API working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}