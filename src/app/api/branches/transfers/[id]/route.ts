interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const transfer = await db.branchTransfer.findUnique({
      where: { id },
      include: {
        fromBranch: {
          select: {
            id: true,
            name: true,
            code: true,
            currency: true,
          },
        },
        toBranch: {
          select: {
            id: true,
            name: true,
            code: true,
            currency: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'التحويل غير موجود' }, { status: 404 });
    }

    return NextResponse.json(transfer);
  } catch (error) {
    console.error('Error fetching branch transfer:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب بيانات التحويل' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user || !['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { action, rejectionReason } = body;

    // التحقق من وجود التحويل
    const transfer = await db.branchTransfer.findUnique({
      where: { id },
      include: {
        fromBranch: true,
        toBranch: true,
      },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'التحويل غير موجود' }, { status: 404 });
    }

    // التحقق من حالة التحويل
    if (transfer.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'لا يمكن تعديل تحويل تمت معالجته بالفعل' },
        { status: 400 }
      );
    }

    let updatedTransfer;
    const now = new Date();

    switch (action) {
      case 'approve':
        // التحقق من صلاحية الموافقة
        if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
          const hasPermission = await db.branchPermission.findFirst({
            where: {
              userId: user.id,
              branchId: transfer.toBranchId,
              permissions: {
                path: '$',
                array_contains: 'APPROVE_TRANSFERS',
              },
            },
          });

          if (!hasPermission) {
            return NextResponse.json(
              { error: 'ليس لديك صلاحية للموافقة على التحويلات' },
              { status: 403 }
            );
          }
        }

        updatedTransfer = await db.branchTransfer.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvedBy: user.id,
            approvedAt: now,
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
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // إنشاء معاملات مالية للتحويل
        await Promise.all([
          db.transaction.create({
            data: {
              referenceId: `TRF-OUT-${transfer.referenceId}`,
              branchId: transfer.fromBranchId,
              type: 'EXPENSE',
              category: 'TRANSFER_OUT',
              amount: transfer.amount,
              currency: transfer.currency,
              description: `تحويل خارجي إلى ${transfer.toBranch.name}`,
              date: now,
              paymentMethod: 'BANK_TRANSFER',
              metadata: {
                transferId: transfer.id,
                transferType: 'BRANCH_TRANSFER',
              },
            },
          }),
          db.transaction.create({
            data: {
              referenceId: `TRF-IN-${transfer.referenceId}`,
              branchId: transfer.toBranchId,
              type: 'INCOME',
              category: 'TRANSFER_IN',
              amount: transfer.amount,
              currency: transfer.currency,
              description: `تحويل وارد من ${transfer.fromBranch.name}`,
              date: now,
              paymentMethod: 'BANK_TRANSFER',
              metadata: {
                transferId: transfer.id,
                transferType: 'BRANCH_TRANSFER',
              },
            },
          }),
        ]);
        break;

      case 'reject':
        // التحقق من صلاحية الرفض
        if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
          const hasPermission = await db.branchPermission.findFirst({
            where: {
              userId: user.id,
              branchId: transfer.fromBranchId,
              permissions: {
                path: '$',
                array_contains: 'REJECT_TRANSFERS',
              },
            },
          });

          if (!hasPermission) {
            return NextResponse.json(
              { error: 'ليس لديك صلاحية لرفض التحويلات' },
              { status: 403 }
            );
          }
        }

        updatedTransfer = await db.branchTransfer.update({
          where: { id },
          data: {
            status: 'REJECTED',
            approvedBy: user.id,
            approvedAt: now,
            rejectedAt: now,
            rejectionReason,
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
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        break;

      case 'complete':
        // التحقق من صلاحية الإكمال
        if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
          const hasPermission = await db.branchPermission.findFirst({
            where: {
              userId: user.id,
              branchId: transfer.toBranchId,
              permissions: {
                path: '$',
                array_contains: 'COMPLETE_TRANSFERS',
              },
            },
          });

          if (!hasPermission) {
            return NextResponse.json(
              { error: 'ليس لديك صلاحية لإكمال التحويلات' },
              { status: 403 }
            );
          }
        }

        if (transfer.status !== 'APPROVED') {
          return NextResponse.json(
            { error: 'لا يمكن إكمال تحويل غير معتمد' },
            { status: 400 }
          );
        }

        updatedTransfer = await db.branchTransfer.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            completedAt: now,
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
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        break;

      default:
        return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
    }

    return NextResponse.json(updatedTransfer);
  } catch (error) {
    console.error('Error updating branch transfer:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث حالة التحويل' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    // التحقق من وجود التحويل
    const transfer = await db.branchTransfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'التحويل غير موجود' }, { status: 404 });
    }

    // التحقق من حالة التحويل
    if (transfer.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'لا يمكن حذف تحويل تمت معالجته بالفعل' },
        { status: 400 }
      );
    }

    await db.branchTransfer.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'تم حذف التحويل بنجاح' });
  } catch (error) {
    console.error('Error deleting branch transfer:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف التحويل' },
      { status: 500 }
    );
  }
}