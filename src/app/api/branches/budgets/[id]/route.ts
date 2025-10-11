interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const budget = await db.branchBudget.findUnique({
      where: { id }
    });

    if (!budget) {
      return NextResponse.json({ error: 'الميزانية غير موجودة' }, { status: 404 });
    }

    // Fetch related data separately
    const [branch, creator, approver] = await Promise.all([
      db.branch.findUnique({ where: { id: budget.branchId } }),
      db.user.findUnique({ where: { id: budget.createdBy } }),
      budget.approvedBy ? db.user.findUnique({ where: { id: budget.approvedBy } }) : null
    ])

    const budgetWithRelations = { ...budget, branch, creator, approver }

    return NextResponse.json(budgetWithRelations);
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
    const { id } = await context.params
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

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
          isActive: true,
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
        });

        // Fetch related data separately
        const [branchData, creatorData, approverData] = await Promise.all([
          db.branch.findUnique({ where: { id: updatedBudget.branchId } }),
          db.user.findUnique({ where: { id: updatedBudget.createdBy } }),
          updatedBudget.approvedBy ? db.user.findUnique({ where: { id: updatedBudget.approvedBy } }) : null
        ])
        
        updatedBudget = { ...updatedBudget, branch: branchData, creator: creatorData, approver: approverData }
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
        });

        // Fetch related data separately
        const [branchData2, creatorData2, approverData2] = await Promise.all([
          db.branch.findUnique({ where: { id: updatedBudget.branchId } }),
          db.user.findUnique({ where: { id: updatedBudget.createdBy } }),
          updatedBudget.approvedBy ? db.user.findUnique({ where: { id: updatedBudget.approvedBy } }) : null
        ])
        
        updatedBudget = { ...updatedBudget, branch: branchData2, creator: creatorData2, approver: approverData2 }
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
        });

        // Fetch related data separately
        const [branchData3, creatorData3, approverData3] = await Promise.all([
          db.branch.findUnique({ where: { id: updatedBudget.branchId } }),
          db.user.findUnique({ where: { id: updatedBudget.createdBy } }),
          updatedBudget.approvedBy ? db.user.findUnique({ where: { id: updatedBudget.approvedBy } }) : null
        ])
        
        updatedBudget = { ...updatedBudget, branch: branchData3, creator: creatorData3, approver: approverData3 }
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
    const { id } = await context.params
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

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