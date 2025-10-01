interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUnifiedAuth, createUnauthorizedResponse } from '@/lib/unified-auth';

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const { params } = context;
    const { id } = await params;

    const budget = await db.branchBudget.findUnique({
      where: { id },
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
    });

    if (!budget) {
      return NextResponse.json({ error: 'الميزانية غير موجودة' }, { status: 404 });
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error fetching branch budget:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب بيانات الميزانية' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user || !['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user.role)) {
      return createUnauthorizedResponse();
    }

    const { params } = context;
    const { id } = await params;

    const body = await request.json();
    const {
      allocated,
      description,
      status,
      action, // approve, update_spent
    } = body;

    // التحقق من وجود الميزانية
    const budget = await db.branchBudget.findUnique({
      where: { id },
    });

    if (!budget) {
      return NextResponse.json({ error: 'الميزانية غير موجودة' }, { status: 404 });
    }

    // التحقق من صلاحية المستخدم في الفرع
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      const userPermission = await db.branchPermission.findFirst({
        where: {
          userId: user.id,
          branchId: budget.branchId,
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

      if (!userPermission && userBranch?.branchId !== budget.branchId) {
        return NextResponse.json(
          { error: 'ليس لديك صلاحية لإدارة ميزانيات هذا الفرع' },
          { status: 403 }
        );
      }
    }

    let updatedBudget;

    switch (action) {
      case 'approve':
        updatedBudget = await db.branchBudget.update({
          where: { id },
          data: {
            approvedBy: user.id,
            approvedAt: new Date(),
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
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        break;

      case 'update_spent':
        const spent = body.spent || 0;
        const remaining = budget.allocated - spent;
        
        updatedBudget = await db.branchBudget.update({
          where: { id },
          data: {
            spent,
            remaining: Math.max(0, remaining),
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
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        break;

      default:
        updatedBudget = await db.branchBudget.update({
          where: { id },
          data: {
            ...(allocated !== undefined && { 
              allocated,
              remaining: allocated - budget.spent 
            }),
            ...(description !== undefined && { description }),
            ...(status !== undefined && { status }),
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
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
    }

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error('Error updating branch budget:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث ميزانية الفرع' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return createUnauthorizedResponse();
    }

    const { params } = context;
    const { id } = await params;

    // التحقق من وجود الميزانية
    const budget = await db.branchBudget.findUnique({
      where: { id },
    });

    if (!budget) {
      return NextResponse.json({ error: 'الميزانية غير موجودة' }, { status: 404 });
    }

    // التحقق من حالة الميزانية
    if (budget.spent > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف ميزانية بها مصروفات' },
        { status: 400 }
      );
    }

    await db.branchBudget.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'تم حذف الميزانية بنجاح' });
  } catch (error) {
    console.error('Error deleting branch budget:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف ميزانية الفرع' },
      { status: 500 }
    );
  }
}