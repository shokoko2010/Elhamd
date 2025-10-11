interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const fromBranchId = searchParams.get('fromBranchId');
    const toBranchId = searchParams.get('toBranchId');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (fromBranchId) {
      where.fromBranchId = fromBranchId;
    }
    
    if (toBranchId) {
      where.toBranchId = toBranchId;
    }

    const [transfers, total] = await Promise.all([
      db.branchTransfer.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      db.branchTransfer.count({ where }),
    ]);

    // Fetch related data separately
    const transfersWithRelations = await Promise.all(
      transfers.map(async (transfer) => {
        const [fromBranch, toBranch, requester, approver] = await Promise.all([
          db.branch.findUnique({
            where: { id: transfer.fromBranchId },
            select: { id: true, name: true, code: true }
          }),
          db.branch.findUnique({
            where: { id: transfer.toBranchId },
            select: { id: true, name: true, code: true }
          }),
          db.user.findUnique({
            where: { id: transfer.requestedBy },
            select: { id: true, name: true, email: true }
          }),
          transfer.approvedBy ? db.user.findUnique({
            where: { id: transfer.approvedBy },
            select: { id: true, name: true, email: true }
          }) : null
        ]);
        return { ...transfer, fromBranch, toBranch, requester, approver };
      })
    );

    return NextResponse.json({
      transfers: transfersWithRelations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching branch transfers:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب التحويلات بين الفروع' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fromBranchId,
      toBranchId,
      amount,
      currency,
      description,
    } = body;

    // التحقق من وجود الفروع
    const [fromBranch, toBranch] = await Promise.all([
      db.branch.findUnique({ where: { id: fromBranchId } }),
      db.branch.findUnique({ where: { id: toBranchId } }),
    ]);

    if (!fromBranch) {
      return NextResponse.json({ error: 'الفرع المصدر غير موجود' }, { status: 400 });
    }

    if (!toBranch) {
      return NextResponse.json({ error: 'الفرع المستهدف غير موجود' }, { status: 400 });
    }

    if (fromBranchId === toBranchId) {
      return NextResponse.json(
        { error: 'لا يمكن التحويل من نفس الفرع إلى نفسه' },
        { status: 400 }
      );
    }

    // التحقق من صلاحية المستخدم في الفرع المصدر
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      const userPermission = await db.branchPermission.findFirst({
        where: {
          userId: user.id,
          branchId: fromBranchId,
        },
      });

      const userBranch = await db.user.findUnique({
        where: { id: user.id },
        select: { branchId: true },
      });

      if (!userPermission && userBranch?.branchId !== fromBranchId) {
        return NextResponse.json(
          { error: 'ليس لديك صلاحية للتحويل من هذا الفرع' },
          { status: 403 }
        );
      }
    }

    // إنشاء مرجع فريد للتحويل
    const referenceId = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const transfer = await db.branchTransfer.create({
      data: {
        referenceId,
        fromBranchId,
        toBranchId,
        amount,
        currency: currency || 'EGP',
        description,
        requestedBy: user.id,
        status: 'PENDING',
      },
    });

    // Fetch related data separately
    const [transferFromBranch, transferToBranch, requester] = await Promise.all([
      db.branch.findUnique({
        where: { id: transfer.fromBranchId },
        select: { id: true, name: true, code: true }
      }),
      db.branch.findUnique({
        where: { id: transfer.toBranchId },
        select: { id: true, name: true, code: true }
      }),
      db.user.findUnique({
        where: { id: transfer.requestedBy },
        select: { id: true, name: true, email: true }
      })
    ]);

    const transferWithRelations = {
      ...transfer,
      fromBranch: transferFromBranch,
      toBranch: transferToBranch,
      requester
    };

    return NextResponse.json(transferWithRelations, { status: 201 });
  } catch (error) {
    console.error('Error creating branch transfer:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء تحويل الفرع' },
      { status: 500 }
    );
  }
}