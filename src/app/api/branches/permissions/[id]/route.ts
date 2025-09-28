import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const permission = await db.branchPermission.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        grantedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!permission) {
      return NextResponse.json({ error: 'الصلاحية غير موجودة' }, { status: 404 });
    }

    return NextResponse.json(permission);
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const {
      permissions,
      expiresAt,
    } = body;

    // التحقق من وجود الصلاحية
    const existingPermission = await db.branchPermission.findUnique({
      where: { id: params.id },
    });

    if (!existingPermission) {
      return NextResponse.json({ error: 'الصلاحية غير موجودة' }, { status: 404 });
    }

    const permission = await db.branchPermission.update({
      where: { id: params.id },
      data: {
        ...(permissions !== undefined && { permissions }),
        ...(expiresAt !== undefined && { 
          expiresAt: expiresAt ? new Date(expiresAt) : null 
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        grantedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(permission);
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    // التحقق من وجود الصلاحية
    const permission = await db.branchPermission.findUnique({
      where: { id: params.id },
    });

    if (!permission) {
      return NextResponse.json({ error: 'الصلاحية غير موجودة' }, { status: 404 });
    }

    await db.branchPermission.delete({
      where: { id: params.id },
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