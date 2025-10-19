'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Settings, Eye, EyeOff, Clock, Target, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface PopupConfig {
  id: string
  title?: string
  content?: string
  imageUrl?: string
  linkUrl?: string
  buttonText?: string
  buttonColor: string
  textColor: string
  backgroundColor: string
  position: 'TOP_LEFT' | 'TOP_CENTER' | 'TOP_RIGHT' | 'CENTER' | 'BOTTOM_LEFT' | 'BOTTOM_CENTER' | 'BOTTOM_RIGHT'
  showDelay: number
  autoHide: boolean
  hideDelay: number
  isActive: boolean
  showOnPages: string
  targetAudience: 'all' | 'new' | 'returning' | 'guests'
  startDate?: string
  endDate?: string
  priority: number
  createdAt: string
  updatedAt: string
}

interface PopupConfigResponse {
  popups: PopupConfig[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function PopupConfigsPage() {
  const [popups, setPopups] = useState<PopupConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPopup, setEditingPopup] = useState<PopupConfig | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: '',
    buttonColor: '#3b82f6',
    textColor: '#ffffff',
    backgroundColor: '#1f2937',
    position: 'BOTTOM_RIGHT' as const,
    showDelay: 3000,
    autoHide: true,
    hideDelay: 10000,
    isActive: true,
    showOnPages: '["homepage"]',
    targetAudience: 'all' as const,
    startDate: '',
    endDate: '',
    priority: 0
  })

  useEffect(() => {
    fetchPopups()
  }, [pagination.page])

  const fetchPopups = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/admin/popup-configs?page=${pagination.page}&limit=${pagination.limit}`, {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        toast.error('يجب تسجيل الدخول للوصول إلى هذه الصفحة')
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
        return
      }
      
      if (!response.ok) throw new Error('Failed to fetch popups')
      
      const data: PopupConfigResponse = await response.json()
      setPopups(data.popups)
      setPagination(data.pagination)
    } catch (error) {
      toast.error('فشل في تحميل إعدادات النوافذ المنبثقة')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingPopup ? `/api/admin/popup-configs/${editingPopup.id}` : '/api/admin/popup-configs'
      const method = editingPopup ? 'PUT' : 'POST'
      
      console.log('Sending formData:', JSON.stringify(formData, null, 2))
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      console.log('Response status:', response.status)
      
      if (response.status === 401) {
        toast.error('يجب تسجيل الدخول للوصول إلى هذه الصفحة')
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        toast.error(`فشل في حفظ الإعدادات: ${errorData.details || errorData.error}`)
        return
      }

      toast.success(editingPopup ? 'تم تحديث الإعدادات بنجاح' : 'تم إنشاء الإعدادات بنجاح')
      setIsDialogOpen(false)
      resetForm()
      fetchPopups()
    } catch (error) {
      toast.error('فشل في حفظ الإعدادات')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/popup-configs/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.status === 401) {
        toast.error('يجب تسجيل الدخول للوصول إلى هذه الصفحة')
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
        return
      }
      
      if (!response.ok) throw new Error('Failed to delete popup')
      
      toast.success('تم حذف الإعدادات بنجاح')
      fetchPopups()
    } catch (error) {
      toast.error('فشل في حذف الإعدادات')
    }
  }

  const handleEdit = (popup: PopupConfig) => {
    setEditingPopup(popup)
    setFormData({
      title: popup.title || '',
      content: popup.content || '',
      imageUrl: popup.imageUrl || '',
      linkUrl: popup.linkUrl || '',
      buttonText: popup.buttonText || '',
      buttonColor: popup.buttonColor,
      textColor: popup.textColor,
      backgroundColor: popup.backgroundColor,
      position: popup.position,
      showDelay: popup.showDelay,
      autoHide: popup.autoHide,
      hideDelay: popup.hideDelay,
      isActive: popup.isActive,
      showOnPages: popup.showOnPages,
      targetAudience: popup.targetAudience,
      startDate: popup.startDate ? new Date(popup.startDate).toISOString().split('T')[0] : '',
      endDate: popup.endDate ? new Date(popup.endDate).toISOString().split('T')[0] : '',
      priority: popup.priority
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingPopup(null)
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      linkUrl: '',
      buttonText: '',
      buttonColor: '#3b82f6',
      textColor: '#ffffff',
      backgroundColor: '#1f2937',
      position: 'BOTTOM_RIGHT',
      showDelay: 3000,
      autoHide: true,
      hideDelay: 10000,
      isActive: true,
      showOnPages: '["homepage"]',
      targetAudience: 'all',
      startDate: '',
      endDate: '',
      priority: 0
    })
  }

  const positionLabels = {
    TOP_LEFT: 'أعلى اليسار',
    TOP_CENTER: 'أعلى الوسط',
    TOP_RIGHT: 'أعلى اليمين',
    CENTER: 'الوسط',
    BOTTOM_LEFT: 'أسفل اليسار',
    BOTTOM_CENTER: 'أسفل الوسط',
    BOTTOM_RIGHT: 'أسفل اليمين'
  }

  const audienceLabels = {
    all: 'الجميع',
    new: 'المستخدمون الجدد',
    returning: 'المستخدمون العائدون',
    guests: 'الزوار'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة النوافذ المنبثقة</h1>
          <p className="text-gray-600 mt-2">إدارة وإعدادات النوافذ المنبثقة للموقع</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة نافذة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPopup ? 'تعديل النافذة المنبثقة' : 'إضافة نافذة منبثقة جديدة'}
              </DialogTitle>
              <DialogDescription>
                إعدادات النافذة المنبثقة والمحتوى والظهور
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">العنوان</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="عنوان النافذة"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buttonText">نص الزر</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="نص الزر"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">المحتوى</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="محتوى النافذة المنبثقة"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">رابط الصورة</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkUrl">رابط الزر</Label>
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonColor">لون الزر</Label>
                  <Input
                    id="buttonColor"
                    type="color"
                    value={formData.buttonColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonColor: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="textColor">لون النص</Label>
                  <Input
                    id="textColor"
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">لون الخلفية</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">الموقع</Label>
                  <Select value={formData.position} onValueChange={(value: any) => setFormData(prev => ({ ...prev, position: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(positionLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">الجمهور المستهدف</Label>
                  <Select value={formData.targetAudience} onValueChange={(value: any) => setFormData(prev => ({ ...prev, targetAudience: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(audienceLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="showDelay">تأخير الظهور (مللي ثانية)</Label>
                  <Input
                    id="showDelay"
                    type="number"
                    value={formData.showDelay}
                    onChange={(e) => setFormData(prev => ({ ...prev, showDelay: parseInt(e.target.value) }))}
                    min="0"
                    max="60000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">تاريخ البدء</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">نشط</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoHide"
                  checked={formData.autoHide}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoHide: checked }))}
                />
                <Label htmlFor="autoHide">إخفاء تلقائي</Label>
              </div>

              {formData.autoHide && (
                <div className="space-y-2">
                  <Label htmlFor="hideDelay">تأخير الإخفاء (مللي ثانية)</Label>
                  <Input
                    id="hideDelay"
                    type="number"
                    value={formData.hideDelay}
                    onChange={(e) => setFormData(prev => ({ ...prev, hideDelay: parseInt(e.target.value) }))}
                    min="1000"
                    max="60000"
                  />
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingPopup ? 'تحديث' : 'حفظ'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : popups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">لا توجد نوافذ منبثقة مضافة بعد</p>
            </CardContent>
          </Card>
        ) : (
          popups.map((popup) => (
            <Card key={popup.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <CardTitle className="text-lg">{popup.title || 'بدون عنوان'}</CardTitle>
                    <Badge variant={popup.isActive ? 'default' : 'secondary'}>
                      {popup.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(popup)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف هذه النافذة المنبثقة؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(popup.id)}>
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardDescription>{popup.content}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{positionLabels[popup.position]}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>تأخير: {popup.showDelay}مللي ثانية</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span>{audienceLabels[popup.targetAudience]}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span>الأولوية: {popup.priority}</span>
                  </div>
                </div>
                
                {popup.buttonText && (
                  <div className="mt-4 p-3 rounded-lg border flex items-center justify-between" style={{ 
                    backgroundColor: popup.backgroundColor,
                    color: popup.textColor
                  }}>
                    <span>{popup.buttonText}</span>
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: popup.buttonColor }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            السابق
          </Button>
          <span className="py-2 px-4">
            صفحة {pagination.page} من {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  )
}