interface RouteParams {
  params: Promise<{ id: string }>
}

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
    const period = searchParams.get('period') || 'month'; // day, week, month, year
    const branchIds = searchParams.get('branchIds')?.split(',').filter(Boolean);
    const reportType = searchParams.get('type') || 'overview'; // overview, comparison, detailed

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

    // جلب الفروع المطلوبة
    const whereBranch: any = { isActive: true };
    if (branchIds && branchIds.length > 0) {
      whereBranch.id = { in: branchIds };
    }

    const branches = await db.branch.findMany({
      where: whereBranch,
      select: {
        id: true,
        name: true,
        code: true,
        currency: true,
      },
    });

    // جلب البيانات المالية لجميع الفروع
    const branchesData = await Promise.all(
      branches.map(async (branch) => {
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
              branchId: branch.id,
              createdAt: { gte: startDate },
            },
          }),
          // المدفوعات
          db.payment.findMany({
            where: {
              branchId: branch.id,
              createdAt: { gte: startDate },
              status: 'COMPLETED',
            },
          }),
          // المعاملات المالية
          db.transaction.findMany({
            where: {
              branchId: branch.id,
              date: { gte: startDate },
            },
          }),
          // المستخدمين النشطين
          db.user.count({
            where: {
              branchId: branch.id,
              isActive: true,
            },
          }),
          // المركبات المتاحة
          db.vehicle.count({
            where: {
              branchId: branch.id,
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

        const revenueByCategory = getRevenueByCategory(invoices, payments);
        const expensesByCategory = getExpensesByCategory(transactions);

        return {
          branch,
          stats: {
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
            averageInvoiceValue: invoices.length > 0 
              ? invoices.reduce((sum, i) => sum + i.totalAmount, 0) / invoices.length 
              : 0,
            revenueByCategory,
            expensesByCategory,
          },
        };
      })
    );

    // حساب الإجماليات
    const totals = {
      totalRevenue: branchesData.reduce((sum, b) => sum + b.stats.totalRevenue, 0),
      totalExpenses: branchesData.reduce((sum, b) => sum + b.stats.totalExpenses, 0),
      totalNetProfit: branchesData.reduce((sum, b) => sum + b.stats.netProfit, 0),
      totalInvoices: branchesData.reduce((sum, b) => sum + b.stats.totalInvoices, 0),
      totalPaidInvoices: branchesData.reduce((sum, b) => sum + b.stats.paidInvoices, 0),
      totalPendingInvoices: branchesData.reduce((sum, b) => sum + b.stats.pendingInvoices, 0),
      totalOverdueInvoices: branchesData.reduce((sum, b) => sum + b.stats.overdueInvoices, 0),
      totalPayments: branchesData.reduce((sum, b) => sum + b.stats.totalPayments, 0),
      totalActiveUsers: branchesData.reduce((sum, b) => sum + b.stats.activeUsers, 0),
      totalAvailableVehicles: branchesData.reduce((sum, b) => sum + b.stats.availableVehicles, 0),
    };

    // حساب متوسط القيم
    const averages = {
      averageRevenue: branchesData.length > 0 ? totals.totalRevenue / branchesData.length : 0,
      averageExpenses: branchesData.length > 0 ? totals.totalExpenses / branchesData.length : 0,
      averageNetProfit: branchesData.length > 0 ? totals.totalNetProfit / branchesData.length : 0,
      averageInvoiceValue: totals.totalInvoices > 0 
        ? branchesData.reduce((sum, b) => sum + (b.stats.averageInvoiceValue * b.stats.totalInvoices), 0) / totals.totalInvoices 
        : 0,
    };

    // تحليل المقارنة بين الفروع
    const comparison = getBranchComparison(branchesData);

    // تحليل الاتجاهات
    const trends = await getFinancialTrends(branchIds || branches.map(b => b.id), period);

    const response: any = {
      branches: branchesData,
      totals,
      averages,
      period,
      generatedAt: new Date(),
    };

    if (reportType === 'comparison') {
      response.comparison = comparison;
    }

    if (reportType === 'detailed') {
      response.comparison = comparison;
      response.trends = trends;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating consolidated financial report:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء التقرير المالي الموحد' },
      { status: 500 }
    );
  }
}

