interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorize, UserRole } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG: Branch Managers API Called ===')
    
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })
    
    if (auth.error) {
      console.log('Auth failed:', auth.error)
      return auth.error
    }

    console.log('Auth successful for user:', auth.user.email)

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const excludeBranchId = searchParams.get('excludeBranchId');

    console.log('Search params:', { search, excludeBranchId })

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

    console.log('User where clause:', JSON.stringify(where, null, 2))

    // استبعاد المديرين الذين يديرون فروع أخرى
    const managedBranches = await db.branch.findMany({
      where: {
        managerId: { not: null },
        ...(excludeBranchId && { id: { not: excludeBranchId } }),
      },
      select: { managerId: true },
    });

    console.log('Managed branches found:', managedBranches.length)

    const managedManagerIds = managedBranches.map(b => b.managerId).filter(Boolean);

    if (managedManagerIds.length > 0) {
      where.id = { notIn: managedManagerIds };
    }

    console.log('Final where clause:', JSON.stringify(where, null, 2))

    const managers = await db.user.findMany({
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

    return NextResponse.json(managers);
  } catch (error) {
    console.error('Error fetching branch managers:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب قائمة المديرين' },
      { status: 500 }
    );
  }
}