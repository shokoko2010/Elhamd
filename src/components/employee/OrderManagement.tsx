'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  ShoppingCart, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Car,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  CreditCard
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  carId: string
  carDetails: {
    make: string
    model: string
    year: number
    price: number
  }
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  orderDate: string
  totalAmount: number
  paymentStatus: 'pending' | 'paid' | 'failed'
  notes?: string
}

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  status: 'available' | 'sold' | 'reserved'
}

interface OrderFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  carId: string
  totalAmount: number
  notes?: string
}

export default function OrderManagement() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    carId: '',
    totalAmount: 0,
    notes: ''
  })

  useEffect(() => {
    fetchOrders()
    fetchCars()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, paymentFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/employee/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        // If API fails, use mock data for demonstration
        setOrders([
          {
            id: '1',
            customerName: 'أحمد محمد',
            customerEmail: 'ahmed@example.com',
            customerPhone: '01234567890',
            carId: '1',
            carDetails: {
              make: 'Toyota',
              model: 'Camry',
              year: 2023,
              price: 850000
            },
            status: 'pending',
            orderDate: new Date().toISOString(),
            totalAmount: 850000,
            paymentStatus: 'pending',
            notes: 'يريد السيارة خلال أسبوع'
          },
          {
            id: '2',
            customerName: 'فاطمة علي',
            customerEmail: 'fatima@example.com',
            customerPhone: '0112345678',
            carId: '2',
            carDetails: {
              make: 'Honda',
              model: 'Accord',
              year: 2022,
              price: 750000
            },
            status: 'confirmed',
            orderDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            totalAmount: 750000,
            paymentStatus: 'paid',
            notes: 'دفعت مقدم'
          }
        ])
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات الطلبات',
        variant: 'destructive'
      })
      // Use mock data as fallback
      setOrders([
        {
          id: '1',
          customerName: 'أحمد محمد',
          customerEmail: 'ahmed@example.com',
          customerPhone: '01234567890',
          carId: '1',
          carDetails: {
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            price: 850000
          },
          status: 'pending',
          orderDate: new Date().toISOString(),
          totalAmount: 850000,
          paymentStatus: 'pending',
          notes: 'يريد السيارة خلال أسبوع'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/employee/cars')
      if (response.ok) {
        const data = await response.json()
        setCars(data.filter((car: Car) => car.status === 'available'))
      } else {
        // If API fails, use mock data for demonstration
        setCars([
          {
            id: '1',
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            price: 850000,
            status: 'available'
          },
          {
            id: '2',
            make: 'Honda',
            model: 'Accord',
            year: 2022,
            price: 750000,
            status: 'available'
          }
        ])
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات السيارات',
        variant: 'destructive'
      })
      // Use mock data as fallback
      setCars([
        {
          id: '1',
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          price: 850000,
          status: 'available'
        }
      ])
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.carDetails.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.carDetails.model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter)
    }

    setFilteredOrders(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingOrder ? `/api/employee/orders/${editingOrder.id}` : '/api/employee/orders'
      const method = editingOrder ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: editingOrder ? 'تم تحديث الطلب بنجاح' : 'تمت إضافة الطلب بنجاح'
        })
        fetchOrders()
        setIsDialogOpen(false)
        resetForm()
      } else {
        throw new Error('فشل في حفظ الطلب')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الطلب',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (orderId: string) => {
    try {
      const response = await fetch(`/api/employee/orders/${orderId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم حذف الطلب بنجاح'
        })
        fetchOrders()
      } else {
        throw new Error('فشل في حذف الطلب')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الطلب',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setFormData({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      carId: order.carId,
      totalAmount: order.totalAmount,
      notes: order.notes
    })
    setIsDialogOpen(true)
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/employee/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم تحديث حالة الطلب بنجاح'
        })
        fetchOrders()
      } else {
        throw new Error('فشل في تحديث حالة الطلب')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الطلب',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setEditingOrder(null)
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      carId: '',
      totalAmount: 0,
      notes: ''
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary', label: 'معلق', icon: Clock },
      confirmed: { variant: 'default', label: 'مؤكد', icon: CheckCircle },
      processing: { variant: 'outline', label: 'قيد المعالجة', icon: AlertCircle },
      completed: { variant: 'outline', label: 'مكتمل', icon: CheckCircle },
      cancelled: { variant: 'destructive', label: 'ملغى', icon: XCircle }
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary', label: 'معلق', icon: Clock },
      paid: { variant: 'default', label: 'مدفوع', icon: CheckCircle },
      failed: { variant: 'destructive', label: 'فشل', icon: XCircle }
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
          <p className="text-gray-600">تتبع وإدارة جميع طلبات العملاء</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة طلب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? 'تعديل طلب' : 'إضافة طلب جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingOrder ? 'تعديل معلومات الطلب الموجود' : 'إضافة طلب جديد للعميل'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">اسم العميل</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">البريد الإلكتروني</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">رقم الهاتف</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="carId">السيارة</Label>
                  <Select value={formData.carId} onValueChange={(value) => {
                    const selectedCar = cars.find(car => car.id === value)
                    setFormData({
                      ...formData, 
                      carId: value, 
                      totalAmount: selectedCar ? selectedCar.price : 0
                    })
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر السيارة" />
                    </SelectTrigger>
                    <SelectContent>
                      {cars.map((car) => (
                        <SelectItem key={car.id} value={car.id}>
                          {car.make} {car.model} ({car.year}) - {car.price.toLocaleString()} جنيه
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="totalAmount">المبلغ الإجمالي (جنيه)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({...formData, totalAmount: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingOrder ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث بالعميل أو السيارة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغى</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المدفوعات</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">طلب #{order.id.slice(-6)}</h3>
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(order.orderDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(order)}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف طلب العميل {order.customerName}؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(order.id)}>
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">معلومات العميل</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{order.customerEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{order.customerPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">معلومات السيارة</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-400" />
                          <span>{order.carDetails.make} {order.carDetails.model} ({order.carDetails.year})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>{order.carDetails.price.toLocaleString()} جنيه</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold">
                      المبلغ الإجمالي: {order.totalAmount.toLocaleString()} جنيه
                    </div>
                    {order.notes && (
                      <div className="text-sm text-gray-600">
                        ملاحظات: {order.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                      >
                        تأكيد الطلب
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusUpdate(order.id, 'processing')}
                      >
                        بدء المعالجة
                      </Button>
                    )}
                    {order.status === 'processing' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                      >
                        إتمام الطلب
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">لا توجد طلبات مطابقة للبحث</p>
            <Button onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
              setPaymentFilter('all')
            }}>
              مسح الفلاتر
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}