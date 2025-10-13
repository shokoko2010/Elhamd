import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const userCount = await db.user.count();
    const adminUsers = await db.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount,
        adminUsers,
        dbUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        dbUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}