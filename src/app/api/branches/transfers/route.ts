import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user) {
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
        include: {
          fromBranch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          toBranch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          requester: {
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
        orderBy: [
          { status: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      db.branchTransfer.count({ where }),
    ]);

    return NextResponse.json({
      transfers,
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
    const user = await requireUnifiedAuth(request);
    if (!user || !['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(session.user.role)) {
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
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
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
      include: {
        fromBranch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        toBranch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error('Error creating branch transfer:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء تحويل الفرع' },
      { status: 500 }
    );
  }
}