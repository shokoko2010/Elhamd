interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

interface BudgetAlert {
  id: string;
  branchId: string;
  branchName: string;
  branchCode: string;
  budgetId: string;
  year: number;
  quarter?: number;
  month?: number;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  usagePercentage: number;
  alertType: 'WARNING' | 'CRITICAL' | 'EXCEEDED';
  alertMessage: string;
  currency: string;
  lastUpdated: string;
}

interface AlertSummary {
  totalAlerts: number;
  warningAlerts: number;
  criticalAlerts: number;
  exceededAlerts: number;
  branchesWithAlerts: number;
  totalOverBudget: number;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const threshold = parseFloat(searchParams.get('threshold') || '80'); // Default 80%
    const criticalThreshold = parseFloat(searchParams.get('criticalThreshold') || '95'); // Default 95%

    // Get all active budgets with their spending information
    const where: any = { status: 'ACTIVE' };
    if (branchId) {
      where.branchId = branchId;
    }

    const budgets = await db.branchBudget.findMany({
      where,
      orderBy: [
        { branchId: 'asc' },
        { year: 'desc' },
        { quarter: 'asc' },
        { month: 'asc' },
      ],
    });

    // Fetch branch data separately
    const budgetsWithBranches = await Promise.all(
      budgets.map(async (budget) => {
        const branch = await db.branch.findUnique({
          where: { id: budget.branchId },
          select: {
            id: true,
            name: true,
            code: true,
            currency: true,
          },
        });
        return { ...budget, branch };
      })
    );

    // Calculate budget usage and generate alerts
    const alerts: BudgetAlert[] = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);

    for (const budget of budgetsWithBranches) {
      // Skip budgets for future periods
      if (budget.year > currentYear) continue;
      if (budget.year === currentYear && budget.quarter && budget.quarter > currentQuarter) continue;
      if (budget.year === currentYear && budget.month && budget.month > currentMonth) continue;

      const usagePercentage = budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;
      
      let alertType: 'WARNING' | 'CRITICAL' | 'EXCEEDED' | null = null;
      let alertMessage = '';

      if (usagePercentage >= 100) {
        alertType = 'EXCEEDED';
        alertMessage = `تم تجاوز ميزانية ${getCategoryLabel(budget.category)} بنسبة ${(usagePercentage - 100).toFixed(1)}%`;
      } else if (usagePercentage >= criticalThreshold) {
        alertType = 'CRITICAL';
        alertMessage = `ميزانية ${getCategoryLabel(budget.category)} قريبة من النفاذ (${usagePercentage.toFixed(1)}%)`;
      } else if (usagePercentage >= threshold) {
        alertType = 'WARNING';
        alertMessage = `تم استخدام ${usagePercentage.toFixed(1)}% من ميزانية ${getCategoryLabel(budget.category)}`;
      }

      if (alertType && budget.branch) {
        alerts.push({
          id: `alert-${budget.id}`,
          branchId: budget.branchId,
          branchName: budget.branch.name,
          branchCode: budget.branch.code,
          budgetId: budget.id,
          year: budget.year,
          quarter: budget.quarter || undefined,
          month: budget.month || undefined,
          category: budget.category,
          allocated: budget.allocated,
          spent: budget.spent,
          remaining: budget.remaining,
          usagePercentage,
          alertType,
          alertMessage,
          currency: budget.currency,
          lastUpdated: budget.updatedAt.toISOString(),
        });
      }
    }

    // Calculate summary statistics
    const summary: AlertSummary = {
      totalAlerts: alerts.length,
      warningAlerts: alerts.filter(a => a.alertType === 'WARNING').length,
      criticalAlerts: alerts.filter(a => a.alertType === 'CRITICAL').length,
      exceededAlerts: alerts.filter(a => a.alertType === 'EXCEEDED').length,
      branchesWithAlerts: new Set(alerts.map(a => a.branchId)).size,
      totalOverBudget: alerts
        .filter(a => a.alertType === 'EXCEEDED')
        .reduce((sum, a) => sum + (a.spent - a.allocated), 0),
    };

    // Get budget trends for the last 6 months
    const trends = await getBudgetTrends(branchId || undefined);

    return NextResponse.json({
      alerts,
      summary,
      trends,
      thresholds: {
        warning: threshold,
        critical: criticalThreshold,
      },
    });
  } catch (error) {
    console.error('Error fetching budget alerts:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب تنبيهات الميزانيات' },
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
    const { action, budgetIds, threshold, criticalThreshold } = body;

    if (action === 'update-budget-spending') {
      // Update actual spending from transactions
      const results: Array<{
        budgetId: string;
        success: boolean;
        spent: number;
        remaining?: number;
        error?: string;
      }> = [];
      
      for (const budgetId of budgetIds) {
        try {
          const budget = await db.branchBudget.findUnique({
            where: { id: budgetId },
          });

          if (!budget) continue;

          // Calculate actual spending from transactions
          const spending = await calculateActualSpending(budget.branchId, budget.category, budget.year, budget.quarter || undefined, budget.month || undefined);

          const updatedBudget = await db.branchBudget.update({
            where: { id: budgetId },
            data: {
              spent: spending,
              remaining: Math.max(0, budget.allocated - spending),
              metadata: budget.metadata ? {
                ...(typeof budget.metadata === 'object' ? budget.metadata : {}),
                lastSpendingUpdate: new Date().toISOString(),
                updatedBy: user.id,
              } : {
                lastSpendingUpdate: new Date().toISOString(),
                updatedBy: user.id,
              },
            },
          });

          results.push({
            budgetId,
            success: true,
            spent: spending,
            remaining: updatedBudget.remaining,
          });
        } catch (error) {
          console.error(`Error updating budget ${budgetId}:`, error);
          results.push({
            budgetId,
            success: false,
            spent: 0,
            error: 'حدث خطأ في تحديث الميزانية',
          });
        }
      }

      return NextResponse.json({
        results,
        summary: {
          total: budgetIds.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
        },
      });
    }

    if (action === 'create-alert-rules') {
      // Create custom alert rules for branches
      const { branchRules } = body;
      
      const rules: any[] = [];
      for (const rule of branchRules) {
        try {
          const existingBudget = await db.branchBudget.findUnique({ 
            where: { id: rule.budgetId } 
          });
          
          const currentMetadata = existingBudget?.metadata as any || {};
          
          const alertRule = await db.branchBudget.update({
            where: { id: rule.budgetId },
            data: {
              metadata: {
                ...currentMetadata,
                alertRules: {
                  warningThreshold: rule.warningThreshold || threshold,
                  criticalThreshold: rule.criticalThreshold || criticalThreshold,
                  notifications: rule.notifications || [],
                  enabled: rule.enabled !== false,
                },
              },
            },
          });
          rules.push(alertRule);
        } catch (error) {
          console.error(`Error creating alert rule for budget ${rule.budgetId}:`, error);
        }
      }

      return NextResponse.json({
        success: true,
        rulesCreated: rules.length,
      });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (error) {
    console.error('Error in budget alerts POST:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة طلب التنبيهات' },
      { status: 500 }
    );
  }
}

