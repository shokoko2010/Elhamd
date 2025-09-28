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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BadgePlus, 
  Search, 
  Building2, 
  ArrowRightLeft, 
  DollarSign, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Branch {
  id: string;
  name: string;
  code: string;
  currency: string;
}

interface Transfer {
  id: string;
  referenceId: string;
  fromBranch: {
    id: string;
    name: string;
    code: string;
  };
  toBranch: {
    id: string;
    name: string;
    code: string;
  };
  amount: number;
  currency: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  requestedBy: {
    id: string;
    name: string;
    email: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface TransferFormData {
  fromBranchId: string;
  toBranchId: string;
  amount: number;
  currency: string;
  description: string;
}

export default function BranchTransfersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TransferFormData>({
    fromBranchId: '',
    toBranchId: '',
    amount: 0,
    currency: 'EGP',
    description: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchTransfers();
      fetchBranches();
    }
  }, [status, router]);

  const fetchTransfers = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/branches/transfers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransfers(data.transfers);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('حدث خطأ في جلب التحويلات');
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
      toast.error('حدث خطأ في جلب بيانات الفروع');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/branches/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('تم إنشاء طلب التحويل بنجاح');
        setIsDialogOpen(false);
        resetForm();
        fetchTransfers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast.error('حدث خطأ في إنشاء التحويل');
    }
  };

  const handleAction = async (transferId: string, action: 'approve' | 'reject' | 'complete', rejectionReason?: string) => {
    try {
      const response = await fetch(`/api/branches/transfers/${transferId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, rejectionReason }),
      });

      if (response.ok) {
        const actionMessages = {
          approve: 'تمت الموافقة على التحويل',
          reject: 'تم رفض التحويل',
          complete: 'تم إكمال التحويل',
        };
        toast.success(actionMessages[action]);
        fetchTransfers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error updating transfer:', error);
      toast.error('حدث خطأ في تحديث حالة التحويل');
    }
  };

  const handleDelete = async (transferId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التحويل؟')) return;

    try {
      const response = await fetch(`/api/branches/transfers/${transferId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('تم حذف التحويل بنجاح');
        fetchTransfers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'حدث خطأ في حذف التحويل');
      }
    } catch (error) {
      console.error('Error deleting transfer:', error);
      toast.error('حدث خطأ في حذف التحويل');
    }
  };

  const resetForm = () => {
    setFormData({
      fromBranchId: '',
      toBranchId: '',
      amount: 0,
      currency: 'EGP',
      description: '',
    });
  };

  const filteredTransfers = transfers.filter(transfer =>
    transfer.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.fromBranch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.toBranch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (statusFilter ? transfer.status === statusFilter : true)
  );

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'PENDING': 'secondary',
      'APPROVED': 'default',
      'REJECTED': 'destructive',
      'COMPLETED': 'outline',
    };

    const icons = {
      'PENDING': Clock,
      'APPROVED': CheckCircle,
      'REJECTED': XCircle,
      'COMPLETED': CheckCircle,
    };

    const labels = {
      'PENDING': 'قيد الانتظار',
      'APPROVED': 'معتمد',
      'REJECTED': 'مرفوض',
      'COMPLETED': 'مكتمل',
    };

    const Icon = icons[status] || Clock;
    
    return (
      <Badge variant={variants[status]} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{labels[status]}</span>
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
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const canApprove = (transfer: Transfer) => {
    if (transfer.status !== 'PENDING') return false;
    if (session?.user.role === 'SUPER_ADMIN' || session?.user.role === 'ADMIN') return true;
    return false;
  };

  const canComplete = (transfer: Transfer) => {
    if (transfer.status !== 'APPROVED') return false;
    if (session?.user.role === 'SUPER_ADMIN' || session?.user.role === 'ADMIN') return true;
    return false;
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
          <h1 className="text-3xl font-bold tracking-tight">التحويلات بين الفروع</h1>
          <p className="text-muted-foreground">
            إدارة التحويلات المالية بين فروع الشركة
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchTransfers} disabled={loading}>
            <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
              }}>
                <BadgePlus className="ml-2 h-4 w-4" />
                تحويل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>إنشاء تحويل جديد</DialogTitle>
                <DialogDescription>
                  إنشاء طلب تحويل مالي بين فرعين
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromBranch">الفرع المصدر</Label>
                    <Select
                      value={formData.fromBranchId}
                      onValueChange={(value) => setFormData({ ...formData, fromBranchId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفرع المصدر" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} ({branch.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toBranch">الفرع المستهدف</Label>
                    <Select
                      value={formData.toBranchId}
                      onValueChange={(value) => setFormData({ ...formData, toBranchId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفرع المستهدف" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches
                          .filter(b => b.id !== formData.fromBranchId)
                          .map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name} ({branch.code})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">المبلغ</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="سبب التحويل أو أي ملاحظات إضافية"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    إنشاء التحويل
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في التحويلات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">جميع الحالات</SelectItem>
            <SelectItem value="PENDING">قيد الانتظار</SelectItem>
            <SelectItem value="APPROVED">معتمد</SelectItem>
            <SelectItem value="REJECTED">مرفوض</SelectItem>
            <SelectItem value="COMPLETED">مكتمل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle>التحويلات</CardTitle>
          <CardDescription>
            قائمة بجميع التحويلات المالية بين الفروع
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم المرجع</TableHead>
                <TableHead>من</TableHead>
                <TableHead>إلى</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>
                    <Badge variant="outline">{transfer.referenceId}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transfer.fromBranch.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {transfer.fromBranch.code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transfer.toBranch.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {transfer.toBranch.code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(transfer.amount, transfer.currency)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transfer.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(transfer.createdAt)}</div>
                      {transfer.approvedAt && (
                        <div className="text-muted-foreground">
                          معتمد: {formatDate(transfer.approvedAt)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {canApprove(transfer) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(transfer.id, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const reason = prompt('سبب الرفض:');
                              if (reason) {
                                handleAction(transfer.id, 'reject', reason);
                              }
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {canComplete(transfer) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(transfer.id, 'complete')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {transfer.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(transfer.id)}
                        >
                          حذف
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transfer Details */}
      {filteredTransfers.length > 0 && (
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              قيد الانتظار ({filteredTransfers.filter(t => t.status === 'PENDING').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              معتمدة ({filteredTransfers.filter(t => t.status === 'APPROVED').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              مكتملة ({filteredTransfers.filter(t => t.status === 'COMPLETED').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              مرفوضة ({filteredTransfers.filter(t => t.status === 'REJECTED').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>التحويلات قيد الانتظار</CardTitle>
                <CardDescription>
                  التحويلات التي تنتظر الموافقة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransfers
                    .filter(t => t.status === 'PENDING')
                    .map((transfer) => (
                      <div key={transfer.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{transfer.referenceId}</Badge>
                              {getStatusBadge(transfer.status)}
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="font-medium">{transfer.fromBranch.name}</span>
                              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{transfer.toBranch.name}</span>
                            </div>
                            <div className="mt-1 text-lg font-semibold">
                              {formatCurrency(transfer.amount, transfer.currency)}
                            </div>
                            {transfer.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {transfer.description}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(transfer.id, 'approve')}
                            >
                              موافقة
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const reason = prompt('سبب الرفض:');
                                if (reason) {
                                  handleAction(transfer.id, 'reject', reason);
                                }
                              }}
                            >
                              رفض
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          طلب بواسطة: {transfer.requestedBy.name} - {formatDate(transfer.createdAt)}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>التحويلات المعتمدة</CardTitle>
                <CardDescription>
                  التحويلات التي تمت الموافقة عليها وانتظار التنفيذ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransfers
                    .filter(t => t.status === 'APPROVED')
                    .map((transfer) => (
                      <div key={transfer.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{transfer.referenceId}</Badge>
                              {getStatusBadge(transfer.status)}
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="font-medium">{transfer.fromBranch.name}</span>
                              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{transfer.toBranch.name}</span>
                            </div>
                            <div className="mt-1 text-lg font-semibold">
                              {formatCurrency(transfer.amount, transfer.currency)}
                            </div>
                            {transfer.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {transfer.description}
                              </p>
                            )}
                          </div>
                          {canComplete(transfer) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(transfer.id, 'complete')}
                            >
                              إكمال التحويل
                            </Button>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          طلب بواسطة: {transfer.requestedBy.name} - معتمد بواسطة: {transfer.approver?.name}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>التحويلات المكتملة</CardTitle>
                <CardDescription>
                  التحويلات التي تم تنفيذها بنجاح
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransfers
                    .filter(t => t.status === 'COMPLETED')
                    .map((transfer) => (
                      <div key={transfer.id} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{transfer.referenceId}</Badge>
                              {getStatusBadge(transfer.status)}
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="font-medium">{transfer.fromBranch.name}</span>
                              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{transfer.toBranch.name}</span>
                            </div>
                            <div className="mt-1 text-lg font-semibold">
                              {formatCurrency(transfer.amount, transfer.currency)}
                            </div>
                            {transfer.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {transfer.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          طلب بواسطة: {transfer.requestedBy.name} - مكتمل في: {transfer.completedAt ? formatDate(transfer.completedAt) : ''}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>التحويلات المرفوضة</CardTitle>
                <CardDescription>
                  التحويلات التي تم رفضها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransfers
                    .filter(t => t.status === 'REJECTED')
                    .map((transfer) => (
                      <div key={transfer.id} className="border rounded-lg p-4 bg-red-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{transfer.referenceId}</Badge>
                              {getStatusBadge(transfer.status)}
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="font-medium">{transfer.fromBranch.name}</span>
                              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{transfer.toBranch.name}</span>
                            </div>
                            <div className="mt-1 text-lg font-semibold">
                              {formatCurrency(transfer.amount, transfer.currency)}
                            </div>
                            {transfer.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {transfer.description}
                              </p>
                            )}
                            {transfer.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-100 rounded text-sm">
                                <strong>سبب الرفض:</strong> {transfer.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          طلب بواسطة: {transfer.requestedBy.name} - مرفوض بواسطة: {transfer.approver?.name}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}