'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Eye,
  Settings,
  BarChart3,
  Users,
  Calendar,
  Download,
  Package
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FinancialOverview {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  pendingInvoices: number
  overdueInvoices: number
  paidInvoices: number
  draftInvoices: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  customer: {
    name: string
    email: string
  }
  status: string
  totalAmount: number
  issueDate: string
  dueDate: string
}

export default function InvoicesDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch overview data
      const overviewResponse = await fetch('/api/finance/overview');
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setOverview(overviewData);
      }

      // Fetch recent invoices
      const invoicesResponse = await fetch('/api/finance/invoices?limit=5');
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setRecentInvoices(invoicesData.invoices || []);
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات الداشبورد',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'مسودة', variant: 'secondary' as const },
      SENT: { label: 'مرسلة', variant: 'default' as const },
      PAID: { label: 'مدفوعة', variant: 'default' as const },
      PARTIALLY_PAID: { label: 'مدفوعة جزئياً', variant: 'outline' as const },
      OVERDUE: { label: 'متأخرة', variant: 'destructive' as const },
      CANCELLED: { label: 'ملغاة', variant: 'secondary' as const },
      REFUNDED: { label: 'مستردة', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">نظام الفواتير</h1>
            <p className="text-gray-600 mt-2">إدارة الفواتير والمدفوعات والتقارير المالية</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام الفواتير</h1>
          <p className="text-gray-600 mt-2">إدارة الفواتير والمدفوعات والتقارير المالية</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/finance/invoices/create">
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              فاتورة جديدة
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(overview?.paidInvoices || 0) + (overview?.pendingInvoices || 0) + (overview?.overdueInvoices || 0)}
            </div>
            <p className="text-xs text-muted-foreground">جميع الفواتير</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overview ? formatCurrency(overview.totalRevenue) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">هذا الشهر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overview?.pendingInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">بانتظار الدفع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المتأخرة</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overview?.overdueInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">تحتاج للمتابعة</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إنشاء فاتورة
            </CardTitle>
            <CardDescription>
              إنشاء فاتورة جديدة للعملاء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/finance/invoices/create">
                <Button className="w-full">
                  <FileText className="ml-2 h-4 w-4" />
                  فاتورة خدمة
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Package className="ml-2 h-4 w-4" />
                فاتورة منتجات
              </Button>
              <Button variant="outline" className="w-full">
                <Users className="ml-2 h-4 w-4" />
                فاتورة اشتراك
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              عرض الفواتير
            </CardTitle>
            <CardDescription>
              استعراض وإدارة الفواتير الموجودة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/invoices/list">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="ml-2 h-4 w-4" />
                  جميع الفواتير
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="ml-2 h-4 w-4" />
                الفواتير المعلقة
                <Badge variant="secondary" className="mr-auto">
                  {overview?.pendingInvoices || 0}
                </Badge>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="ml-2 h-4 w-4" />
                الفواتير المتأخرة
                <Badge variant="destructive" className="mr-auto">
                  {overview?.overdueInvoices || 0}
                </Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              التقارير والتحليلات
            </CardTitle>
            <CardDescription>
              عرض التقارير المالية والإحصائيات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="ml-2 h-4 w-4" />
                تقرير الإيرادات
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="ml-2 h-4 w-4" />
                تقرير شهري
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="ml-2 h-4 w-4" />
                تقرير العملاء
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
          <CardDescription>
            آخر التحديثات في نظام الفواتير
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      invoice.status === 'PAID' ? 'bg-green-500' :
                      invoice.status === 'SENT' ? 'bg-blue-500' :
                      invoice.status === 'OVERDUE' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">فاتورة {invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">
                        {invoice.customer.name} - {formatCurrency(invoice.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invoice.status)}
                    <span className="text-sm text-gray-500">
                      {formatDate(invoice.issueDate)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  لا توجد فواتير
                </h3>
                <p className="text-gray-500 mb-4">
                  قم بإنشاء فاتورة جديدة للبدء
                </p>
                <Link href="/admin/finance/invoices/create">
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    فاتورة جديدة
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Users className="ml-2 h-4 w-4" />
              إدارة العملاء
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="ml-2 h-4 w-4" />
              قوالب الفواتير
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="ml-2 h-4 w-4" />
              إعدادات النظام
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}