function getRevenueByCategory(invoices: any[], payments: any[]) {
  const revenueByCategory: { [key: string]: number } = {};

  invoices.forEach(invoice => {
    const category = invoice.type || 'OTHER';
    revenueByCategory[category] = (revenueByCategory[category] || 0) + invoice.totalAmount;
  });

  return Object.entries(revenueByCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage: 0, // سيتم حسابه لاحقاً
  }));
}

function getExpensesByCategory(transactions: any[]) {
  const expensesByCategory: { [key: string]: number } = {};

  transactions
    .filter(t => t.type === 'EXPENSE')
    .forEach(transaction => {
      const category = transaction.category || 'OTHER';
      expensesByCategory[category] = (expensesByCategory[category] || 0) + transaction.amount;
    });

  return Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage: 0, // سيتم حسابه لاحقاً
  }));
}

function getBranchComparison(branchesData: any[]) {
  // ترتيب الفروع حسب الأداء
  const byRevenue = [...branchesData].sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue);
  const byProfit = [...branchesData].sort((a, b) => b.stats.netProfit - a.stats.netProfit);
  const byInvoices = [...branchesData].sort((a, b) => b.stats.totalInvoices - a.stats.totalInvoices);

  // حساب النسب المئوية للإيرادات
  const totalRevenue = branchesData.reduce((sum, b) => sum + b.stats.totalRevenue, 0);
  const revenueShare = branchesData.map(b => ({
    branchId: b.branch.id,
    branchName: b.branch.name,
    revenue: b.stats.totalRevenue,
    percentage: totalRevenue > 0 ? (b.stats.totalRevenue / totalRevenue) * 100 : 0,
  }));

  return {
    topPerformers: {
      byRevenue: byRevenue.slice(0, 3),
      byProfit: byProfit.slice(0, 3),
      byInvoices: byInvoices.slice(0, 3),
    },
    revenueShare,
    performanceMetrics: {
      highestRevenue: byRevenue[0]?.stats.totalRevenue || 0,
      lowestRevenue: byRevenue[byRevenue.length - 1]?.stats.totalRevenue || 0,
      highestProfit: byProfit[0]?.stats.netProfit || 0,
      lowestProfit: byProfit[byProfit.length - 1]?.stats.netProfit || 0,
      averageRevenue: totalRevenue / branchesData.length,
    },
  };
}

async function getFinancialTrends(branchIds: string[], period: string) {
  // هذه دالة مبسطة لتحليل الاتجاهات
  // في التطبيق الفعلي، يمكن تحسينها باستخدام تحليل زمني أكثر تفصيلاً
  const now = new Date();
  const periods = [];
  
  switch (period) {
    case 'day':
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        periods.push(date.toISOString().split('T')[0]);
      }
      break;
    case 'week':
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        periods.push(date.toISOString().split('T')[0]);
      }
      break;
    case 'month':
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
      }
      break;
    case 'year':
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        periods.push(String(year));
      }
      break;
  }

  const trends = await Promise.all(
    periods.map(async (periodValue) => {
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(periodValue);
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(periodValue);
          endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          const [year, month] = periodValue.split('-').map(Number);
          startDate = new Date(year, month - 1, 1);
          endDate = new Date(year, month, 1);
          break;
        case 'year':
          startDate = new Date(parseInt(periodValue), 0, 1);
          endDate = new Date(parseInt(periodValue) + 1, 0, 1);
          break;
        default:
          startDate = new Date(periodValue);
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      }

      const [payments, transactions] = await Promise.all([
        db.payment.findMany({
          where: {
            branchId: { in: branchIds },
            createdAt: { gte: startDate, lt: endDate },
            status: 'COMPLETED',
          },
        }),
        db.transaction.findMany({
          where: {
            branchId: { in: branchIds },
            date: { gte: startDate, lt: endDate },
            type: 'EXPENSE',
          },
        }),
      ]);

      const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const expenses = transactions.reduce((sum, t) => sum + t.amount, 0);

      return {
        period: periodValue,
        revenue,
        expenses,
        profit: revenue - expenses,
      };
    })
  );

  return trends;
}