// Helper functions
async function calculateActualSpending(branchId: string, category: string, year: number, quarter?: number, month?: number): Promise<number> {
  const startDate = new Date(year, 0, 1); // January 1st of the year
  let endDate = new Date(year + 1, 0, 1); // January 1st of next year

  if (month) {
    startDate.setMonth(month - 1);
    endDate = new Date(year, month, 1);
  } else if (quarter) {
    const startMonth = (quarter - 1) * 3;
    startDate.setMonth(startMonth);
    endDate = new Date(year, startMonth + 3, 1);
  }

  const transactions = await db.transaction.findMany({
    where: {
      branchId,
      category: category === 'INCOME' ? { in: ['SALES', 'TRANSFER_IN', 'OTHER_INCOME'] } : 
               category === 'EXPENSE' ? { in: ['OPERATIONAL', 'SALARIES', 'RENT', 'TRANSFER_OUT', 'OTHER_EXPENSE'] } :
               category === 'INVESTMENT' ? { in: ['EQUIPMENT', 'VEHICLES', 'PROPERTY'] } : undefined,
      date: {
        gte: startDate,
        lt: endDate,
      },
      type: category === 'INCOME' ? 'INCOME' : 'EXPENSE',
    },
  });

  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

async function getBudgetTrends(branchId?: string): Promise<any[]> {
  const trends: any[] = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const where: any = {
      year,
      month,
      status: 'ACTIVE',
    };
    
    if (branchId) {
      where.branchId = branchId;
    }

    const monthlyBudgets = await db.branchBudget.findMany({
      where,
    });

    // Fetch branch data separately
    const budgetsWithBranches = await Promise.all(
      monthlyBudgets.map(async (budget) => {
        const branch = await db.branch.findUnique({
          where: { id: budget.branchId },
          select: { name: true, code: true },
        });
        return { ...budget, branch };
      })
    );

    const monthlySpending = await calculateActualSpending(
      branchId || budgetsWithBranches[0]?.branchId || '',
      'EXPENSE',
      year,
      undefined,
      month
    );

    trends.push({
      period: `${year}-${month.toString().padStart(2, '0')}`,
      year,
      month,
      totalBudgeted: monthlyBudgets.reduce((sum, b) => sum + b.allocated, 0),
      totalSpent: monthlySpending,
      variance: monthlyBudgets.reduce((sum, b) => sum + b.allocated, 0) - monthlySpending,
      budgetCount: monthlyBudgets.length,
    });
  }

  return trends;
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'INCOME': 'الإيرادات',
    'EXPENSE': 'المصروفات',
    'INVESTMENT': 'الاستثمارات',
  };
  return labels[category] || category;
}