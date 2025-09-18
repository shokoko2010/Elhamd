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
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  Grid,
  List,
  Calendar,
  FileImage,
  Folder,
  Tag,
  Copy,
  AlertCircle
} from 'lucide-react'

interface MediaFile {
  id: string
  name: string
  originalName: string
  url: string
  thumbnailUrl: string
  size: number
  type: string
  mimeType: string
  altText?: string
  title?: string
  description?: string
  tags: string[]
  category?: string
  uploadedAt: string
  updatedAt: string
  uploadedBy: string
}

interface MediaFolder {
  id: string
  name: string
  path: string
  fileCount: number
  createdAt: string
  parentId?: string
}

export default function AdminMediaPage() {
  return <MediaContent />
}

function MediaContent() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('files')
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('uploadedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Dialog states
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  
  // Form states
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null)
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    altText: '',
    description: '',
    tags: '',
    category: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    loadMediaData()
  }, [])

  const loadMediaData = async () => {
    setLoading(true)
    setError('')
    try {
      // Fetch media files from API
      const response = await fetch('/api/media')
      if (!response.ok) {
        throw new Error('Failed to fetch media')
      }
      const data = await response.json()
      setMediaFiles(data.data.files)

      // Fetch media stats
      const statsResponse = await fetch('/api/media/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        // Update folders based on categories
        const categoryFolders = Object.entries(statsData.data.byCategory).map(([category, info]: [string, any]) => ({
          id: category,
          name: categories.find(c => c.value === category)?.label || category,
          path: `/${category}`,
          fileCount: info.count,
          createdAt: new Date().toISOString()
        }))
        setFolders(categoryFolders)
      }
    } catch (error) {
      console.error('Error loading media data:', error)
      setError('فشل في تحميل بيانات الوسائط')
      // Fallback to mock data
      const mockMediaFiles: MediaFile[] = [
        {
          id: '1',
          name: 'tata-nexon-hero.jpg',
          originalName: 'tata-nexon-hero.jpg',
          url: '/uploads/vehicles/1/nexon-front.webp',
          thumbnailUrl: '/uploads/vehicles/1/nexon-front.webp',
          size: 1024000,
          type: 'image',
          mimeType: 'image/jpeg',
          altText: 'تاتا نيكسون سيارة SUV',
          title: 'تاتا نيكسون',
          description: 'صورة رئيسية لتاتا نيكسون',
          tags: ['تاتا', 'نيكسون', 'SUV', 'سيارة'],
          category: 'vehicles',
          uploadedAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          uploadedBy: 'admin'
        },
        {
          id: '2',
          name: 'showroom-exterior.jpg',
          originalName: 'showroom-exterior.jpg',
          url: '/uploads/showroom-luxury.jpg',
          thumbnailUrl: '/uploads/showroom-luxury.jpg',
          size: 2048000,
          type: 'image',
          mimeType: 'image/jpeg',
          altText: 'واجهة معرض الحمد للسيارات',
          title: 'المعرض الرئيسي',
          description: 'صورة خارجية للمعرض الرئيسي',
          tags: ['معرض', 'الحمد', 'تاتا', 'سيارات'],
          category: 'company',
          uploadedAt: '2024-01-14T15:30:00Z',
          updatedAt: '2024-01-14T15:30:00Z',
          uploadedBy: 'admin'
        },
        {
          id: '3',
          name: 'service-center.jpg',
          originalName: 'service-center.jpg',
          url: '/uploads/dealership-exterior.jpg',
          thumbnailUrl: '/uploads/dealership-exterior.jpg',
          size: 1536000,
          type: 'image',
          mimeType: 'image/jpeg',
          altText: 'مركز صيانة الحمد للسيارات',
          title: 'مركز الصيانة',
          description: 'صورة لمركز الصيانة المتطور',
          tags: ['صيانة', 'خدمة', 'تاتا', 'مركز'],
          category: 'services',
          uploadedAt: '2024-01-13T09:00:00Z',
          updatedAt: '2024-01-13T09:00:00Z',
          uploadedBy: 'admin'
        }
      ]

      const mockFolders: MediaFolder[] = [
        {
          id: '1',
          name: 'المركبات',
          path: '/vehicles',
          fileCount: 25,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'الشركة',
          path: '/company',
          fileCount: 12,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'الخدمات',
          path: '/services',
          fileCount: 8,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]

      setMediaFiles(mockMediaFiles)
      setFolders(mockFolders)
    } finally {
      setLoading(false)
    }
  }

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.altText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = filterType === 'all' || file.type === filterType
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  }).sort((a, b) => {
    const modifier = sortOrder === 'asc' ? 1 : -1
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name) * modifier
    } else if (sortBy === 'size') {
      return (a.size - b.size) * modifier
    } else {
      return (new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()) * modifier
    }
  })

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id))
    }
  }

  const handleUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) return

    setUploading(true)
    setError('')
    try {
      const uploadPromises = Array.from(uploadFiles).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('options', JSON.stringify({
          category: 'other',
          generateThumbnails: true,
          optimizeFormats: ['webp']
        }))

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        return response.json()
      })

      const results = await Promise.all(uploadPromises)
      
      // Add new files to the list
      const newFiles: MediaFile[] = results.map(result => ({
        id: result.data.id,
        name: result.data.filename,
        originalName: result.data.originalFilename,
        url: result.data.url,
        thumbnailUrl: result.data.thumbnailUrl || result.data.url,
        size: result.data.size,
        type: result.data.mimeType.startsWith('image/') ? 'image' : 'document',
        mimeType: result.data.mimeType,
        altText: result.data.altText,
        title: result.data.title,
        description: result.data.description,
        tags: result.data.tags,
        category: result.data.category,
        uploadedAt: result.data.createdAt,
        updatedAt: result.data.updatedAt,
        uploadedBy: result.data.createdBy
      }))

      setMediaFiles(prev => [...prev, ...newFiles])
      setShowUploadDialog(false)
      setUploadFiles(null)
    } catch (error) {
      console.error('Error uploading files:', error)
      setError('فشل في رفع الملفات')
    } finally {
      setUploading(false)
    }
  }

  const handleEditFile = (file: MediaFile) => {
    setEditingFile(file)
    setEditForm({
      title: file.title || '',
      altText: file.altText || '',
      description: file.description || '',
      tags: file.tags.join(', '),
      category: file.category || ''
    })
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingFile) return

    try {
      const response = await fetch(`/api/media?id=${editingFile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editForm.title,
          altText: editForm.altText,
          description: editForm.description,
          tags: editForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          category: editForm.category
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update file')
      }

      const result = await response.json()
      const updatedFile = result.data

      setMediaFiles(prev => prev.map(file => 
        file.id === editingFile.id ? {
          ...file,
          title: updatedFile.title,
          altText: updatedFile.altText,
          description: updatedFile.description,
          tags: updatedFile.tags,
          category: updatedFile.category,
          updatedAt: updatedFile.updatedAt
        } : file
      ))
      setShowEditDialog(false)
      setEditingFile(null)
    } catch (error) {
      console.error('Error saving file:', error)
      setError('فشل في حفظ التغييرات')
    }
  }

  const handleDeleteFiles = async () => {
    if (selectedFiles.length === 0) return
    if (!confirm(`هل أنت متأكد من حذف ${selectedFiles.length} ملف؟`)) return

    try {
      const deletePromises = selectedFiles.map(fileId => 
        fetch(`/api/media?id=${fileId}`, { method: 'DELETE' })
      )

      await Promise.all(deletePromises)
      setMediaFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)))
      setSelectedFiles([])
    } catch (error) {
      console.error('Error deleting files:', error)
      setError('فشل في حذف الملفات')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const categories = [
    { value: 'vehicles', label: 'المركبات' },
    { value: 'company', label: 'الشركة' },
    { value: 'services', label: 'الخدمات' },
    { value: 'blog', label: 'المدونة' },
    { value: 'gallery', label: 'معرض الصور' }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الوسائط</h1>
        <p className="text-gray-600">رفع وإدارة الصور والملفات في جميع أنحاء الموقع</p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="ml-2 h-4 w-4" />
            رفع ملفات جديدة
          </Button>
          <Button variant="outline" onClick={() => setShowFolderDialog(true)}>
            <Folder className="ml-2 h-4 w-4" />
            إنشاء مجلد جديد
          </Button>
          {selectedFiles.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteFiles}>
              <Trash2 className="ml-2 h-4 w-4" />
              حذف ({selectedFiles.length})
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-red-800">خطأ</h3>
                <div className="mt-1 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files">الملفات</TabsTrigger>
          <TabsTrigger value="folders">المجلدات</TabsTrigger>
        </TabsList>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6">
          {/* Filters and Controls */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="بحث في الملفات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                
                {/* Filters */}
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="image">صور</SelectItem>
                      <SelectItem value="document">مستندات</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الفئات</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-')
                    setSortBy(field)
                    setSortOrder(order as 'asc' | 'desc')
                  }}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uploadedAt-desc">الأحدث أولاً</SelectItem>
                      <SelectItem value="uploadedAt-asc">الأقدم أولاً</SelectItem>
                      <SelectItem value="name-asc">الاسم أ-ي</SelectItem>
                      <SelectItem value="name-desc">الاسم ي-أ</SelectItem>
                      <SelectItem value="size-desc">الحجم الأكبر</SelectItem>
                      <SelectItem value="size-asc">الحجم الأصغر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode */}
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files Display */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل الملفات...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد ملفات</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
                    ? 'لم يتم العثور على ملفات تطابق معايير البحث'
                    : 'ابدأ برفع بعض الملفات لإدارة محتوى الموقع'
                  }
                </p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="ml-2 h-4 w-4" />
                  رفع ملفات جديدة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Selection Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === filteredFiles.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">تحديد الكل ({filteredFiles.length})</span>
                  </label>
                  {selectedFiles.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedFiles.length} ملف محدد
                    </span>
                  )}
                </div>
              </div>

              {/* Files Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredFiles.map((file) => (
                    <Card key={file.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative group">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => handleFileSelect(file.id)}
                          className="absolute top-2 right-2 z-10 rounded border-gray-300"
                        />
                        
                        {file.type === 'image' ? (
                          <div className="w-full h-32 relative">
                            <Image
                              src={file.thumbnailUrl}
                              alt={file.altText || file.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                            <FileImage className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => window.open(file.url, '_blank')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleEditFile(file)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm truncate mb-1" title={file.name}>
                          {file.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {formatFileSize(file.size)}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {file.category || 'غير مصنف'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(file.uploadedAt)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((file) => (
                    <Card key={file.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.id)}
                            onChange={() => handleFileSelect(file.id)}
                            className="rounded border-gray-300"
                          />
                          
                          {file.type === 'image' ? (
                            <div className="w-16 h-16 relative">
                              <Image
                                src={file.thumbnailUrl}
                                alt={file.altText || file.name}
                                fill
                                className="object-cover rounded"
                                sizes="64px"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                              <FileImage className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <h3 className="font-medium">{file.name}</h3>
                            <p className="text-sm text-gray-600">
                              {file.title || file.altText || 'لا يوجد عنوان'}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>{formatFileSize(file.size)}</span>
                              <span>{file.mimeType}</span>
                              <span>{formatDate(file.uploadedAt)}</span>
                              {file.category && (
                                <Badge variant="outline">{file.category}</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => window.open(file.url, '_blank')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditFile(file)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              try {
                                navigator.clipboard.writeText(file.url)
                              } catch (err) {
                                // Fallback for browsers that don't support clipboard API
                                const textArea = document.createElement('textarea')
                                textArea.value = file.url
                                document.body.appendChild(textArea)
                                textArea.select()
                                document.execCommand('copy')
                                document.body.removeChild(textArea)
                              }
                            }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Folders Tab */}
        <TabsContent value="folders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المجلدات</CardTitle>
              <CardDescription>
                تنظيم الملفات في مجلدات لإدارة أفضل
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <Card key={folder.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Folder className="h-8 w-8 text-blue-600" />
                        <div className="flex-1">
                          <h3 className="font-medium">{folder.name}</h3>
                          <p className="text-sm text-gray-600">{folder.path}</p>
                          <p className="text-xs text-gray-500">{folder.fileCount} ملف</p>
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

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>رفع ملفات جديدة</DialogTitle>
            <DialogDescription>
              اختر الملفات التي تريد رفعها إلى مكتبة الوسائط
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="files">اختر الملفات</Label>
              <Input
                id="files"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => setUploadFiles(e.target.files)}
                className="mt-2"
              />
            </div>
            
            {uploadFiles && uploadFiles.length > 0 && (
              <div>
                <Label>الملفات المحددة:</Label>
                <div className="mt-2 space-y-1">
                  {Array.from(uploadFiles).map((file, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {file.name} ({formatFileSize(file.size)})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!uploadFiles || uploadFiles.length === 0 || uploading}
            >
              {uploading ? 'جاري الرفع...' : 'رفع الملفات'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الملف</DialogTitle>
            <DialogDescription>
              تحرير معلومات وبيانات الملف المحدد
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                placeholder="أدخل عنواناً للملف"
              />
            </div>
            
            <div>
              <Label htmlFor="altText">النص البديل (Alt Text)</Label>
              <Input
                id="altText"
                value={editForm.altText}
                onChange={(e) => setEditForm({...editForm, altText: e.target.value})}
                placeholder="وصف للصورة لمحركات البحث"
              />
            </div>
            
            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                placeholder="وصف تفصيلي للملف"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="category">الفئة</Label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tags">الوسوم (فصل بينها بفاصلة)</Label>
              <Input
                id="tags"
                value={editForm.tags}
                onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                placeholder="وسم1, وسم2, وسم3"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveEdit}>
              حفظ التغييرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}