interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorize, UserRole } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF] })

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

    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })

    if (auth.error) {
      console.log('Auth failed:', auth.error)
      return auth.error
    }

    console.log('Auth successful for user:', auth.user.email)

    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2))

    const {
      name,
      code,
      address,
      phone,
      email,
      managerId,
      currency,
      timezone,
      mapLat,
      mapLng,
      googleMapLink,
      settings,
      isActive,
    } = body;

    // التحقق من وجود الفرع
    const existingBranch = await db.branch.findUnique({
      where: { id },
    });

    if (!existingBranch) {
      console.log('Branch not found:', id)
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 404 });
    }

    console.log('Existing branch found:', existingBranch.name)

    // التحقق من عدم وجود فرع آخر بنفس الكود
    if (code && code !== existingBranch.code) {
      const branchWithSameCode = await db.branch.findUnique({
        where: { code },
      });

      if (branchWithSameCode) {
        console.log('Branch with same code exists:', code)
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
        console.log('Manager not found:', managerId)
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
        console.log('Manager already assigned to another branch:', managerId)
        return NextResponse.json(
          { error: 'هذا المستخدم يدير فرع آخر بالفعل' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      ...(name && { name }),
      ...(code && { code }),
      ...(address !== undefined && { address }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(managerId !== undefined && { managerId }),
      ...(currency && { currency }),
      ...(timezone && { timezone }),
      ...(mapLat !== undefined && { mapLat: mapLat ? parseFloat(mapLat) : null }),
      ...(mapLng !== undefined && { mapLng: mapLng ? parseFloat(mapLng) : null }),
      ...(googleMapLink !== undefined && { googleMapLink }),
      ...(settings !== undefined && { settings }),
      ...(isActive !== undefined && { isActive }),
    };

    console.log('Update data:', JSON.stringify(updateData, null, 2))

    const branch = await db.branch.update({
      where: { id },
      data: updateData,
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

    console.log('Branch updated successfully:', branch.name)
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
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })

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