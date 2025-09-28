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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Building2,
  DollarSign,
  Target,
  Bell,
  Settings,
  BarChart3,
  PieChart
} from 'lucide-react';
import { toast } from 'sonner';

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

interface BudgetTrend {
  period: string;
  year: number;
  month: number;
  totalBudgeted: number;
  totalSpent: number;
  variance: number;
  budgetCount: number;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

export default function BudgetAlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [summary, setSummary] = useState<AlertSummary>({ 
    totalAlerts: 0, 
    warningAlerts: 0, 
    criticalAlerts: 0, 
    exceededAlerts: 0, 
    branchesWithAlerts: 0, 
    totalOverBudget: 0 
  });
  const [trends, setTrends] = useState<BudgetTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [alertTypeFilter, setAlertTypeFilter] = useState('');
  const [warningThreshold, setWarningThreshold] = useState(80);
  const [criticalThreshold, setCriticalThreshold] = useState(95);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchAlerts();
      fetchBranches();
    }
  }, [status, router]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedBranch) params.append('branchId', selectedBranch);
      params.append('threshold', warningThreshold.toString());
      params.append('criticalThreshold', criticalThreshold.toString());
      
      const response = await fetch(`/api/branches/budgets/alerts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
        setSummary(data.summary);
        setTrends(data.trends);
      }
    } catch (error) {
      console.error('Error fetching budget alerts:', error);
      toast.error('حدث خطأ في جلب تنبيهات الميزانيات');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const updateBudgetSpending = async () => {
    setUpdating(true);
    try {
      const budgetIds = alerts.map(alert => alert.budgetId);
      
      const response = await fetch('/api/branches/budgets/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-budget-spending',
          budgetIds,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`تم تحديث ${data.summary.successful} ميزانيات بنجاح`);
        fetchAlerts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'حدث خطأ في تحديث الميزانيات');
      }
    } catch (error) {
      console.error('Error updating budget spending:', error);
      toast.error('حدث خطأ في تحديث الإنفاق الفعلي');
    } finally {
      setUpdating(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.alertMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !alertTypeFilter || alert.alertType === alertTypeFilter;
    return matchesSearch && matchesType;
  });

  const getAlertBadge = (alertType: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'WARNING': 'secondary',
      'CRITICAL': 'destructive',
      'EXCEEDED': 'destructive',
    };

    const icons = {
      'WARNING': AlertTriangle,
      'CRITICAL': AlertTriangle,
      'EXCEEDED': AlertTriangle,
    };

    const labels = {
      'WARNING': 'تحذير',
      'CRITICAL': 'حرج',
      'EXCEEDED': 'تجاوز',
    };

    const Icon = icons[alertType] || AlertTriangle;
    
    return (
      <Badge variant={variants[alertType]} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{labels[alertType]}</span>
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency = 'EGP') => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPeriodLabel = (budget: BudgetAlert) => {
    if (budget.month) {
      return `${budget.year}/${budget.month.toString().padStart(2, '0')}`;
    } else if (budget.quarter) {
      return `${budget.year}/Q${budget.quarter}`;
    }
    return budget.year.toString();
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'INCOME': 'الإيرادات',
      'EXPENSE': 'المصروفات',
      'INVESTMENT': 'الاستثمارات',
    };
    return labels[category] || category;
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">تنبيهات الميزانيات</h1>
          <p className="text-muted-foreground">
            مراقبة استخدام الميزانيات وتلقي التنبيهات عند التجاوز
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={updateBudgetSpending} disabled={updating}>
            <RefreshCw className={`ml-2 h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
            {updating ? 'جاري التحديث...' : 'تحديث الإنفاق'}
          </Button>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="ml-2 h-4 w-4" />
                الإعدادات
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>إعدادات التنبيهات</DialogTitle>
                <DialogDescription>
                  ضع عتبات التنبيه للميزانيات
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>عتبة التحذير (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(parseInt(e.target.value) || 80)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>عتبة الخطر الحرج (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={criticalThreshold}
                    onChange={(e) => setCriticalThreshold(parseInt(e.target.value) || 95)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => {
                  setIsSettingsOpen(false);
                  fetchAlerts();
                }}>
                  حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التنبيهات</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              تنبيهات نشطة
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحذيرات</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.warningAlerts}</div>
            <p className="text-xs text-muted-foreground">
              قريبة من الحد
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حرجة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              قريبة جداً من الحد
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متجاوزة</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{summary.exceededAlerts}</div>
            <p className="text-xs text-muted-foreground">
              تجاوزت الحد المسموح
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التجاوز</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalOverBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              تجاوز الميزانيات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>التصفية والبحث</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في التنبيهات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="الفرع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الفروع</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="نوع التنبيه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الأنواع</SelectItem>
                <SelectItem value="WARNING">تحذير</SelectItem>
                <SelectItem value="CRITICAL">حرج</SelectItem>
                <SelectItem value="EXCEEDED">تجاوز</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>تنبيهات الميزانيات</CardTitle>
              <CardDescription>
                قائمة التنبيهات النشطة حسب استخدام الميزانيات
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">لا توجد تنبيهات</h3>
                  <p className="text-muted-foreground">
                    جميع الميزانيات ضمن الحدود المسموحة
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getAlertBadge(alert.alertType)}
                          <span className="font-medium">{alert.branchName}</span>
                          <Badge variant="outline">{alert.branchCode}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getPeriodLabel(alert)}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <p className="font-medium">{alert.alertMessage}</p>
                        <p className="text-muted-foreground">
                          {getCategoryLabel(alert.category)}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>الاستخدام</span>
                          <span>{alert.usagePercentage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={Math.min(alert.usagePercentage, 100)} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>المصروف: {formatCurrency(alert.spent, alert.currency)}</span>
                          <span>الميزانية: {formatCurrency(alert.allocated, alert.currency)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trends and Statistics */}
        <div className="space-y-6">
          {/* Usage by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>التنبيهات حسب النوع</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">تحذيرات</span>
                  <Badge variant="secondary">{summary.warningAlerts}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">حرجة</span>
                  <Badge variant="destructive">{summary.criticalAlerts}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">متجاوزة</span>
                  <Badge variant="destructive">{summary.exceededAlerts}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>الاتجاهات الأخيرة</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trends.slice(-6).map((trend) => (
                  <div key={trend.period} className="flex justify-between items-center text-sm">
                    <span>{trend.period}</span>
                    <div className="flex items-center space-x-2">
                      <span>{formatCurrency(trend.totalSpent)}</span>
                      {trend.variance >= 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={updateBudgetSpending}
                disabled={updating}
              >
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث بيانات الإنفاق
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  const csvContent = generateCSV();
                  downloadCSV(csvContent, 'budget-alerts.csv');
                }}
              >
                <Download className="ml-2 h-4 w-4" />
                تصدير التنبيهات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  function generateCSV(): string {
    const headers = ['الفرع', 'الكود', 'الفترة', 'الفئة', 'النوع', 'الاستخدام%', 'المصروف', 'الميزانية', 'الرسالة'];
    const rows = filteredAlerts.map(alert => [
      alert.branchName,
      alert.branchCode,
      getPeriodLabel(alert),
      getCategoryLabel(alert.category),
      alert.alertType,
      alert.usagePercentage.toFixed(1),
      alert.spent.toString(),
      alert.allocated.toString(),
      alert.alertMessage
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
}