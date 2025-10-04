import { NextResponse } from "next/server";
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test basic database connection
    const userCount = await db.user.count()
    const vehicleCount = await db.vehicle.count()
    
    return NextResponse.json({ 
      message: "Good!",
      database: {
        connected: true,
        userCount,
        vehicleCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({ 
      message: "Database connection failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}