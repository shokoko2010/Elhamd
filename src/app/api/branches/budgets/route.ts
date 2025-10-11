interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF'].includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
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
      orderBy: [
        { branchId: 'asc' },
        { year: 'desc' },
        { quarter: 'asc' },
        { month: 'asc' },
        { category: 'asc' },
      ],
    });

    // Fetch related data separately
    const budgetsWithRelations = await Promise.all(
      budgets.map(async (budget) => {
        const [branch, creator, approver] = await Promise.all([
          db.branch.findUnique({ 
            where: { id: budget.branchId },
            select: { id: true, name: true, code: true }
          }),
          db.user.findUnique({ 
            where: { id: budget.createdBy },
            select: { id: true, name: true, email: true }
          }),
          budget.approvedBy ? db.user.findUnique({ 
            where: { id: budget.approvedBy },
            select: { id: true, name: true, email: true }
          }) : null
        ]);
        return { ...budget, branch, creator, approver };
      })
    );

    return NextResponse.json(budgetsWithRelations);
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
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER'].includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

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
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      const userPermission = await db.branchPermission.findFirst({
        where: {
          userId: user.id,
          branchId,
          isActive: true,
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
    });

    // Fetch related data separately
    const [branchData, creatorData] = await Promise.all([
      db.branch.findUnique({ 
        where: { id: budget.branchId },
        select: { id: true, name: true, code: true }
      }),
      db.user.findUnique({ 
        where: { id: budget.createdBy },
        select: { id: true, name: true, email: true }
      })
    ]);

    const budgetWithRelations = { ...budget, branch: branchData, creator: creatorData };

    return NextResponse.json(budgetWithRelations, { status: 201 });
  } catch (error) {
    console.error('Error creating branch budget:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء ميزانية الفرع' },
      { status: 500 }
    );
  }
}