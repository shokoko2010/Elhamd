'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Archive, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ArchiveRestore,
  Trash2,
  FileText,
  Calendar,
  User,
  Hash,
  Package,
  Image as ImageIcon,
  FileVideo,
  FileAudio
} from 'lucide-react'

interface ArchiveItem {
  id: string
  title: string
  type: 'page' | 'vehicle' | 'booking' | 'media' | 'document'
  content: string
  status: 'archived' | 'deleted'
  archivedAt: string
  archivedBy: string
  originalId?: string
  metadata?: {
    size?: string
    format?: string
    author?: string
    category?: string
  }
}

export default function AdminArchivePage() {
  return <ArchiveContent />
}

function ArchiveContent() {
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    loadArchiveData()
  }, [])

  const loadArchiveData = async () => {
    setLoading(true)
    try {
      // Archive API not available yet - set empty array
      // TODO: Implement archive API endpoint
      setArchiveItems([])
    } catch (error) {
      console.error('Error loading archive data:', error)
      setArchiveItems([])
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = archiveItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || item.type === filterType
    const matchesTab = activeTab === 'all' || item.status === activeTab
    
    return matchesSearch && matchesType && matchesTab
  })

  const handleViewDetails = (item: ArchiveItem) => {
    setSelectedItem(item)
    setShowDetailsDialog(true)
  }

  const handleRestore = async (id: string) => {
    if (confirm('هل أنت متأكد من استعادة هذا العنصر من الأرشيف؟')) {
      setArchiveItems(prev => prev.filter(item => item.id !== id))
      // In a real app, this would call an API to restore the item
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من الحذف النهائي لهذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setArchiveItems(prev => prev.filter(item => item.id !== id))
      // In a real app, this would call an API to permanently delete the item
    }
  }

  const getTypeIcon = (type: string) => {
    const iconMap = {
      page: FileText,
      vehicle: Package,
      booking: Calendar,
      media: ImageIcon,
      document: FileText
    }
    const Icon = iconMap[type as keyof typeof iconMap] || FileText
    return <Icon className="h-5 w-5" />
  }

  const getTypeLabel = (type: string) => {
    const labelMap = {
      page: 'صفحة',
      vehicle: 'مركبة',
      booking: 'حجز',
      media: 'وسائط',
      document: 'مستند'
    }
    return labelMap[type as keyof typeof labelMap] || type
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      archived: { variant: 'secondary' as const, label: 'مؤرشف' },
      deleted: { variant: 'destructive' as const, label: 'محذوف' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.archived
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const typeOptions = [
    { value: 'all', label: 'الكل' },
    { value: 'page', label: 'صفحات' },
    { value: 'vehicle', label: 'مركبات' },
    { value: 'booking', label: 'حجوزات' },
    { value: 'media', label: 'وسائط' },
    { value: 'document', label: 'مستندات' }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الأرشيف</h1>
        <p className="text-gray-600">إدارة العناصر المؤرشفة والمحذوفة في النظام</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="بحث في الأرشيف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="deleted">المحذوفة</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>العناصر المؤرشفة</CardTitle>
                  <CardDescription>
                    {filteredItems.length} عنصر في الأرشيف
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="ml-2 h-4 w-4" />
                  تصدير القائمة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">جاري تحميل الأرشيف...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد عناصر في الأرشيف</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {getTypeIcon(item.type)}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">{item.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">
                                    {getTypeLabel(item.type)}
                                  </Badge>
                                  {getStatusBadge(item.status)}
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">
                              {item.content}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>أرشف في: {new Date(item.archivedAt).toLocaleDateString('ar-EG')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>بواسطة: {item.archivedBy}</span>
                              </div>
                              {item.originalId && (
                                <div className="flex items-center gap-1">
                                  <Hash className="h-3 w-3" />
                                  <span>المعرف: {item.originalId}</span>
                                </div>
                              )}
                            </div>

                            {item.metadata && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(item.metadata).map(([key, value]) => (
                                  <Badge key={key} variant="secondary" className="text-xs">
                                    {key}: {value}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {item.status === 'archived' && (
                              <Button variant="ghost" size="sm" onClick={() => handleRestore(item.id)}>
                                <ArchiveRestore className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل العنصر المؤرشف</DialogTitle>
            <DialogDescription>
              معلومات مفصلة عن العنصر المحدد
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">العنوان</Label>
                  <p className="text-sm text-gray-600">{selectedItem.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">النوع</Label>
                  <p className="text-sm text-gray-600">{getTypeLabel(selectedItem.type)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">الحالة</Label>
                  <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">تاريخ الأرشفة</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedItem.archivedAt).toLocaleString('ar-EG')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">الأرشيف بواسطة</Label>
                  <p className="text-sm text-gray-600">{selectedItem.archivedBy}</p>
                </div>
                {selectedItem.originalId && (
                  <div>
                    <Label className="text-sm font-medium">المعرف الأصلي</Label>
                    <p className="text-sm text-gray-600">{selectedItem.originalId}</p>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium">المحتوى</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedItem.content}</p>
              </div>
              
              {selectedItem.metadata && (
                <div>
                  <Label className="text-sm font-medium">البيانات الوصفية</Label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selectedItem.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="font-medium">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}