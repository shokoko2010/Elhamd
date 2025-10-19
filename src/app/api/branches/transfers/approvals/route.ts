interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!user || !['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(session.user.role)) {
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
        if (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN') {
          where.status = 'PENDING';
        } else {
          // For managers, check branch permissions
          const userBranches = await db.branchPermission.findMany({
            where: {
              userId: user.id,
              permissions: {
                path: '$',
                array_contains: 'APPROVE_TRANSFERS',
              },
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
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 50, // Limit for performance
    });

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
      transfers,
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
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!user || !['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { action, transferIds, rejectionReason, comments } = body;

    if (!action || !transferIds || !Array.isArray(transferIds)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const transferId of transferIds) {
      try {
        const transfer = await db.branchTransfer.findUnique({
          where: { id: transferId },
          include: {
            fromBranch: true,
            toBranch: true,
          },
        });

        if (!transfer) {
          errors.push({ transferId, error: 'التحويل غير موجود' });
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
            
            if (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN') {
              canProceed = true;
            } else {
              const hasPermission = await db.branchPermission.findFirst({
                where: {
                  userId: user.id,
                  branchId: action === 'approve' ? transfer.toBranchId : transfer.fromBranchId,
                  permissions: {
                    path: '$',
                    array_contains: action === 'approve' ? 'APPROVE_TRANSFERS' : 'REJECT_TRANSFERS',
                  },
                },
              });
              canProceed = !!hasPermission;
            }
            break;

          case 'complete':
            if (transfer.status !== 'APPROVED') {
              errors.push({ transferId, error: 'التحويل غير معتمد' });
              continue;
            }
            
            if (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN') {
              canProceed = true;
            } else {
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
              canProceed = !!hasPermission;
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
                  ...transfer.metadata,
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
                  description: `تحويل خارجي إلى ${transfer.toBranch.name}`,
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
                  description: `تحويل وارد من ${transfer.fromBranch.name}`,
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
                  ...transfer.metadata,
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
                  ...transfer.metadata,
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