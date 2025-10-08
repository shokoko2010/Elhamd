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

export default function InvoicesDashboardPage() {
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
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% من الشهر الماضي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">45,231 ج.م</div>
            <p className="text-xs text-muted-foreground">+8% من الشهر الماضي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">23</div>
            <p className="text-xs text-muted-foreground">بانتظار الدفع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المتأخرة</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">5</div>
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
              <Link href="/admin/finance">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="ml-2 h-4 w-4" />
                  جميع الفواتير
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="ml-2 h-4 w-4" />
                الفواتير المعلقة
                <Badge variant="secondary" className="mr-auto">23</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="ml-2 h-4 w-4" />
                الفواتير المتأخرة
                <Badge variant="destructive" className="mr-auto">5</Badge>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">فاتورة جديدة #INV-2024-001</p>
                  <p className="text-sm text-gray-500">تم إنشاؤها للعميل أحمد محمد</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">منذ 5 دقائق</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">تم دفع فاتورة #INV-2024-002</p>
                  <p className="text-sm text-gray-500">تم استلام مبلغ 1,500 ج.م</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">منذ ساعة</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="font-medium">فاتورة متأخرة #INV-2024-003</p>
                  <p className="text-sm text-gray-500">تجاوزت تاريخ الاستحقاق</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">منذ 3 ساعات</span>
            </div>
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