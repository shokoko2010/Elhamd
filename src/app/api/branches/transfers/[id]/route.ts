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

    const transfer = await db.branchTransfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'التحويل غير موجود' }, { status: 404 });
    }

    // Fetch related data separately
    const [fromBranch, toBranch, requester, approver] = await Promise.all([
      db.branch.findUnique({
        where: { id: transfer.fromBranchId },
        select: { id: true, name: true, code: true, currency: true }
      }),
      db.branch.findUnique({
        where: { id: transfer.toBranchId },
        select: { id: true, name: true, code: true, currency: true }
      }),
      db.user.findUnique({
        where: { id: transfer.requestedBy },
        select: { id: true, name: true, email: true, role: true }
      }),
      transfer.approvedBy ? db.user.findUnique({
        where: { id: transfer.approvedBy },
        select: { id: true, name: true, email: true, role: true }
      }) : null
    ]);

    const transferWithRelations = { 
      ...transfer, 
      fromBranch, 
      toBranch, 
      requester, 
      approver 
    };

    return NextResponse.json(transferWithRelations);
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
    const { id } = await context.params
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { action, rejectionReason } = body;

    // التحقق من وجود التحويل
    const transfer = await db.branchTransfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'التحويل غير موجود' }, { status: 404 });
    }

    // التحقق من حالة التحويل
    if (transfer.status !== 'PENDING' as any) {
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
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
          const hasPermission = await db.branchPermission.findFirst({
            where: {
              userId: user.id,
              branchId: transfer.toBranchId,
              isActive: true,
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
        });

        // Fetch branch names for transaction descriptions
        const [fromBranch, toBranch] = await Promise.all([
          db.branch.findUnique({ where: { id: transfer.fromBranchId }, select: { name: true } }),
          db.branch.findUnique({ where: { id: transfer.toBranchId }, select: { name: true } })
        ]);

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
              description: `تحويل خارجي إلى ${toBranch?.name || 'فرع آخر'}`,
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
              description: `تحويل وارد من ${fromBranch?.name || 'فرع آخر'}`,
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
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
          const hasPermission = await db.branchPermission.findFirst({
            where: {
              userId: user.id,
              branchId: transfer.fromBranchId,
              isActive: true,
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
        });
        break;

      case 'complete':
        // التحقق من صلاحية الإكمال
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
          const hasPermission = await db.branchPermission.findFirst({
            where: {
              userId: user.id,
              branchId: transfer.toBranchId,
              isActive: true,
            },
          });

          if (!hasPermission) {
            return NextResponse.json(
              { error: 'ليس لديك صلاحية لإكمال التحويلات' },
              { status: 403 }
            );
          }
        }

        if (transfer.status !== 'APPROVED' as any) {
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
        });
        break;

      default:
        return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
    }

    // Fetch related data for the response
    const [fromBranch, toBranch, requester, approver] = await Promise.all([
      db.branch.findUnique({
        where: { id: updatedTransfer.fromBranchId },
        select: { id: true, name: true, code: true, currency: true }
      }),
      db.branch.findUnique({
        where: { id: updatedTransfer.toBranchId },
        select: { id: true, name: true, code: true, currency: true }
      }),
      db.user.findUnique({
        where: { id: updatedTransfer.requestedBy },
        select: { id: true, name: true, email: true, role: true }
      }),
      updatedTransfer.approvedBy ? db.user.findUnique({
        where: { id: updatedTransfer.approvedBy },
        select: { id: true, name: true, email: true, role: true }
      }) : null
    ]);

    const transferWithRelations = { 
      ...updatedTransfer, 
      fromBranch, 
      toBranch, 
      requester, 
      approver 
    };

    return NextResponse.json(transferWithRelations);
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
    const { id } = await context.params
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role as any)) {
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
    if (transfer.status !== 'PENDING' as any) {
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