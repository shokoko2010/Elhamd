'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Search, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  CreditCard,
  Users,
  Car,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Branch {
  id: string;
  name: string;
  code: string;
  currency: string;
}

interface BranchData {
  branch: Branch;
  stats: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    totalPayments: number;
    activeUsers: number;
    availableVehicles: number;
    averageInvoiceValue: number;
    revenueByCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    expensesByCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
}

interface ConsolidatedReport {
  branches: BranchData[];
  totals: {
    totalRevenue: number;
    totalExpenses: number;
    totalNetProfit: number;
    totalInvoices: number;
    totalPaidInvoices: number;
    totalPendingInvoices: number;
    totalOverdueInvoices: number;
    totalPayments: number;
    totalActiveUsers: number;
    totalAvailableVehicles: number;
  };
  averages: {
    averageRevenue: number;
    averageExpenses: number;
    averageNetProfit: number;
    averageInvoiceValue: number;
  };
  comparison?: {
    topPerformers: {
      byRevenue: BranchData[];
      byProfit: BranchData[];
      byInvoices: BranchData[];
    };
    revenueShare: Array<{
      branchId: string;
      branchName: string;
      revenue: number;
      percentage: number;
    }>;
    performanceMetrics: {
      highestRevenue: number;
      lowestRevenue: number;
      highestProfit: number;
      lowestProfit: number;
      averageRevenue: number;
    };
  };
  trends?: Array<{
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  period: string;
  generatedAt: string;
}

export default function ConsolidatedReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [report, setReport] = useState<ConsolidatedReport | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [period, setPeriod] = useState('month');
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchBranches();
      fetchReport();
    }
  }, [status, router]);

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('حدث خطأ في جلب بيانات الفروع');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        type: reportType,
      });
      
      if (selectedBranches.length > 0) {
        params.append('branchIds', selectedBranches.join(','));
      }

      const response = await fetch(`/api/finance/consolidated?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        toast.error('حدث خطأ في جلب التقرير');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('حدث خطأ في جلب التقرير');
    } finally {
      setLoading(false);
    }
  };

  const handleBranchToggle = (branchId: string) => {
    setSelectedBranches(prev => 
      prev.includes(branchId) 
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  const handleSelectAllBranches = () => {
    if (selectedBranches.length === branches.length) {
      setSelectedBranches([]);
    } else {
      setSelectedBranches(branches.map(b => b.id));
    }
  };

  const exportReport = () => {
    if (!report) return;
    
    const csvContent = generateCSV(report);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `consolidated-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateCSV = (data: ConsolidatedReport): string => {
    const headers = ['الفرع', 'الإيرادات', 'المصروفات', 'صافي الربح', 'الفواتير', 'المدفوعات', 'المستخدمين', 'المركبات'];
    const rows = data.branches.map(b => [
      b.branch.name,
      b.stats.totalRevenue.toFixed(2),
      b.stats.totalExpenses.toFixed(2),
      b.stats.netProfit.toFixed(2),
      b.stats.totalInvoices,
      b.stats.totalPayments,
      b.stats.activeUsers,
      b.stats.availableVehicles,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const formatCurrency = (amount: number, currency = 'EGP') => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-EG').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">التقارير المالية الموحدة</h1>
          <p className="text-muted-foreground">
            تحليل شامل للأداء المالي لجميع الفروع
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchReport} disabled={loading}>
            <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button onClick={exportReport} disabled={!report}>
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>خيارات التقرير</CardTitle>
          <CardDescription>حدد الفترة والفروع المطلوبة للتقرير</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>الفترة</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">يوم</SelectItem>
                  <SelectItem value="week">أسبوع</SelectItem>
                  <SelectItem value="month">شهر</SelectItem>
                  <SelectItem value="year">سنة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نوع التقرير</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">نظرة عامة</SelectItem>
                  <SelectItem value="comparison">مقارنة بين الفروع</SelectItem>
                  <SelectItem value="detailed">تقرير مفصل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الفروع</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllBranches}
                >
                  {selectedBranches.length === branches.length ? 'إلغاء الكل' : 'تحديد الكل'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedBranches.length} من {branches.length} فرع
                </span>
              </div>
            </div>
          </div>
          
          {/* Branch Selection */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {branches.map((branch) => (
              <label key={branch.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBranches.includes(branch.id)}
                  onChange={() => handleBranchToggle(branch.id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{branch.name}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(report.totals.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  متوسط: {formatCurrency(report.averages.averageRevenue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(report.totals.totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground">
                  متوسط: {formatCurrency(report.averages.averageExpenses)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${report.totals.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(report.totals.totalNetProfit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  متوسط: {formatCurrency(report.averages.averageNetProfit)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(report.totals.totalInvoices)}</div>
                <p className="text-xs text-muted-foreground">
                  متوسط القيمة: {formatCurrency(report.averages.averageInvoiceValue)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="branches" className="space-y-4">
            <TabsList>
              <TabsTrigger value="branches">تفاصيل الفروع</TabsTrigger>
              <TabsTrigger value="comparison">المقارنة</TabsTrigger>
              <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
            </TabsList>

            <TabsContent value="branches">
              <Card>
                <CardHeader>
                  <CardTitle>أداء الفروع</CardTitle>
                  <CardDescription>
                    تفاصيل الأداء المالي لكل فرع
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الفرع</TableHead>
                        <TableHead>الإيرادات</TableHead>
                        <TableHead>المصروفات</TableHead>
                        <TableHead>صافي الربح</TableHead>
                        <TableHead>الفواتير</TableHead>
                        <TableHead>المدفوعات</TableHead>
                        <TableHead>المستخدمين</TableHead>
                        <TableHead>المركبات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.branches.map((branchData) => (
                        <TableRow key={branchData.branch.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{branchData.branch.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {branchData.branch.code}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-green-600">
                            {formatCurrency(branchData.stats.totalRevenue)}
                          </TableCell>
                          <TableCell className="text-red-600">
                            {formatCurrency(branchData.stats.totalExpenses)}
                          </TableCell>
                          <TableCell className={branchData.stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(branchData.stats.netProfit)}
                          </TableCell>
                          <TableCell>{formatNumber(branchData.stats.totalInvoices)}</TableCell>
                          <TableCell>{formatNumber(branchData.stats.totalPayments)}</TableCell>
                          <TableCell>{formatNumber(branchData.stats.activeUsers)}</TableCell>
                          <TableCell>{formatNumber(branchData.stats.availableVehicles)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison">
              {report.comparison && (
                <div className="space-y-6">
                  {/* Top Performers */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">أعلى الفروع إيراداتاً</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {report.comparison.topPerformers.byRevenue.slice(0, 3).map((branchData, index) => (
                            <div key={branchData.branch.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant={index === 0 ? "default" : "secondary"}>
                                  {index + 1}
                                </Badge>
                                <span className="font-medium">{branchData.branch.name}</span>
                              </div>
                              <span className="text-green-600 font-medium">
                                {formatCurrency(branchData.stats.totalRevenue)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">أعلى الفروع ربحاً</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {report.comparison.topPerformers.byProfit.slice(0, 3).map((branchData, index) => (
                            <div key={branchData.branch.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant={index === 0 ? "default" : "secondary"}>
                                  {index + 1}
                                </Badge>
                                <span className="font-medium">{branchData.branch.name}</span>
                              </div>
                              <span className={branchData.stats.netProfit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {formatCurrency(branchData.stats.netProfit)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">أكثر الفروع فواتير</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {report.comparison.topPerformers.byInvoices.slice(0, 3).map((branchData, index) => (
                            <div key={branchData.branch.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant={index === 0 ? "default" : "secondary"}>
                                  {index + 1}
                                </Badge>
                                <span className="font-medium">{branchData.branch.name}</span>
                              </div>
                              <span className="font-medium">
                                {formatNumber(branchData.stats.totalInvoices)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Revenue Share */}
                  <Card>
                    <CardHeader>
                      <CardTitle>توزيع الإيرادات بين الفروع</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {report.comparison.revenueShare.map((share) => (
                          <div key={share.branchId} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{share.branchName}</span>
                              <span>{share.percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={share.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trends">
              {report.trends && (
                <Card>
                  <CardHeader>
                    <CardTitle>اتجاهات الأداء المالي</CardTitle>
                    <CardDescription>
                      تحليل الاتجاهات خلال الفترة المحددة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الفترة</TableHead>
                          <TableHead>الإيرادات</TableHead>
                          <TableHead>المصروفات</TableHead>
                          <TableHead>صافي الربح</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.trends.map((trend, index) => (
                          <TableRow key={index}>
                            <TableCell>{trend.period}</TableCell>
                            <TableCell className="text-green-600">
                              {formatCurrency(trend.revenue)}
                            </TableCell>
                            <TableCell className="text-red-600">
                              {formatCurrency(trend.expenses)}
                            </TableCell>
                            <TableCell className={trend.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(trend.profit)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}