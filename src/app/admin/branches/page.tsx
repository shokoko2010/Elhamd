'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgePlus, Search, Edit, Trash2, Users, Car, FileText, CreditCard, Building2, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  openingDate: string;
  currency: string;
  currency: string;
  timezone: string;
  mapLat?: number;
  mapLng?: number;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    users: number;
    vehicles: number;
    invoices: number;
    payments: number;
  };
}

interface BranchFormData {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  managerId?: string;
  currency: string;
  currency: string;
  timezone: string;
  mapLat?: number;
  mapLng?: number;
  isActive: boolean;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  branch?: {
    id: string;
    name: string;
    code: string;
  };
}

export default function BranchesPage() {
  const { user, loading: authLoading, authenticated } = useAuth();
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    managerId: '',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    mapLat: undefined,
    mapLng: undefined,
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!authenticated) {
        router.push('/login');
      } else {
        fetchBranches();
        fetchManagers();
      }
    }
  }, [authLoading, authenticated, router]);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('auth_token');
    console.log('Using token:', token ? 'Token found' : 'No token found');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  const fetchBranches = async () => {
    try {
      console.log('Fetching branches...');
      const response = await fetchWithAuth('/api/branches');
      console.log('Branches response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Branches data:', data);
        setBranches(data.branches);
      } else {
        const errorData = await response.json();
        console.error('Branches error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('حدث خطأ في جلب بيانات الفروع');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      console.log('Fetching managers...');
      const response = await fetchWithAuth('/api/branches/managers');
      console.log('Managers response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Managers data:', data);
        setManagers(data);
      } else {
        const errorData = await response.json();
        console.error('Managers error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingBranch ? `/api/branches/${editingBranch.id}` : '/api/branches';
      const method = editingBranch ? 'PUT' : 'POST';

      const requestData = {
        ...formData,
        managerId: formData.managerId || null, // Convert empty string to null
        settings: {} // Add empty settings object
      };

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast.success(editingBranch ? 'تم تحديث الفرع بنجاح' : 'تم إنشاء الفرع بنجاح');
        setIsDialogOpen(false);
        setEditingBranch(null);
        resetForm();
        fetchBranches();
      } else {
        const error = await response.json();
        toast.error(error.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error('حدث خطأ في حفظ الفرع');
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      managerId: branch.manager?.id || '',
      currency: branch.currency,
      timezone: branch.timezone,
      mapLat: branch.mapLat,
      mapLng: branch.mapLng,
      isActive: branch.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (branchId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفرع؟')) return;

    try {
      const response = await fetchWithAuth(`/api/branches/${branchId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('تم حذف الفرع بنجاح');
        fetchBranches();
      } else {
        const error = await response.json();
        toast.error(error.error || 'حدث خطأ في حذف الفرع');
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast.error('حدث خطأ في حذف الفرع');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      managerId: '',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      mapLat: undefined,
      mapLng: undefined,
      isActive: true,
    });
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || dataLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">إدارة الفروع</h1>
          <p className="text-muted-foreground">
            إدارة فروع الشركة والموارد المرتبطة بها
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingBranch(null);
              resetForm();
            }}>
              <BadgePlus className="ml-2 h-4 w-4" />
              إضافة فرع جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingBranch ? 'تعديل بيانات الفرع الحالي' : 'إنشاء فرع جديد في النظام'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الفرع</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">كود الفرع</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mapLat">خط العرض (Latitude)</Label>
                  <Input
                    id="mapLat"
                    type="number"
                    step="any"
                    value={formData.mapLat || ''}
                    onChange={(e) => setFormData({ ...formData, mapLat: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mapLng">خط الطول (Longitude)</Label>
                  <Input
                    id="mapLng"
                    type="number"
                    step="any"
                    value={formData.mapLng || ''}
                    onChange={(e) => setFormData({ ...formData, mapLng: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">المدير</Label>
                <Select
                  value={formData.managerId}
                  onValueChange={(value) => setFormData({ ...formData, managerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدير" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name} ({manager.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">العملة</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">المنطقة الزمنية</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Cairo">القاهرة (GMT+2)</SelectItem>
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">نشط</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingBranch ? 'تحديث' : 'إنشاء'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الفروع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">قائمة الفروع</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>الفروع</CardTitle>
              <CardDescription>
                قائمة بجميع فروع الشركة في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الفرع</TableHead>
                    <TableHead>الكود</TableHead>
                    <TableHead>المدير</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>المستخدمين</TableHead>
                    <TableHead>المركبات</TableHead>
                    <TableHead>الفواتير</TableHead>
                    <TableHead>المدفوعات</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{branch.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {branch.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{branch.code}</Badge>
                      </TableCell>
                      <TableCell>
                        {branch.manager ? (
                          <div>
                            <div className="font-medium">{branch.manager.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {branch.manager.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">غير محدد</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={branch.isActive ? "default" : "secondary"}>
                          {branch.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{branch._count.users}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span>{branch._count.vehicles}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{branch._count.invoices}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>{branch._count.payments}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(branch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(branch.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الفروع</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{branches.length}</div>
                <p className="text-xs text-muted-foreground">
                  {branches.filter(b => b.isActive).length} نشط
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {branches.reduce((sum, b) => sum + b._count.users, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  في جميع الفروع
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المركبات</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {branches.reduce((sum, b) => sum + b._count.vehicles, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  في جميع الفروع
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {branches.reduce((sum, b) => sum + b._count.invoices, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  في جميع الفروع
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}