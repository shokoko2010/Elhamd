interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requireSimpleAuth } from '@/lib/auth';
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    const user = await requireSimpleAuth()

    if (!(['ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF'] as const).includes(user.role as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const branch = await db.branch.findUnique({
      where: { id }
    });

    if (!branch) {
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 });
    }

    // Fetch manager separately if managerId exists
    let manager: any = null
    if (branch.managerId) {
      manager = await db.user.findUnique({
        where: { id: branch.managerId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });
    }

    const branchWithManager = { ...branch, manager }

    return NextResponse.json(branchWithManager);
  } catch (error) {
    console.error('Error fetching branch:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب بيانات الفرع' },
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
    const user = await requireSimpleAuth()

    if (!(['ADMIN', 'SUPER_ADMIN'] as const).includes(user.role as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json();
    const {
      name,
      code,
      address,
      phone,
      email,
      managerId,
      currency,
      timezone,
      settings,
      isActive,
    } = body;

    // التحقق من وجود الفرع
    const existingBranch = await db.branch.findUnique({
      where: { id },
    });

    if (!existingBranch) {
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 });
    }

    // التحقق من عدم وجود فرع آخر بنفس الكود
    if (code && code !== existingBranch.code) {
      const branchWithSameCode = await db.branch.findUnique({
        where: { code },
      });

      if (branchWithSameCode) {
        return NextResponse.json(
          { error: 'يوجد فرع آخر بهذا الكود' },
          { status: 400 }
        );
      }
    }

    // التحقق من المدير إذا تم تغييره
    if (managerId && managerId !== existingBranch.managerId) {
      const manager = await db.user.findUnique({
        where: { id: managerId },
      });

      if (!manager) {
        return NextResponse.json(
          { error: 'المدير المحدد غير موجود' },
          { status: 400 }
        );
      }

      // التحقق من أن المدير لا يدير فرع آخر
      const existingManagerBranch = await db.branch.findUnique({
        where: { managerId },
      });

      if (existingManagerBranch && existingManagerBranch.id !== id) {
        return NextResponse.json(
          { error: 'هذا المستخدم يدير فرع آخر بالفعل' },
          { status: 400 }
        );
      }
    }

    const branch = await db.branch.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(managerId !== undefined && { managerId }),
        ...(currency && { currency }),
        ...(timezone && { timezone }),
        ...(settings !== undefined && { settings }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Fetch manager separately if managerId exists
    let manager: any = null
    if (branch.managerId) {
      manager = await db.user.findUnique({
        where: { id: branch.managerId },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    }

    const branchWithManager = { ...branch, manager }

    return NextResponse.json(branchWithManager);
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث بيانات الفرع' },
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
    const user = await requireSimpleAuth()

    if (!(['ADMIN', 'SUPER_ADMIN'] as const).includes(user.role as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // التحقق من وجود الفرع
    const branch = await db.branch.findUnique({
      where: { id }
    });

    if (!branch) {
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 });
    }

    // Simple check - in production you might want to add more sophisticated checks
    // For now, we'll allow deletion if the branch exists

    await db.branch.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'تم حذف الفرع بنجاح' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الفرع' },
      { status: 500 }
    );
  }
}