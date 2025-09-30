interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorize, UserRole } from '@/lib/unified-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF] })

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const period = searchParams.get('period') || 'month'; // day, week, month, year

    // إذا تم تحديد فرع معين، احصل على إحصائياته فقط
    if (branchId) {
      const branchStats = await getBranchStats(branchId, period);
      return NextResponse.json(branchStats);
    }

    // احصل على إحصائيات جميع الفروع
    const branches = await db.branch.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            users: true,
            vehicles: true,
            invoices: true,
            payments: true,
          },
        },
      },
    });

    const branchesWithStats = await Promise.all(
      branches.map(async (branch) => {
        const stats = await getBranchStats(branch.id, period);
        return {
          ...branch,
          stats,
        };
      })
    );

    // احسب الإجماليات
    const totals = {
      totalBranches: branches.length,
      totalUsers: branches.reduce((sum, b) => sum + b._count.users, 0),
      totalVehicles: branches.reduce((sum, b) => sum + b._count.vehicles, 0),
      totalInvoices: branches.reduce((sum, b) => sum + b._count.invoices, 0),
      totalPayments: branches.reduce((sum, b) => sum + b._count.payments, 0),
      totalRevenue: branchesWithStats.reduce((sum, b) => sum + b.stats.totalRevenue, 0),
      totalExpenses: branchesWithStats.reduce((sum, b) => sum + b.stats.totalExpenses, 0),
    };

    return NextResponse.json({
      branches: branchesWithStats,
      totals,
    });
  } catch (error) {
    console.error('Error fetching branches stats:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب إحصائيات الفروع' },
      { status: 500 }
    );
  }
}

async function getBranchStats(branchId: string, period: string) {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const [
    invoices,
    payments,
    transactions,
    users,
    vehicles,
  ] = await Promise.all([
    // الفواتير
    db.invoice.findMany({
      where: {
        branchId,
        createdAt: { gte: startDate },
      },
    }),
    // المدفوعات
    db.payment.findMany({
      where: {
        branchId,
        createdAt: { gte: startDate },
        status: 'COMPLETED',
      },
    }),
    // المعاملات المالية
    db.transaction.findMany({
      where: {
        branchId,
        date: { gte: startDate },
      },
    }),
    // المستخدمين النشطين
    db.user.count({
      where: {
        branchId,
        isActive: true,
      },
    }),
    // المركبات المتاحة
    db.vehicle.count({
      where: {
        branchId,
        status: 'AVAILABLE',
      },
    }),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const paidInvoices = invoices.filter(i => i.status === 'PAID').length;
  const pendingInvoices = invoices.filter(i => i.status === 'PENDING').length;
  const overdueInvoices = invoices.filter(i => 
    i.status === 'PENDING' && new Date(i.dueDate) < now
  ).length;

  const revenueByMonth = getRevenueByMonth(payments, period);
  const expensesByMonth = getExpensesByMonth(transactions, period);

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    totalInvoices: invoices.length,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    totalPayments: payments.length,
    activeUsers: users,
    availableVehicles: vehicles,
    revenueByMonth,
    expensesByMonth,
    averageInvoiceValue: invoices.length > 0 
      ? invoices.reduce((sum, i) => sum + i.totalAmount, 0) / invoices.length 
      : 0,
  };
}

function getRevenueByMonth(payments: any[], period: string) {
  const revenueByMonth: { [key: string]: number } = {};

  payments.forEach(payment => {
    const date = new Date(payment.createdAt);
    let key: string;

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date.getTime() - date.getDay() * 24 * 60 * 60 * 1000);
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    revenueByMonth[key] = (revenueByMonth[key] || 0) + payment.amount;
  });

  return Object.entries(revenueByMonth).map(([period, amount]) => ({
    period,
    amount,
  }));
}

function getExpensesByMonth(transactions: any[], period: string) {
  const expensesByMonth: { [key: string]: number } = {};

  transactions
    .filter(t => t.type === 'EXPENSE')
    .forEach(transaction => {
      const date = new Date(transaction.date);
      let key: string;

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date.getTime() - date.getDay() * 24 * 60 * 60 * 1000);
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      expensesByMonth[key] = (expensesByMonth[key] || 0) + transaction.amount;
    });

  return Object.entries(expensesByMonth).map(([period, amount]) => ({
    period,
    amount,
  }));
}