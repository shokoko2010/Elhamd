import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test basic database connection
    await db.$queryRaw`SELECT 1`;
    
    // Test user table access
    const userCount = await db.user.count();
    
    // Test branch table access
    const branchCount = await db.branch.count();
    
    // Test vehicle table access
    const vehicleCount = await db.vehicle.count();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        tables: {
          users: userCount,
          branches: branchCount,
          vehicles: vehicleCount
        }
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}