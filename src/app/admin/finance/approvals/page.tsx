'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Users,
  TrendingUp,
  FileText,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Building2,
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}

interface Transfer {
  id: string;
  referenceId: string;
  fromBranch: {
    id: string;
    name: string;
    code: string;
    currency: string;
  };
  toBranch: {
    id: string;
    name: string;
    code: string;
    currency: string;
  };
  amount: number;
  currency: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  requestedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  metadata?: any;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

export default function TransferApprovalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState<ApprovalStats>({ pending: 0, approved: 0, rejected: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedTransfers, setSelectedTransfers] = useState<string[]>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'complete'>('approve');
  const [bulkComments, setBulkComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchApprovals();
      fetchBranches();
    }
  }, [status, router]);

  const fetchApprovals = async (type = 'my-approvals') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('type', type);
      if (selectedBranch) params.append('branchId', selectedBranch);
      
      const response = await fetch(`/api/branches/transfers/approvals?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransfers(data.transfers);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('حدث خطأ في جلب بيانات الموافقات');
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

  const handleBulkAction = async () => {
    if (selectedTransfers.length === 0) {
      toast.error('يرجى اختيار تحويل واحد على الأقل');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/branches/transfers/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: bulkAction,
          transferIds: selectedTransfers,
          rejectionReason: bulkAction === 'reject' ? rejectionReason : undefined,
          comments: bulkComments,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.errors.length > 0) {
          toast.warning(`تمت معالجة ${data.summary.successful} تحويلات بنجاح، فشل ${data.summary.failed} تحويلات`);
        } else {
          toast.success(`تم ${bulkAction === 'approve' ? 'الموافقة على' : bulkAction === 'reject' ? 'رفض' : 'إكمال'} ${data.summary.successful} تحويلات بنجاح`);
        }

        setIsBulkDialogOpen(false);
        setSelectedTransfers([]);
        setBulkComments('');
        setRejectionReason('');
        fetchApprovals();
      } else {
        const error = await response.json();
        toast.error(error.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error processing bulk action:', error);
      toast.error('حدث خطأ في معالجة الطلب');
    } finally {
      setProcessing(false);
    }
  };

  const handleTransferSelection = (transferId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransfers([...selectedTransfers, transferId]);
    } else {
      setSelectedTransfers(selectedTransfers.filter(id => id !== transferId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingTransferIds = transfers
        .filter(t => t.status === 'PENDING')
        .map(t => t.id);
      setSelectedTransfers(pendingTransferIds);
    } else {
      setSelectedTransfers([]);
    }
  };

  const filteredTransfers = transfers.filter(transfer =>
    transfer.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.fromBranch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.toBranch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.requestedBy.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canBulkApprove = selectedTransfers.length > 0 && 
    selectedTransfers.every(id => transfers.find(t => t.id === id)?.status === 'PENDING');

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
          <h1 className="text-3xl font-bold tracking-tight">لوحة الموافقات على التحويلات</h1>
          <p className="text-muted-foreground">
            إدارة الموافقات على التحويلات المالية بين الفروع
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => fetchApprovals()} disabled={loading}>
            <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          {canBulkApprove && (
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CheckCircle className="ml-2 h-4 w-4" />
                  موافقة جماعية ({selectedTransfers.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>موافقة جماعية على التحويلات</DialogTitle>
                  <DialogDescription>
                    سيتم تطبيق الإجراء على {selectedTransfers.length} تحويلات مختارة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>الإجراء</Label>
                    <Select value={bulkAction} onValueChange={(value: any) => setBulkAction(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approve">الموافقة</SelectItem>
                        <SelectItem value="reject">الرفض</SelectItem>
                        <SelectItem value="complete">الإكمال</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {bulkAction === 'reject' && (
                    <div className="space-y-2">
                      <Label>سبب الرفض</Label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="يرجى توضيح سبب الرفض..."
                        required
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>ملاحظات إضافية (اختياري)</Label>
                    <Textarea
                      value={bulkComments}
                      onChange={(e) => setBulkComments(e.target.value)}
                      placeholder="أي ملاحظات إضافية..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleBulkAction} 
                    disabled={processing || (bulkAction === 'reject' && !rejectionReason)}
                  >
                    {processing ? 'جاري المعالجة...' : 'تنفيذ الإجراء'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              تحويلات تنتظر الموافقة
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معتمدة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              تحويلات تمت الموافقة عليها
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مرفوضة</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              تحويلات تم رفضها
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              تحويلات مكتملة
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
                placeholder="بحث في التحويلات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full md:w-64">
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
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle>التحويلات المطلوبة للموافقة</CardTitle>
          <CardDescription>
            قائمة التحويلات التي تتطلب إجراءات الموافقة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransfers.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">لا توجد تحويلات</h3>
              <p className="text-muted-foreground">
                لا توجد تحويلات تتطلب الموافقة حالياً
              </p>
            </div>
          ) : (
            <>
              {/* Bulk Actions Bar */}
              {selectedTransfers.length > 0 && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    تم اختيار {selectedTransfers.length} تحويلات. 
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => setIsBulkDialogOpen(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      موافقة جماعية
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTransfers([])}
                    >
                      إلغاء الاختيار
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <ResponsiveTable
                data={filteredTransfers}
                columns={[
                  {
                    key: 'referenceId',
                    label: 'رقم المرجع',
                    type: 'text',
                    mobilePriority: 'high',
                    format: (value) => <Badge variant="outline">{value}</Badge>
                  },
                  {
                    key: 'fromBranch',
                    label: 'من',
                    type: 'text',
                    mobilePriority: 'high',
                    format: (value) => (
                      <div>
                        <div className="font-medium">{value.name}</div>
                        <div className="text-sm text-muted-foreground">{value.code}</div>
                      </div>
                    )
                  },
                  {
                    key: 'toBranch',
                    label: 'إلى',
                    type: 'text',
                    mobilePriority: 'high',
                    format: (value) => (
                      <div>
                        <div className="font-medium">{value.name}</div>
                        <div className="text-sm text-muted-foreground">{value.code}</div>
                      </div>
                    )
                  },
                  {
                    key: 'amount',
                    label: 'المبلغ',
                    type: 'currency',
                    mobilePriority: 'high',
                    format: (value, _, row) => formatCurrency(value, row.currency)
                  },
                  {
                    key: 'requestedBy',
                    label: 'الطالب',
                    type: 'text',
                    mobilePriority: 'medium',
                    format: (value) => (
                      <div>
                        <div className="font-medium">{value.name}</div>
                        <div className="text-sm text-muted-foreground">{value.email}</div>
                      </div>
                    )
                  },
                  {
                    key: 'status',
                    label: 'الحالة',
                    type: 'status',
                    mobilePriority: 'high'
                  },
                  {
                    key: 'createdAt',
                    label: 'التاريخ',
                    type: 'date',
                    mobilePriority: 'medium'
                  },
                  {
                    key: 'actions',
                    label: 'الإجراءات',
                    type: 'actions',
                    mobilePriority: 'low',
                    format: (_, __, row) => (
                      <div className="flex items-center space-x-2">
                        {row.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setBulkAction('approve');
                                setSelectedTransfers([row.id]);
                                setIsBulkDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setBulkAction('reject');
                                setSelectedTransfers([row.id]);
                                setIsBulkDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {row.status === 'APPROVED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBulkAction('complete');
                              setSelectedTransfers([row.id]);
                              setIsBulkDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )
                  }
                ]}
                emptyState={{
                  title: 'لا توجد تحويلات',
                  description: 'لا توجد تحويلات تتطلب الموافقة حالياً'
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}