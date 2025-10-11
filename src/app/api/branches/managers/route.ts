interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const excludeBranchId = searchParams.get('excludeBranchId');

    const where: any = {
      role: { in: ['ADMIN', 'BRANCH_MANAGER', 'SUPER_ADMIN'] },
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // استبعاد المديرين الذين يديرون فروع أخرى
    const managedBranches = await db.branch.findMany({
      where: {
        managerId: { not: null },
        ...(excludeBranchId && { id: { not: excludeBranchId } }),
      },
      select: { managerId: true },
    });

    const managedManagerIds = managedBranches.map(b => b.managerId).filter(Boolean);

    if (managedManagerIds.length > 0) {
      where.id = { notIn: managedManagerIds };
    }

    const managers = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        branchId: true,
      },
      orderBy: [
        { role: 'desc' },
        { name: 'asc' },
      ],
    });

    // Fetch branch data separately
    const managersWithBranches = await Promise.all(
      managers.map(async (manager) => {
        const branch = manager.branchId ? await db.branch.findUnique({
          where: { id: manager.branchId },
          select: { id: true, name: true, code: true },
        }) : null;
        return { ...manager, branch };
      })
    );

    return NextResponse.json(managersWithBranches);
  } catch (error) {
    console.error('Error fetching branch managers:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب قائمة المديرين' },
      { status: 500 }
    );
  }
}