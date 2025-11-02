'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Car, Wrench, AlertTriangle, CheckCircle, Plus, Search, Filter, RefreshCw } from 'lucide-react'

interface MaintenanceSchedule {
  id: string
  vehicleId: string
  type: string
  title: string
  description?: string
  interval: number
  intervalKm?: number
  lastService?: Date
  nextService: Date
  estimatedCost?: number
  priority: string
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
  vehicle?: {
    id: string
    make: string
    model: string
    year: number
    stockNumber: string
  }
  creator?: {
    id: string
    name: string
    email: string
  }
}

interface MaintenanceRecord {
  id: string
  vehicleId: string
  scheduleId?: string
  type: string
  title: string
  description: string
  cost: number
  technician?: string
  startDate: Date
  endDate?: Date
  status: string
  notes?: string
  parts?: string
  laborHours?: number
  odometer?: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface MaintenancePart {
  id: string
  partNumber: string
  name: string
  category: string
  description?: string
  cost: number
  price: number
  quantity: number
  minStock: number
  maxStock: number
  location: string
  supplier: string
  status: string
  barcode?: string
  imageUrl?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface MaintenanceReminder {
  id: string
  scheduleId: string
  vehicleId: string
  title: string
  message: string
  reminderDate: Date
  sentDate?: Date
  status: string
  type: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState('schedules')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([])
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [parts, setParts] = useState<MaintenancePart[]>([])
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([])

  useEffect(() => {
    loadMaintenanceData()
  }, [])

  const loadMaintenanceData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load schedules
      const schedulesResponse = await fetch('/api/maintenance/schedules')
      if (schedulesResponse.ok) {
        const schedulesData = await schedulesResponse.json()
        setSchedules(schedulesData.schedules || [])
      }

      // Load records
      const recordsResponse = await fetch('/api/maintenance/records')
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json()
        setRecords(recordsData.records || [])
      }

      // Load parts (using inventory items with maintenance category)
      const partsResponse = await fetch('/api/inventory/items?category=maintenance')
      if (partsResponse.ok) {
        const partsData = await partsResponse.json()
        setParts(partsData.items || [])
      }

      // Load reminders
      const remindersResponse = await fetch('/api/maintenance/reminders')
      if (remindersResponse.ok) {
        const remindersData = await remindersResponse.json()
        setReminders(remindersData.reminders || [])
      }
    } catch (error) {
      console.error('Error loading maintenance data:', error)
      setError('فشل في تحميل بيانات الصيانة')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      case 'SCHEDULED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'مكتمل'
      case 'IN_PROGRESS':
        return 'قيد التنفيذ'
      case 'PENDING':
        return 'معلق'
      case 'SCHEDULED':
        return 'مجدول'
      case 'OVERDUE':
        return 'متأخر'
      case 'CANCELLED':
        return 'ملغي'
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'ROUTINE':
        return 'دوري'
      case 'PREVENTIVE':
        return 'وقائي'
      case 'CORRECTIVE':
        return 'تصحيحي'
      case 'EMERGENCY':
        return 'طوارئ'
      case 'INSPECTION':
        return 'فحص'
      case 'OIL_CHANGE':
        return 'تغيير زيت'
      case 'TIRE_SERVICE':
        return 'خدمة إطارات'
      case 'BRAKE_SERVICE':
        return 'خدمة فرامل'
      case 'BATTERY_SERVICE':
        return 'خدمة بطارية'
      case 'AIR_CONDITIONING':
        return 'تكييف هواء'
      case 'ENGINE_SERVICE':
        return 'خدمة محرك'
      case 'TRANSMISSION_SERVICE':
        return 'خدمة ناقل حركة'
      case 'OTHER':
        return 'أخرى'
      default:
        return type
    }
  }

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || schedule.priority === statusFilter
    const matchesType = typeFilter === 'all' || schedule.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    const matchesType = typeFilter === 'all' || record.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || part.status === statusFilter
    const matchesType = typeFilter === 'all' || part.category === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reminder.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || reminder.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <AdminRoute>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">نظام الصيانة الدورية</h1>
              <p className="text-gray-600 mt-2">إدارة جداول الصيانة، السجلات، قطع الغيار والتذكيرات</p>
            </div>
            <Button variant="outline" disabled>
              <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
              جاري التحميل...
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminRoute>
    )
  }

  if (error) {
    return (
      <AdminRoute>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">نظام الصيانة الدورية</h1>
              <p className="text-gray-600 mt-2">إدارة جداول الصيانة، السجلات، قطع الغيار والتذكيرات</p>
            </div>
            <Button variant="outline" onClick={loadMaintenanceData}>
              <RefreshCw className="ml-2 h-4 w-4" />
              إعادة المحاولة
            </Button>
          </div>
          
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">نظام الصيانة الدورية</h1>
            <p className="text-gray-600 mt-2">إدارة جداول الصيانة، السجلات، قطع الغيار والتذكيرات</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadMaintenanceData}>
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة جديد
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">جداول الصيانة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
            <p className="text-xs text-muted-foreground">
              {schedules.filter(s => s.priority === 'PENDING').length} معلقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سجلات الصيانة</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground">
              {records.filter(r => r.status === 'IN_PROGRESS').length} قيد التنفيذ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قطع الغيار</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parts.length}</div>
            <p className="text-xs text-muted-foreground">
              {parts.filter(p => p.status === 'LOW_STOCK').length} مخزون منخفض
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التذكيرات</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminders.length}</div>
            <p className="text-xs text-muted-foreground">
              {reminders.filter(r => r.status === 'PENDING').length} في الانتظار
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="PENDING">معلق</SelectItem>
                <SelectItem value="SCHEDULED">مجدول</SelectItem>
                <SelectItem value="IN_PROGRESS">قيد التنفيذ</SelectItem>
                <SelectItem value="COMPLETED">مكتمل</SelectItem>
                <SelectItem value="OVERDUE">متأخر</SelectItem>
                <SelectItem value="CANCELLED">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="ROUTINE">دوري</SelectItem>
                <SelectItem value="PREVENTIVE">وقائي</SelectItem>
                <SelectItem value="CORRECTIVE">تصحيحي</SelectItem>
                <SelectItem value="EMERGENCY">طوارئ</SelectItem>
                <SelectItem value="INSPECTION">فحص</SelectItem>
                <SelectItem value="OIL_CHANGE">تغيير زيت</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedules">جداول الصيانة</TabsTrigger>
          <TabsTrigger value="records">سجلات الصيانة</TabsTrigger>
          <TabsTrigger value="parts">قطع الغيار</TabsTrigger>
          <TabsTrigger value="reminders">التذكيرات</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>جداول الصيانة</CardTitle>
              <CardDescription>إدارة جداول الصيانة الدورية للمركبات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSchedules.map((schedule) => (
                  <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{schedule.title}</h3>
                            <Badge className={getStatusColor(schedule.priority)}>
                              {getStatusText(schedule.priority)}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{schedule.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>النوع: {getTypeText(schedule.type)}</span>
                            <span>الفترة: {schedule.interval} يوم</span>
                            {schedule.intervalKm && (
                              <span>المسافة: {schedule.intervalKm} كم</span>
                            )}
                            <span>التكلفة المقدرة: {schedule.estimatedCost} ج.م</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              التاريخ التالي: {schedule.nextService.toLocaleDateString('ar-EG')}
                            </span>
                            {schedule.lastService && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                آخر خدمة: {schedule.lastService.toLocaleDateString('ar-EG')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">تعديل</Button>
                          <Button variant="outline" size="sm">حذف</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>سجلات الصيانة</CardTitle>
              <CardDescription>سجلات الصيانة المنجزة وقيد التنفيذ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{record.title}</h3>
                            <Badge className={getStatusColor(record.status)}>
                              {getStatusText(record.status)}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{record.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>النوع: {getTypeText(record.type)}</span>
                            <span>الفني: {record.technician}</span>
                            <span>التكلفة: {record.cost} ج.م</span>
                            {record.laborHours && (
                              <span>ساعات العمل: {record.laborHours}</span>
                            )}
                            {record.odometer && (
                              <span>عداد الكيلومترات: {record.odometer} كم</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              تاريخ البدء: {record.startDate.toLocaleDateString('ar-EG')}
                            </span>
                            {record.endDate && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                تاريخ الانتهاء: {record.endDate.toLocaleDateString('ar-EG')}
                              </span>
                            )}
                          </div>
                          {record.notes && (
                            <p className="text-sm text-gray-600">ملاحظات: {record.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">تعديل</Button>
                          <Button variant="outline" size="sm">حذف</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parts">
          <Card>
            <CardHeader>
              <CardTitle>قطع الغيار</CardTitle>
              <CardDescription>إدارة مخزون قطع الغيار</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredParts.map((part) => (
                  <Card key={part.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{part.name}</h3>
                            <Badge className={part.status === 'LOW_STOCK' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                              {part.status === 'AVAILABLE' ? 'متوفر' : 
                               part.status === 'LOW_STOCK' ? 'مخزون منخفض' :
                               part.status === 'OUT_OF_STOCK' ? 'غير متوفر' : part.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{part.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>رقم القطعة: {part.partNumber}</span>
                            <span>الفئة: {part.category}</span>
                            <span>الكمية: {part.quantity}</span>
                            <span>الحد الأدنى: {part.minStock}</span>
                            <span>التكلفة: {part.cost} ج.م</span>
                            <span>السعر: {part.price} ج.م</span>
                          </div>
                          {part.supplier && (
                            <p className="text-sm text-gray-600">المورد: {part.supplier}</p>
                          )}
                          {part.location && (
                            <p className="text-sm text-gray-600">الموقع: {part.location}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">تعديل</Button>
                          <Button variant="outline" size="sm">حذف</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle>التذكيرات</CardTitle>
              <CardDescription>إدارة تذكيرات الصيانة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReminders.map((reminder) => (
                  <Card key={reminder.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{reminder.title}</h3>
                            <Badge className={getStatusColor(reminder.status)}>
                              {getStatusText(reminder.status)}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{reminder.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              تاريخ التذكير: {reminder.reminderDate.toLocaleDateString('ar-EG')}
                            </span>
                            <span>النوع: {reminder.type}</span>
                            {reminder.sentDate && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                تم الإرسال: {reminder.sentDate.toLocaleDateString('ar-EG')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">تعديل</Button>
                          <Button variant="outline" size="sm">حذف</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminRoute>
  )
}