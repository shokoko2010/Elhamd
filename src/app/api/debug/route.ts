import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG API CALLED ===');
    
    // Step 1: Check authentication
    const authUser = await getAuthUser();
    console.log('Auth user:', authUser ? {
      id: authUser.id,
      email: authUser.email,
      role: authUser.role
    } : 'null');
    
    if (!authUser) {
      return NextResponse.json({
        error: 'Not authenticated',
        step: 'auth',
        suggestion: 'Please log in first'
      }, { status: 401 });
    }
    
    // Step 2: Check role
    const hasRequiredRole = authUser.role === UserRole.ADMIN || authUser.role === UserRole.SUPER_ADMIN;
    console.log('User role:', authUser.role, 'Required role check:', hasRequiredRole);
    
    if (!hasRequiredRole) {
      return NextResponse.json({
        error: 'Insufficient permissions',
        step: 'role',
        userRole: authUser.role,
        requiredRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
      }, { status: 403 });
    }
    
    // Step 3: Test database query for users
    let usersCount = 0;
    let users = [];
    try {
      users = await db.user.findMany({
        where: {
          role: { in: [UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN] },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        take: 5 // Limit for debugging
      });
      usersCount = users.length;
      console.log('Found users:', usersCount);
    } catch (error) {
      console.error('Database query failed:', error);
      return NextResponse.json({
        error: 'Database query failed',
        step: 'database',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Step 4: Test database query for branches
    let branchesCount = 0;
    let branches = [];
    try {
      branches = await db.branch.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          managerId: true,
        },
        take: 5 // Limit for debugging
      });
      branchesCount = branches.length;
      console.log('Found branches:', branchesCount);
    } catch (error) {
      console.error('Branch query failed:', error);
      return NextResponse.json({
        error: 'Branch query failed',
        step: 'branches',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Step 5: Simulate the managers query
    let managers = [];
    try {
      const where: any = {
        role: { in: [UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN] },
        isActive: true,
      };

      const managedBranches = await db.branch.findMany({
        where: {
          managerId: { not: null },
        },
        select: { managerId: true },
      });

      const managedManagerIds = managedBranches.map(b => b.managerId).filter(Boolean);

      if (managedManagerIds.length > 0) {
        where.id = { notIn: managedManagerIds };
      }

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
        take: 10 // Limit for debugging
      });
      
      console.log('Found managers:', managers.length);
    } catch (error) {
      console.error('Managers query failed:', error);
      return NextResponse.json({
        error: 'Managers query failed',
        step: 'managers',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        step: 'complete',
        authentication: 'success',
        database: 'success',
        queries: 'success'
      },
      data: {
        authUser: {
          id: authUser.id,
          email: authUser.email,
          role: authUser.role,
          permissionsCount: authUser.permissions.length
        },
        counts: {
          users: usersCount,
          branches: branchesCount,
          managers: managers.length
        },
        sampleData: {
          users: users.slice(0, 2),
          branches: branches.slice(0, 2),
          managers: managers.slice(0, 2)
        }
      }
    });
    
  } catch (error) {
    console.error('Debug API failed:', error);
    return NextResponse.json(
      { 
        error: 'Debug API failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}