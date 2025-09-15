'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Car,
  Wrench,
  Eye,
  MapPin,
  Save,
  X,
  Filter
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  role: string
  address?: string
  licenseNumber?: string
  createdAt: string
  lastActivity?: string
  totalBookings: number
  totalSpent: number
  testDriveBookings: any[]
  serviceBookings: any[]
}

interface CustomerFormData {
  name: string
  email: string
  phone: string
  role: string
  address?: string
  licenseNumber?: string
}

export default function AdminCustomersPage() {
  return (
    <AdminRoute>
      <CustomersContent />
    </AdminRoute>
  )
}

function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    role: '',
    activity: ''
  })
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    address: '',
    licenseNumber: ''
  })

  useEffect(() => {
    // Mock data - will be replaced with API call
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'أحمد محمد علي',
        email: 'ahmed.mohamed@email.com',
        phone: '+20 100 123 4567',
        role: 'CUSTOMER',
        address: 'القاهرة، مصر',
        licenseNumber: '123456789',
        createdAt: '2024-01-10T10:00:00Z',
        lastActivity: '2024-01-15T14:30:00Z',
        totalBookings: 3,
        totalSpent: 1200000,
        testDriveBookings: [
          { id: '1', vehicleName: 'Tata Nexon', date: '2024-01-15', status: 'completed' },
          { id: '2', vehicleName: 'Tata Punch', date: '2024-01-10', status: 'completed' }
        ],
        serviceBookings: [
          { id: '1', serviceName: 'صيانة دورية', date: '2024-01-12', status: 'completed', price: 350 }
        ]
      },
      {
        id: '2',
        name: 'فاطمة خالد عبد الله',
        email: 'fatima.khaled@email.com',
        phone: '+20 102 987 6543',
        role: 'CUSTOMER',
        address: 'الإسكندرية، مصر',
        licenseNumber: '987654321',
        createdAt: '2024-01-09T10:00:00Z',
        lastActivity: '2024-01-14T16:00:00Z',
        totalBookings: 2,
        totalSpent: 850000,
        testDriveBookings: [
          { id: '3', vehicleName: 'Tata Tiago', date: '2024-01-14', status: 'confirmed' }
        ],
        serviceBookings: [
          { id: '2', serviceName: 'تغيير زيت', date: '2024-01-12', status: 'completed', price: 300 }
        ]
      },
      {
        id: '3',
        name: 'محمد حسن إبراهيم',
        email: 'mohamed.hassan@email.com',
        phone: '+20 111 555 1234',
        role: 'CUSTOMER',
        address: 'الجيزة، مصر',
        licenseNumber: '456789123',
        createdAt: '2024-01-08T10:00:00Z',
        lastActivity: '2024-01-13T09:00:00Z',
        totalBookings: 1,
        totalSpent: 650000,
        testDriveBookings: [
          { id: '4', vehicleName: 'Tata Harrier', date: '2024-01-13', status: 'completed' }
        ],
        serviceBookings: []
      },
      {
        id: '4',
        name: 'سارة أحمد محمود',
        email: 'sara.ahmed@email.com',
        phone: '+20 112 333 4444',
        role: 'CUSTOMER',
        address: 'القاهرة، مصر',
        licenseNumber: '789123456',
        createdAt: '2024-01-07T10:00:00Z',
        lastActivity: '2024-01-12T11:00:00Z',
        totalBookings: 4,
        totalSpent: 2100000,
        testDriveBookings: [
          { id: '5', vehicleName: 'Tata Safari', date: '2024-01-12', status: 'cancelled' },
          { id: '6', vehicleName: 'Tata Nexon EV', date: '2024-01-08', status: 'completed' }
        ],
        serviceBookings: [
          { id: '3', serviceName: 'فحص شامل', date: '2024-01-10', status: 'completed', price: 450 },
          { id: '4', serviceName: 'تلميع', date: '2024-01-09', status: 'completed', price: 200 }
        ]
      },
      {
        id: '5',
        name: 'عمر خالد سامي',
        email: 'omar.khaled@email.com',
        phone: '+20 106 777 8888',
        role: 'ADMIN',
        address: 'القاهرة، مصر',
        licenseNumber: '321654987',
        createdAt: '2024-01-01T10:00:00Z',
        lastActivity: '2024-01-15T18:00:00Z',
        totalBookings: 0,
        totalSpent: 0,
        testDriveBookings: [],
        serviceBookings: []
      }
    ]
    
    setCustomers(mockCustomers)
    setFilteredCustomers(mockCustomers)
    setLoading(false)
  }, [])

  useEffect(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm) ||
                           customer.licenseNumber?.includes(searchTerm)
      
      const matchesRole = !filters.role || customer.role === filters.role
      
      let matchesActivity = true
      if (filters.activity === 'active') {
        const lastActivity = new Date(customer.lastActivity || customer.createdAt)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        matchesActivity = lastActivity >= sevenDaysAgo
      } else if (filters.activity === 'inactive') {
        const lastActivity = new Date(customer.lastActivity || customer.createdAt)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        matchesActivity = lastActivity < thirtyDaysAgo
      }

      return matchesSearch && matchesRole && matchesActivity
    })

    setFilteredCustomers(filtered)
  }, [customers, searchTerm, filters])

  const handleAddCustomer = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'CUSTOMER',
      address: '',
      licenseNumber: ''
    })
    setShowAddDialog(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      role: customer.role,
      address: customer.address,
      licenseNumber: customer.licenseNumber
    })
    setShowEditDialog(true)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowDeleteDialog(true)
  }

  const handleViewCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowViewDialog(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        totalBookings: 0,
        totalSpent: 0,
        testDriveBookings: [],
        serviceBookings: []
      }
      
      setCustomers(prev => [...prev, newCustomer])
      setShowAddDialog(false)
    } catch (error) {
      console.error('Error adding customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCustomer) return
    
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedCustomer: Customer = {
        ...editingCustomer,
        ...formData
      }
      
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? updatedCustomer : c))
      setShowEditDialog(false)
      setEditingCustomer(null)
    } catch (error) {
      console.error('Error updating customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editingCustomer) return
    
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCustomers(prev => prev.filter(c => c.id !== editingCustomer.id))
      setShowDeleteDialog(false)
      setEditingCustomer(null)
    } catch (error) {
      console.error('Error deleting customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      customer: { variant: 'default' as const, label: 'عميل' },
      admin: { variant: 'secondary' as const, label: 'مشرف' },
      staff: { variant: 'outline' as const, label: 'موظف' }
    }
    
    const config = roleConfig[role.toLowerCase() as keyof typeof roleConfig] || roleConfig.customer
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getActivityStatus = (customer: Customer) => {
    if (!customer.lastActivity) return 'inactive'
    
    const lastActivity = new Date(customer.lastActivity)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    return lastActivity >= sevenDaysAgo ? 'active' : 'inactive'
  }

  const roleOptions = [
    { value: 'CUSTOMER', label: 'عميل' },
    { value: 'ADMIN', label: 'مشرف' },
    { value: 'STAFF', label: 'موظف' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة العملاء</h1>
              <p className="text-gray-600">إدارة عملاء الهامد للسيارات وحساباتهم</p>
            </div>
            <Button onClick={handleAddCustomer}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة عميل جديد
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground">
                {customers.filter(c => getActivityStatus(c) === 'active').length} نشطين
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العملاء الجدد</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter(c => {
                  const created = new Date(c.createdAt)
                  const thirtyDaysAgo = new Date()
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                  return created >= thirtyDaysAgo
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                خلال 30 يوم
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط الإنفاق</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.length > 0 ? formatPrice(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length) : formatPrice(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                للعميل الواحد
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.reduce((sum, c) => sum + c.totalBookings, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                جميع الحجوزات
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="بحث بالاسم، البريد، أو الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={filters.role} onValueChange={(value) => setFilters({...filters, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الأدوار</SelectItem>
                  {roleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.activity} onValueChange={(value) => setFilters({...filters, activity: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="النشاط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع العملاء</SelectItem>
                  <SelectItem value="active">نشطين (آخر 7 أيام)</SelectItem>
                  <SelectItem value="inactive">غير نشطين (أكثر من 30 يوم)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">معلومات الاتصال</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النشاط</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحجوزات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإنفاق</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">جاري التحميل...</p>
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">لا توجد عملاء مطابقين للبحث</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getRoleBadge(customer.role)}
                            </div>
                            {customer.licenseNumber && (
                              <div className="text-xs text-gray-500 mt-1">
                                رخصة: {customer.licenseNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          </div>
                          {customer.address && (
                            <div className="text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {customer.address}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(customer.createdAt).toLocaleDateString('ar-EG')}
                          </div>
                          <div className="text-sm text-gray-500">
                            آخر نشاط: {customer.lastActivity ? new Date(customer.lastActivity).toLocaleDateString('ar-EG') : 'لا يوجد'}
                          </div>
                          <Badge 
                            variant={getActivityStatus(customer) === 'active' ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {getActivityStatus(customer) === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {customer.totalBookings} حجز
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.testDriveBookings.length} قيادة تجريبية
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.serviceBookings.length} خدمة
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(customer.totalSpent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة عميل جديد</DialogTitle>
            <DialogDescription>أدخل بيانات العميل الجديد</DialogDescription>
          </DialogHeader>
          <CustomerForm 
            formData={formData} 
            setFormData={setFormData}
            onSubmit={handleSubmitAdd}
            loading={loading}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل عميل</DialogTitle>
            <DialogDescription>تعديل بيانات العميل</DialogDescription>
          </DialogHeader>
          <CustomerForm 
            formData={formData} 
            setFormData={setFormData}
            onSubmit={handleSubmitEdit}
            loading={loading}
            onCancel={() => {
              setShowEditDialog(false)
              setEditingCustomer(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Customer Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف عميل</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف العميل {editingCustomer?.name}؟
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'جاري الحذف...' : 'حذف'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
            <DialogDescription>معلومات كاملة عن العميل</DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <CustomerDetails customer={editingCustomer} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CustomerForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  loading, 
  onCancel 
}: {
  formData: CustomerFormData
  setFormData: (data: CustomerFormData) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  onCancel: () => void
}) {
  const roleOptions = [
    { value: 'CUSTOMER', label: 'عميل' },
    { value: 'ADMIN', label: 'مشرف' },
    { value: 'STAFF', label: 'موظف' }
  ]

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">الاسم الكامل *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="email">البريد الإلكتروني *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="phone">رقم الهاتف *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="role">الدور *</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الدور" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="address">العنوان</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          rows={2}
        />
      </div>
      
      <div>
        <Label htmlFor="licenseNumber">رقم رخصة القيادة</Label>
        <Input
          id="licenseNumber"
          value={formData.licenseNumber}
          onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="ml-2 h-4 w-4" />
          إلغاء
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          <Save className="ml-2 h-4 w-4" />
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </div>
    </form>
  )
}

function CustomerDetails({ customer }: { customer: Customer }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-3">المعلومات الأساسية</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-gray-600">الاسم</Label>
            <p className="font-medium">{customer.name}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">البريد الإلكتروني</Label>
            <p className="font-medium">{customer.email}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">رقم الهاتف</Label>
            <p className="font-medium">{customer.phone}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">الدور</Label>
            <p className="font-medium">{customer.role === 'CUSTOMER' ? 'عميل' : customer.role === 'ADMIN' ? 'مشرف' : 'موظف'}</p>
          </div>
          {customer.address && (
            <div className="col-span-2">
              <Label className="text-sm text-gray-600">العنوان</Label>
              <p className="font-medium">{customer.address}</p>
            </div>
          )}
          {customer.licenseNumber && (
            <div>
              <Label className="text-sm text-gray-600">رقم الرخصة</Label>
              <p className="font-medium">{customer.licenseNumber}</p>
            </div>
          )}
          <div>
            <Label className="text-sm text-gray-600">تاريخ التسجيل</Label>
            <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-3">ملخص النشاط</h3>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{customer.totalBookings}</div>
              <p className="text-sm text-gray-600">إجمالي الحجوزات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{customer.testDriveBookings.length}</div>
              <p className="text-sm text-gray-600">قيادة تجريبية</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{customer.serviceBookings.length}</div>
              <p className="text-sm text-gray-600">خدمات</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4">
          <Label className="text-sm text-gray-600">إجمالي الإنفاق</Label>
          <p className="text-xl font-bold text-green-600">{formatPrice(customer.totalSpent)}</p>
        </div>
      </div>

      {/* Recent Bookings */}
      {customer.testDriveBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">حجوزات القيادة التجريبية</h3>
          <div className="space-y-2">
            {customer.testDriveBookings.map((booking) => (
              <div key={booking.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{booking.vehicleName}</p>
                  <p className="text-sm text-gray-600">{booking.date}</p>
                </div>
                <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                  {booking.status === 'completed' ? 'مكتمل' : booking.status === 'confirmed' ? 'مؤكد' : 'قيد الانتظار'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Services */}
      {customer.serviceBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">حجوزات الخدمات</h3>
          <div className="space-y-2">
            {customer.serviceBookings.map((booking) => (
              <div key={booking.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{booking.serviceName}</p>
                  <p className="text-sm text-gray-600">{booking.date}</p>
                </div>
                <div className="text-right">
                  <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                    {booking.status === 'completed' ? 'مكتمل' : booking.status === 'confirmed' ? 'مؤكد' : 'قيد الانتظار'}
                  </Badge>
                  <p className="text-sm font-medium text-green-600 mt-1">{formatPrice(booking.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}