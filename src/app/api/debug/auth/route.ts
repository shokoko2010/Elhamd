import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedUser } from '@/lib/unified-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUnifiedUser(request);
    
    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'No authenticated user found',
        headers: {
          cookie: request.headers.get('cookie') ? 'present' : 'missing'
        }
      }, { status: 401 });
    }
    
    return NextResponse.json({
      status: 'success',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        permissions: user.permissions.slice(0, 5), // Show first 5 permissions
        totalPermissions: user.permissions.length
      }
    });
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}