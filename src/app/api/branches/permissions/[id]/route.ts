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
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const permission = await db.branchPermission.findUnique({
      where: { id },
    });

    if (!permission) {
      return NextResponse.json({ error: 'الصلاحية غير موجودة' }, { status: 404 });
    }

    // Fetch related data separately
    const [userData, branchData, grantedByData] = await Promise.all([
      db.user.findUnique({
        where: { id: permission.userId },
        select: { id: true, name: true, email: true, role: true }
      }),
      db.branch.findUnique({
        where: { id: permission.branchId },
        select: { id: true, name: true, code: true }
      }),
      permission.grantedBy ? db.user.findUnique({
        where: { id: permission.grantedBy },
        select: { id: true, name: true, email: true }
      }) : null
    ]);

    const permissionWithRelations = { 
      ...permission, 
      user: userData, 
      branch: branchData, 
      grantedByUser: grantedByData 
    };

    return NextResponse.json(permissionWithRelations);
  } catch (error) {
    console.error('Error fetching branch permission:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب بيانات الصلاحية' },
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
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const {
      permissions,
      expiresAt,
    } = body;

    // التحقق من وجود الصلاحية
    const existingPermission = await db.branchPermission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      return NextResponse.json({ error: 'الصلاحية غير موجودة' }, { status: 404 });
    }

    const permission = await db.branchPermission.update({
      where: { id },
      data: {
        ...(permissions !== undefined && { permissions }),
        ...(expiresAt !== undefined && { 
          expiresAt: expiresAt ? new Date(expiresAt) : null 
        }),
      },
    });

    // Fetch related data separately
    const [userData, branchData, grantedByData] = await Promise.all([
      db.user.findUnique({
        where: { id: permission.userId },
        select: { id: true, name: true, email: true, role: true }
      }),
      db.branch.findUnique({
        where: { id: permission.branchId },
        select: { id: true, name: true, code: true }
      }),
      permission.grantedBy ? db.user.findUnique({
        where: { id: permission.grantedBy },
        select: { id: true, name: true, email: true }
      }) : null
    ]);

    const permissionWithRelations = { 
      ...permission, 
      user: userData, 
      branch: branchData, 
      grantedByUser: grantedByData 
    };

    return NextResponse.json(permissionWithRelations);
  } catch (error) {
    console.error('Error updating branch permission:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث صلاحية الفرع' },
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

    // التحقق من وجود الصلاحية
    const permission = await db.branchPermission.findUnique({
      where: { id },
    });

    if (!permission) {
      return NextResponse.json({ error: 'الصلاحية غير موجودة' }, { status: 404 });
    }

    await db.branchPermission.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'تم حذف الصلاحية بنجاح' });
  } catch (error) {
    console.error('Error deleting branch permission:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف صلاحية الفرع' },
      { status: 500 }
    );
  }
}