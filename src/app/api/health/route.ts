import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== HEALTH CHECK ===');
    
    // Test database connection
    let dbStatus = 'unknown';
    try {
      await db.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      console.error('Database connection failed:', error);
      dbStatus = 'failed';
    }
    
    // Test authentication
    let authStatus = 'unknown';
    let userInfo = null;
    try {
      const user = await getAuthUser();
      if (user) {
        authStatus = 'authenticated';
        userInfo = {
          id: user.id,
          email: user.email,
          role: user.role,
          permissionsCount: user.permissions.length
        };
      } else {
        authStatus = 'not_authenticated';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authStatus = 'failed';
    }
    
    // Check environment variables
    const envCheck = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      PRISMA_DATABASE_URL: !!process.env.PRISMA_DATABASE_URL,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      NODE_ENV: process.env.NODE_ENV
    };
    
    const healthData = {
      timestamp: new Date().toISOString(),
      status: 'ok',
      database: dbStatus,
      authentication: authStatus,
      user: userInfo,
      environment: envCheck,
      headers: {
        host: request.headers.get('host'),
        userAgent: request.headers.get('user-agent'),
        cookie: request.headers.get('cookie') ? 'present' : 'missing'
      }
    };
    
    console.log('Health check result:', JSON.stringify(healthData, null, 2));
    
    return NextResponse.json(healthData);
    
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}