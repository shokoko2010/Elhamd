interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorize, UserRole } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== BRANCH MANAGERS API: START ===')
    
    // Step 1: Check authentication
    let authUser;
    try {
      const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })
      if (auth.error) {
        console.log('Auth failed:', auth.error)
        return auth.error
      }
      authUser = auth.user
      console.log('Auth successful for user:', authUser.email)
    } catch (authError) {
      console.error('Auth exception:', authError)
      return NextResponse.json(
        { error: 'Authentication failed', details: authError instanceof Error ? authError.message : 'Unknown auth error' },
        { status: 401 }
      )
    }

    // Step 2: Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const excludeBranchId = searchParams.get('excludeBranchId');
    console.log('Query params:', { search, excludeBranchId })

    // Step 3: Build base query
    const where: any = {
      role: { in: [UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN] },
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    console.log('Base where clause:', JSON.stringify(where, null, 2))

    // Step 4: Get managed branches (with error handling)
    let managedBranches = [];
    try {
      managedBranches = await db.branch.findMany({
        where: {
          managerId: { not: null },
          ...(excludeBranchId && { id: { not: excludeBranchId } }),
        },
        select: { managerId: true },
      });
      console.log('Managed branches found:', managedBranches.length)
    } catch (branchError) {
      console.error('Error fetching managed branches:', branchError)
      // Continue without excluding managed branches
    }

    // Step 5: Exclude already assigned managers
    const managedManagerIds = managedBranches.map(b => b.managerId).filter(Boolean);
    if (managedManagerIds.length > 0) {
      where.id = { notIn: managedManagerIds };
    }

    console.log('Final where clause:', JSON.stringify(where, null, 2))

    // Step 6: Fetch managers (with error handling)
    let managers = [];
    try {
      managers = await db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: [
          { role: 'desc' },
          { name: 'asc' },
        ],
      });
      console.log('Managers found:', managers.length)
    } catch (managersError) {
      console.error('Error fetching managers:', managersError)
      return NextResponse.json(
        { error: 'Failed to fetch managers', details: managersError instanceof Error ? managersError.message : 'Unknown error' },
        { status: 500 }
      )
    }

    console.log('=== BRANCH MANAGERS API: SUCCESS ===')
    return NextResponse.json(managers);
    
  } catch (error) {
    console.error('=== BRANCH MANAGERS API: ERROR ===', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في جلب قائمة المديرين',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}