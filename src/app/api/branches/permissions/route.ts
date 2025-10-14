interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const branchId = searchParams.get('branchId');

    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (branchId) {
      where.branchId = branchId;
    }

    const permissions = await db.branchPermission.findMany({
      where,
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
      orderBy: [
        { branch: { name: 'asc' } },
        { user: { name: 'asc' } },
      ],
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching branch permissions:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب صلاحيات الفروع' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      branchId,
      permissions,
      expiresAt,
    } = body;

    // التحقق من وجود المستخدم والفرع
    const [targetUser, branch] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.branch.findUnique({ where: { id: branchId } }),
    ]);

    if (!targetUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 400 });
    }

    if (!branch) {
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 400 });
    }

    // التحقق من عدم وجود صلاحية مكررة
    const existingPermission = await db.branchPermission.findUnique({
      where: {
        userId_branchId: {
          userId,
          branchId,
        },
      },
    });

    if (existingPermission) {
      return NextResponse.json(
        { error: 'يوجد صلاحية لهذا المستخدم في هذا الفرع بالفعل' },
        { status: 400 }
      );
    }

    const permission = await db.branchPermission.create({
      data: {
        userId,
        branchId,
        permissions: permissions || [],
        grantedBy: user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
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

    return NextResponse.json(permission, { status: 201 });
  } catch (error) {
    console.error('Error creating branch permission:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء صلاحية الفرع' },
      { status: 500 }
    );
  }
}