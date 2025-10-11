interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
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
      orderBy: [
        { branchId: 'asc' },
        { userId: 'asc' },
      ],
    });

    // Fetch related data separately
    const permissionsWithRelations = await Promise.all(
      permissions.map(async (permission) => {
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
        return { ...permission, user: userData, branch: branchData, grantedByUser: grantedByData };
      })
    );

    return NextResponse.json(permissionsWithRelations);
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
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role as any)) {
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
      db.user.findUnique({
        where: { id: permission.grantedBy! },
        select: { id: true, name: true, email: true }
      })
    ]);

    const permissionWithRelations = { 
      ...permission, 
      user: userData, 
      branch: branchData, 
      grantedByUser: grantedByData 
    };

    return NextResponse.json(permissionWithRelations, { status: 201 });
  } catch (error) {
    console.error('Error creating branch permission:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء صلاحية الفرع' },
      { status: 500 }
    );
  }
}