import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUnifiedUser, createAuthHandler, UserRole } from '@/lib/unified-auth';

export async function GET(request: NextRequest) {
  try {
    const authHandler = createAuthHandler([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    const auth = await authHandler(request)
    
    if (auth.error) {
      return auth.error
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const excludeBranchId = searchParams.get('excludeBranchId');

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

    return NextResponse.json(managers);
  } catch (error) {
    console.error('Error fetching branch managers:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب قائمة المديرين' },
      { status: 500 }
    );
  }
}