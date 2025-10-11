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
    const type = searchParams.get('type'); // 'pending', 'my-approvals', 'history'
    const branchId = searchParams.get('branchId');

    let where: any = {};

    switch (type) {
      case 'pending':
        where.status = 'PENDING';
        break;
      case 'my-approvals':
        // Transfers that need user's approval based on their role and permissions
        if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
          where.status = 'PENDING';
        } else {
          // For managers, check branch permissions
          const userBranches = await db.branchPermission.findMany({
            where: {
              userId: user.id,
              isActive: true,
            },
            select: { branchId: true },
          });

          const branchIds = userBranches.map(b => b.branchId);
          if (branchIds.length === 0) {
            return NextResponse.json({ transfers: [] });
          }

          where = {
            status: 'PENDING',
            toBranchId: { in: branchIds },
          };
        }
        break;
      case 'history':
        where.status = { in: ['APPROVED', 'REJECTED', 'COMPLETED'] };
        break;
    }

    if (branchId) {
      where.OR = [
        { fromBranchId: branchId },
        { toBranchId: branchId },
      ];
    }

    const transfers = await db.branchTransfer.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 50, // Limit for performance
    });

    // Fetch related data separately
    const transfersWithRelations = await Promise.all(
      transfers.map(async (transfer) => {
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
        return { ...transfer, fromBranch, toBranch, requester, approver };
      })
    );

    // Calculate approval statistics
    const stats = await db.branchTransfer.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      where: branchId ? {
        OR: [
          { fromBranchId: branchId },
          { toBranchId: branchId },
        ],
      } : {},
    });

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      transfers: transfersWithRelations,
      stats: {
        pending: statsMap.PENDING || 0,
        approved: statsMap.APPROVED || 0,
        rejected: statsMap.REJECTED || 0,
        completed: statsMap.COMPLETED || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching approval data:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب بيانات الموافقات' },
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
    const { action, transferIds, rejectionReason, comments } = body;

    if (!action || !transferIds || !Array.isArray(transferIds)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const results: any[] = [];
    const errors: { transferId: any; error: string }[] = [];

    for (const transferId of transferIds) {
      try {
        const transfer = await db.branchTransfer.findUnique({
          where: { id: transferId },
        });

        if (!transfer) {
          errors.push({ transferId, error: 'التحويل غير موجود' });
          continue;
        }

        // Fetch related data separately
        const [fromBranch, toBranch] = await Promise.all([
          db.branch.findUnique({
            where: { id: transfer.fromBranchId },
            select: { id: true, name: true, code: true, currency: true }
          }),
          db.branch.findUnique({
            where: { id: transfer.toBranchId },
            select: { id: true, name: true, code: true, currency: true }
          })
        ]);

        if (!fromBranch || !toBranch) {
          errors.push({ transferId, error: 'الفرع غير موجود' });
          continue;
        }

        // Validate action based on transfer status and user permissions
        let canProceed = false;

        switch (action) {
          case 'approve':
          case 'reject':
            if (transfer.status !== 'PENDING') {
              errors.push({ transferId, error: 'التحويل ليس في حالة انتظار' });
              continue;
            }
            
            if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
              canProceed = true;
            } else {
              // For managers, check branch permissions
            const userPermissions = await db.branchPermission.findFirst({
              where: {
                userId: user.id,
                branchId: action === 'approve' ? transfer.toBranchId : transfer.fromBranchId,
                isActive: true,
              },
            });
            
            if (userPermissions && Array.isArray(userPermissions.permissions)) {
              const hasPermission = (userPermissions.permissions as any[]).includes(
                action === 'approve' ? 'APPROVE_TRANSFERS' : 'REJECT_TRANSFERS'
              );
              canProceed = hasPermission;
            }
            }
            break;

          case 'complete':
            if (transfer.status !== 'APPROVED') {
              errors.push({ transferId, error: 'التحويل غير معتمد' });
              continue;
            }
            
            if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
              canProceed = true;
            } else {
              // For managers, check branch permissions
            const userPermissions = await db.branchPermission.findFirst({
              where: {
                userId: user.id,
                branchId: transfer.toBranchId,
                isActive: true,
              },
            });
            
            if (userPermissions && Array.isArray(userPermissions.permissions)) {
              const hasPermission = (userPermissions.permissions as any[]).includes('COMPLETE_TRANSFERS');
              canProceed = hasPermission;
            }
            }
            break;

          default:
            errors.push({ transferId, error: 'إجراء غير صالح' });
            continue;
        }

        if (!canProceed) {
          errors.push({ transferId, error: 'ليس لديك صلاحية لهذا الإجراء' });
          continue;
        }

        // Execute the action
        const now = new Date();
        let updatedTransfer;

        switch (action) {
          case 'approve':
            updatedTransfer = await db.branchTransfer.update({
              where: { id: transferId },
              data: {
                status: 'APPROVED',
                approvedBy: user.id,
                approvedAt: now,
                metadata: {
                  ...(transfer.metadata as any || {}),
                  approvalComments: comments,
                  approvedAt: now.toISOString(),
                },
              },
            });

            // Create financial transactions
            await Promise.all([
              db.transaction.create({
                data: {
                  referenceId: `TRF-OUT-${transfer.referenceId}`,
                  branchId: transfer.fromBranchId,
                  type: 'EXPENSE',
                  category: 'TRANSFER_OUT',
                  amount: transfer.amount,
                  currency: transfer.currency,
                  description: `تحويل خارجي إلى ${toBranch.name}`,
                  date: now,
                  paymentMethod: 'BANK_TRANSFER',
                  metadata: {
                    transferId: transfer.id,
                    transferType: 'BRANCH_TRANSFER',
                    batchApproval: true,
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
                  description: `تحويل وارد من ${fromBranch.name}`,
                  date: now,
                  paymentMethod: 'BANK_TRANSFER',
                  metadata: {
                    transferId: transfer.id,
                    transferType: 'BRANCH_TRANSFER',
                    batchApproval: true,
                  },
                },
              }),
            ]);
            break;

          case 'reject':
            updatedTransfer = await db.branchTransfer.update({
              where: { id: transferId },
              data: {
                status: 'REJECTED',
                approvedBy: user.id,
                approvedAt: now,
                rejectedAt: now,
                rejectionReason,
                metadata: {
                  ...(transfer.metadata as any || {}),
                  rejectionComments: comments,
                  rejectedAt: now.toISOString(),
                },
              },
            });
            break;

          case 'complete':
            updatedTransfer = await db.branchTransfer.update({
              where: { id: transferId },
              data: {
                status: 'COMPLETED',
                completedAt: now,
                metadata: {
                  ...(transfer.metadata as any || {}),
                  completionComments: comments,
                  completedAt: now.toISOString(),
                },
              },
            });
            break;
        }

        results.push({
          transferId,
          status: 'success',
          transfer: updatedTransfer,
        });

      } catch (error) {
        console.error(`Error processing transfer ${transferId}:`, error);
        errors.push({ transferId, error: 'حدث خطأ في معالجة التحويل' });
      }
    }

    return NextResponse.json({
      results,
      errors,
      summary: {
        total: transferIds.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error('Error in bulk approval processing:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة الموافقات' },
      { status: 500 }
    );
  }
}