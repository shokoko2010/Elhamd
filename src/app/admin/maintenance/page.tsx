'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Car, Wrench, AlertTriangle, CheckCircle, Plus, Search, Filter } from 'lucide-react'
import { MaintenanceSchedule, MaintenanceRecord, MaintenancePart, MaintenanceReminder } from '@/types/maintenance'
import { MaintenanceStatus, MaintenanceType, PartStatus, PartCategory } from '@/types/maintenance'

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState('schedules')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  
  // Mock data - replace with API calls
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([
    {
      id: '1',
      vehicleId: '1',
      type: MaintenanceType.ROUTINE,
      title: 'صيانة دورية',
      description: 'تغيير زيت المحرك والفلاتر',
      interval: 90,
      intervalKm: 5000,
      lastService: new Date('2024-01-15'),
      nextService: new Date('2024-04-15'),
      estimatedCost: 500,
      priority: MaintenanceStatus.PENDING,
      isActive: true,
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      vehicleId: '2',
      type: MaintenanceType.INSPECTION,
      title: 'فحص سنوي',
      description: 'فحص شامل للمركبة',
      interval: 365,
      intervalKm: 20000,
      lastService: new Date('2023-12-01'),
      nextService: new Date('2024-12-01'),
      estimatedCost: 1000,
      priority: MaintenanceStatus.SCHEDULED,
      isActive: true,
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  const [records, setRecords] = useState<MaintenanceRecord[]>([
    {
      id: '1',
      vehicleId: '1',
      scheduleId: '1',
      type: MaintenanceType.OIL_CHANGE,
      title: 'تغيير زيت المحرك',
      description: 'تغيير زيت المحرك والفلاتر',
      cost: 450,
      technician: 'أحمد محمد',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-15'),
      status: MaintenanceStatus.COMPLETED,
      notes: 'تم تغيير الزيت والفلاتر بنجاح',
      parts: JSON.stringify([{ name: 'زيت محرك', quantity: 1, cost: 200 }]),
      laborHours: 2,
      odometer: 25000,
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  const [parts, setParts] = useState<MaintenancePart[]>([
    {
      id: '1',
      partNumber: 'OIL-001',
      name: 'زيت محرك سينثتك 5W-30',
      category: PartCategory.OIL,
      description: 'زيت محرك عالي الجودة',
      cost: 150,
      price: 200,
      quantity: 50,
      minStock: 10,
      maxStock: 100,
      location: 'المستودع A',
      supplier: 'شركة الزيوت العربية',
      status: PartStatus.AVAILABLE,
      barcode: '123456789',
      imageUrl: '/images/oil.jpg',
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  const [reminders, setReminders] = useState<MaintenanceReminder[]>([
    {
      id: '1',
      scheduleId: '1',
      vehicleId: '1',
      title: 'تذكير بالصيانة الدورية',
      message: 'حان موعد الصيانة الدورية للمركبة',
      reminderDate: new Date('2024-04-10'),
      sentDate: undefined,
      status: MaintenanceStatus.PENDING,
      type: 'EMAIL',
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.COMPLETED:
        return 'bg-green-100 text-green-800'
      case MaintenanceStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800'
      case MaintenanceStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      case MaintenanceStatus.OVERDUE:
        return 'bg-red-100 text-red-800'
      case MaintenanceStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.COMPLETED:
        return 'مكتمل'
      case MaintenanceStatus.IN_PROGRESS:
        return 'قيد التنفيذ'
      case MaintenanceStatus.PENDING:
        return 'معلق'
      case MaintenanceStatus.SCHEDULED:
        return 'مجدول'
      case MaintenanceStatus.OVERDUE:
        return 'متأخر'
      case MaintenanceStatus.CANCELLED:
        return 'ملغي'
      default:
        return status
    }
  }

  const getTypeText = (type: MaintenanceType) => {
    switch (type) {
      case MaintenanceType.ROUTINE:
        return 'دوري'
      case MaintenanceType.PREVENTIVE:
        return 'وقائي'
      case MaintenanceType.CORRECTIVE:
        return 'تصحيحي'
      case MaintenanceType.EMERGENCY:
        return 'طوارئ'
      case MaintenanceType.INSPECTION:
        return 'فحص'
      case MaintenanceType.OIL_CHANGE:
        return 'تغيير زيت'
      case MaintenanceType.TIRE_SERVICE:
        return 'خدمة إطارات'
      case MaintenanceType.BRAKE_SERVICE:
        return 'خدمة فرامل'
      case MaintenanceType.BATTERY_SERVICE:
        return 'خدمة بطارية'
      case MaintenanceType.AIR_CONDITIONING:
        return 'تكييف هواء'
      case MaintenanceType.ENGINE_SERVICE:
        return 'خدمة محرك'
      case MaintenanceType.TRANSMISSION_SERVICE:
        return 'خدمة ناقل حركة'
      case MaintenanceType.OTHER:
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">نظام الصيانة الدورية</h1>
          <p className="text-gray-600 mt-2">إدارة جداول الصيانة، السجلات، قطع الغيار والتذكيرات</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة جديد
        </Button>
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
              {schedules.filter(s => s.priority === MaintenanceStatus.PENDING).length} معلقة
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
              {records.filter(r => r.status === MaintenanceStatus.IN_PROGRESS).length} قيد التنفيذ
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
              {parts.filter(p => p.status === PartStatus.LOW_STOCK).length} مخزون منخفض
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
              {reminders.filter(r => r.status === MaintenanceStatus.PENDING).length} في الانتظار
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
                <SelectItem value={MaintenanceStatus.PENDING}>معلق</SelectItem>
                <SelectItem value={MaintenanceStatus.SCHEDULED}>مجدول</SelectItem>
                <SelectItem value={MaintenanceStatus.IN_PROGRESS}>قيد التنفيذ</SelectItem>
                <SelectItem value={MaintenanceStatus.COMPLETED}>مكتمل</SelectItem>
                <SelectItem value={MaintenanceStatus.OVERDUE}>متأخر</SelectItem>
                <SelectItem value={MaintenanceStatus.CANCELLED}>ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value={MaintenanceType.ROUTINE}>دوري</SelectItem>
                <SelectItem value={MaintenanceType.PREVENTIVE}>وقائي</SelectItem>
                <SelectItem value={MaintenanceType.CORRECTIVE}>تصحيحي</SelectItem>
                <SelectItem value={MaintenanceType.EMERGENCY}>طوارئ</SelectItem>
                <SelectItem value={MaintenanceType.INSPECTION}>فحص</SelectItem>
                <SelectItem value={MaintenanceType.OIL_CHANGE}>تغيير زيت</SelectItem>
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
                            <Badge className={part.status === PartStatus.LOW_STOCK ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                              {part.status === PartStatus.AVAILABLE ? 'متوفر' : 
                               part.status === PartStatus.LOW_STOCK ? 'مخزون منخفض' :
                               part.status === PartStatus.OUT_OF_STOCK ? 'غير متوفر' : part.status}
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
  )
}