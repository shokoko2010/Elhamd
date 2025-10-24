interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { db } from '@/lib/db';
import { TaxType, TaxStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const branchId = searchParams.get('branchId');
    const type = searchParams.get('type') as TaxType | null;

    const where: any = {};
    
    if (startDate && endDate) {
      where.dueDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    if (branchId) where.branchId = branchId;
    if (type) where.type = type;

    // Check if taxRecord table exists and is accessible
    try {
      await db.taxRecord.count();
    } catch (dbError) {
      console.error('TaxRecord table not accessible:', dbError);
      return NextResponse.json(
        { error: 'Tax records table is not available. Please check database configuration.' },
        { status: 503 }
      );
    }

    // Get tax records grouped by type
    const byType = await db.taxRecord.groupBy({
      by: ['type'],
      _sum: { amount: true },
      _count: { id: true },
      where,
    });

    // Get tax records grouped by status
    const byStatus = await db.taxRecord.groupBy({
      by: ['status'],
      _sum: { amount: true },
      _count: { id: true },
      where,
    });

    // Get tax records grouped by period (monthly)
    const byPeriod = await db.taxRecord.groupBy({
      by: ['period'],
      _sum: { amount: true },
      _count: { id: true },
      where,
      orderBy: { period: 'asc' },
    });

    // Get monthly trends for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTrends = await db.taxRecord.findMany({
      where: {
        ...where,
        dueDate: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        dueDate: true,
        amount: true,
        status: true,
        type: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    // Process monthly trends
    const monthlyData = {};
    monthlyTrends.forEach((record) => {
      const monthKey = record.dueDate.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          period: monthKey,
          total: 0,
          paid: 0,
          pending: 0,
          overdue: 0,
          byType: {},
        };
      }
      
      monthlyData[monthKey].total += record.amount;
      
      if (!monthlyData[monthKey].byType[record.type]) {
        monthlyData[monthKey].byType[record.type] = 0;
      }
      monthlyData[monthKey].byType[record.type] += record.amount;
      
      switch (record.status) {
        case 'PAID':
          monthlyData[monthKey].paid += record.amount;
          break;
        case 'PENDING':
          monthlyData[monthKey].pending += record.amount;
          break;
        case 'OVERDUE':
          monthlyData[monthKey].overdue += record.amount;
          break;
      }
    });

    // Calculate summary statistics
    const allRecords = await db.taxRecord.findMany({ where });
    const totalTaxAmount = allRecords.reduce((sum, record) => sum + record.amount, 0);
    const paidAmount = allRecords
      .filter(r => r.status === 'PAID')
      .reduce((sum, record) => sum + record.amount, 0);
    const pendingAmount = allRecords
      .filter(r => r.status === 'PENDING')
      .reduce((sum, record) => sum + record.amount, 0);
    const overdueAmount = allRecords
      .filter(r => r.status === 'OVERDUE')
      .reduce((sum, record) => sum + record.amount, 0);

    // Get upcoming tax payments (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingPayments = await db.taxRecord.findMany({
      where: {
        ...where,
        dueDate: {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        },
        status: {
          in: ['PENDING', 'CALCULATED'],
        },
      },
      include: {
        branch: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Get tax efficiency metrics
    const efficiencyMetrics = {
      paymentRate: totalTaxAmount > 0 ? (paidAmount / totalTaxAmount) * 100 : 0,
      overdueRate: totalTaxAmount > 0 ? (overdueAmount / totalTaxAmount) * 100 : 0,
      averageProcessingTime: 0, // Would need payment dates to calculate
    };

    return NextResponse.json({
      summary: {
        totalTaxAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
        totalRecords: allRecords.length,
      },
      byType,
      byStatus,
      byPeriod,
      monthlyTrends: Object.values(monthlyData),
      upcomingPayments,
      efficiencyMetrics,
    });
  } catch (error) {
    console.error('Error generating tax report:', error);
    return NextResponse.json(
      { error: 'Failed to generate tax report' },
      { status: 500 }
    );
  }
}