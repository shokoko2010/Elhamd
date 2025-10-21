import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG API CALLED ===');
    
    // Check environment
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET'
    }
    console.log('Environment:', env);
    
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
        suggestion: 'Please log in first',
        environment: env
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
        requiredRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
        environment: env
      }, { status: 403 });
    }
    
    // Step 3: Test database connection
    let dbStatus = 'OK';
    let dbError = null;
    try {
      const count = await db.invoice.count();
      console.log('Database OK, invoice count:', count);
    } catch (error) {
      dbStatus = 'ERROR';
      dbError = error instanceof Error ? error.message : 'Unknown error';
      console.error('Database error:', dbError);
    }
    
    // Step 4: Test database query for users
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
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: env
      }, { status: 500 });
    }
    
    // Step 5: Test database query for branches
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
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: env
      }, { status: 500 });
    }
    
    // Step 6: Test finance APIs - check for sample invoice
    let sampleInvoice = null;
    let invoiceError = null;
    try {
      sampleInvoice = await db.invoice.findFirst({
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          totalAmount: true,
          paidAmount: true,
          currency: true
        }
      });
      console.log('Sample invoice:', sampleInvoice?.invoiceNumber || 'None found');
    } catch (error) {
      invoiceError = error instanceof Error ? error.message : 'Unknown error';
      console.error('Invoice query failed:', invoiceError);
    }
    
    // Step 7: Simulate the managers query
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
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: env
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      environment: env,
      health: {
        database: { status: dbStatus, error: dbError },
        authentication: 'success',
        finance: {
          sampleInvoice: sampleInvoice ? {
            id: sampleInvoice.id,
            number: sampleInvoice.invoiceNumber,
            status: sampleInvoice.status,
            total: sampleInvoice.totalAmount,
            paid: sampleInvoice.paidAmount
          } : null,
          error: invoiceError
        }
      },
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
          managers: managers.length,
          invoices: sampleInvoice ? 1 : 0
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
        stack: error instanceof Error ? error.stack : undefined,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: process.env.VERCEL,
          VERCEL_ENV: process.env.VERCEL_ENV
        }
      },
      { status: 500 }
    );
  }
}