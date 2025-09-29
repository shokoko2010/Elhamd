interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUnifiedUser, createAuthHandler, UserRole } from '@/lib/unified-auth';

export async function GET(request: NextRequest) {
  try {
    const authHandler = createAuthHandler([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF])
    const auth = await authHandler(request)
    
    if (auth.error) {
      return auth.error
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const quarter = searchParams.get('quarter') ? parseInt(searchParams.get('quarter')!) : undefined;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
    const category = searchParams.get('category');

    const where: any = { year };
    
    if (branchId) {
      where.branchId = branchId;
    }
    
    if (quarter) {
      where.quarter = quarter;
    }
    
    if (month) {
      where.month = month;
    }
    
    if (category) {
      where.category = category;
    }

    const budgets = await db.branchBudget.findMany({
      where,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { branch: { name: 'asc' } },
        { year: 'desc' },
        { quarter: 'asc' },
        { month: 'asc' },
        { category: 'asc' },
      ],
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching branch budgets:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب ميزانيات الفروع' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHandler = createAuthHandler([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER])
    const auth = await authHandler(request)
    
    if (auth.error) {
      return auth.error
    }

    const user = auth.user

    const body = await request.json();
    const {
      branchId,
      year,
      quarter,
      month,
      category,
      allocated,
      description,
    } = body;

    // التحقق من وجود الفرع
    const branch = await db.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 400 });
    }

    // التحقق من صلاحية المستخدم في الفرع
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN) {
      const userPermission = await db.branchPermission.findFirst({
        where: {
          userId: user.id,
          branchId,
          permissions: {
            path: '$',
            array_contains: 'MANAGE_BUDGETS',
          },
        },
      });

      const userBranch = await db.user.findUnique({
        where: { id: user.id },
        select: { branchId: true },
      });

      if (!userPermission && userBranch?.branchId !== branchId) {
        return NextResponse.json(
          { error: 'ليس لديك صلاحية لإدارة ميزانيات هذا الفرع' },
          { status: 403 }
        );
      }
    }

    // التحقق من عدم وجود ميزانية مكررة
    const existingBudget = await db.branchBudget.findFirst({
      where: {
        branchId,
        year,
        quarter,
        month,
        category,
      },
    });

    if (existingBudget) {
      return NextResponse.json(
        { error: 'يوجد ميزانية لهذا الفرع في نفس الفترة والفئة' },
        { status: 400 }
      );
    }

    const budget = await db.branchBudget.create({
      data: {
        branchId,
        year,
        quarter,
        month,
        category,
        allocated,
        spent: 0,
        remaining: allocated,
        currency: branch.currency,
        description,
        createdBy: user.id,
        status: 'ACTIVE',
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating branch budget:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء ميزانية الفرع' },
      { status: 500 }
    );
  }
}