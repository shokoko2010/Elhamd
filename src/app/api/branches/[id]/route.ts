interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUnifiedUser, createAuthHandler, UserRole } from '@/lib/unified-auth';

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    const authHandler = createAuthHandler([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF])
    const auth = await authHandler(request)
    
    if (auth.error) {
      return auth.error
    }

    const branch = await db.branch.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            users: true,
            vehicles: true,
            invoices: true,
            payments: true,
            transactions: true,
            inventory: true,
          },
        },
      },
    });

    if (!branch) {
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 });
    }

    return NextResponse.json(branch);
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
    const authHandler = createAuthHandler([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    const auth = await authHandler(request)
    
    if (auth.error) {
      return auth.error
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
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(branch);
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
    const authHandler = createAuthHandler([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    const auth = await authHandler(request)
    
    if (auth.error) {
      return auth.error
    }

    // التحقق من وجود الفرع
    const branch = await db.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            vehicles: true,
            invoices: true,
            payments: true,
            transactions: true,
            inventory: true,
          },
        },
      },
    });

    if (!branch) {
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 });
    }

    // التحقق من أن الفرع لا يحتوي على بيانات مرتبطة
    const hasRelatedData = 
      branch._count.users > 0 ||
      branch._count.vehicles > 0 ||
      branch._count.invoices > 0 ||
      branch._count.payments > 0 ||
      branch._count.transactions > 0 ||
      branch._count.inventory > 0;

    if (hasRelatedData) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الفرع لأنه يحتوي على بيانات مرتبطة' },
        { status: 400 }
      );
    }

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