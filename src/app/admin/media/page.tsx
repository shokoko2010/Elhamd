'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { useAuth } from '@/hooks/use-auth'
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
  AlertCircle,
  RefreshCw
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
  width?: number
  height?: number
  isPublic?: boolean
  isFeatured?: boolean
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
  const { user, loading: authLoading } = useAuth()
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
  const [showReplaceDialog, setShowReplaceDialog] = useState(false)
  
  // Form states
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null)
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
  const [replaceFile, setReplaceFile] = useState<File | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    altText: '',
    description: '',
    tags: '',
    category: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      loadMediaData()
    }
  }, [authLoading, user])

  const loadMediaData = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('🔄 Loading media data from file system...')
      
      // Fetch media files from new API that reads from uploads directory
      const response = await fetch('/api/media-files', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })
      
      console.log('📡 Media Files API response status:', response.status)
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('يرجى تسجيل الدخول للوصول إلى صفحة الوسائط')
        } else if (response.status === 403) {
          setError('ليس لديك صلاحية للوصول إلى صفحة الوسائط')
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return
      }
      
      const data = await response.json()
      console.log('📊 Media Files API response:', data)
      
      // Ensure data structure is valid
      if (data && data.success && data.data && Array.isArray(data.data.files)) {
        // Map the media files to match the interface
        const mappedFiles = data.data.files.map((file: any) => ({
          id: file.id,
          name: file.name,
          originalName: file.originalName,
          url: file.url,
          thumbnailUrl: file.thumbnailUrl,
          size: file.size,
          type: file.type,
          mimeType: file.mimeType,
          altText: file.altText,
          title: file.title,
          description: file.description,
          tags: Array.isArray(file.tags) ? file.tags : [],
          category: file.category,
          uploadedAt: file.uploadedAt,
          updatedAt: file.updatedAt,
          uploadedBy: file.uploadedBy,
          width: file.width,
          height: file.height,
          isPublic: file.isPublic,
          isFeatured: file.isFeatured
        }))
        console.log(`✅ Loaded ${mappedFiles.length} media files from file system`)
        setMediaFiles(mappedFiles)
        
        // Set folders from API response
        if (data.data.folders && Array.isArray(data.data.folders)) {
          setFolders(data.data.folders)
        }
      } else {
        console.warn('⚠️ Invalid media data structure:', data)
        throw new Error('Invalid media data structure')
      }
      
    } catch (error) {
      console.error('❌ Error loading media data:', error)
      const errorMessage = error instanceof Error ? error.message : 'فشل في تحميل بيانات الوسائط'
      setError(errorMessage)
      // Don't use mock data - show empty state instead
      setMediaFiles([])
      setFolders([])
    } finally {
      setLoading(false)
    }
  }

  const filteredFiles = mediaFiles.filter(file => {
    if (!file) return false
    
    const matchesSearch = (file.name && file.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (file.title && file.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (file.altText && file.altText.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (Array.isArray(file.tags) && file.tags.some(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase())))
    
    const matchesType = filterType === 'all' || file.type === filterType
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  }).sort((a, b) => {
    if (!a || !b) return 0
    
    const modifier = sortOrder === 'asc' ? 1 : -1
    if (sortBy === 'name') {
      return ((a.name || '').localeCompare(b.name || '')) * modifier
    } else if (sortBy === 'size') {
      return (((a.size || 0) - (b.size || 0))) * modifier
    } else {
      const dateA = new Date(a[sortBy] || a.createdAt || Date.now()).getTime()
      const dateB = new Date(b[sortBy] || b.createdAt || Date.now()).getTime()
      return (dateA - dateB) * modifier
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

        const response = await fetch('/api/media-simple', {
          method: 'POST',
          headers: {
            // Don't set Content-Type for FormData, let the browser set it with boundary
          },
          credentials: 'include',
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
        name: result.data.filename || result.data.name || 'Unnamed',
        originalName: result.data.originalFilename || result.data.originalName || result.data.name || 'Unnamed',
        url: result.data.url,
        thumbnailUrl: result.data.thumbnailUrl || result.data.url,
        size: result.data.size || 0,
        type: result.data.mimeType?.startsWith('image/') ? 'image' : 'document',
        mimeType: result.data.mimeType || 'application/octet-stream',
        altText: result.data.altText || '',
        title: result.data.title || '',
        description: result.data.description || '',
        tags: Array.isArray(result.data.tags) ? result.data.tags : [],
        category: result.data.category || 'other',
        uploadedAt: result.data.createdAt || result.data.uploadedAt || new Date().toISOString(),
        updatedAt: result.data.updatedAt || result.data.uploadedAt || new Date().toISOString(),
        uploadedBy: result.data.createdBy || result.data.uploadedBy || 'unknown',
        width: result.data.width,
        height: result.data.height,
        isPublic: result.data.isPublic,
        isFeatured: result.data.isFeatured
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

  const handleReplaceFileDialog = (file: MediaFile) => {
    setEditingFile(file)
    setReplaceFile(null)
    setShowReplaceDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingFile) return

    try {
      const response = await fetch(`/api/media-files`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: editingFile.id,
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
          title: updatedFile.title || file.title,
          altText: updatedFile.altText || file.altText,
          description: updatedFile.description || file.description,
          tags: Array.isArray(updatedFile.tags) ? updatedFile.tags : file.tags,
          category: updatedFile.category || file.category,
          updatedAt: updatedFile.updatedAt || file.updatedAt
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
        fetch(`/api/media-files?id=${fileId}`, { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
      )

      await Promise.all(deletePromises)
      setMediaFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)))
      setSelectedFiles([])
    } catch (error) {
      console.error('Error deleting files:', error)
      setError('فشل في حذف الملفات')
    }
  }

  const handleReplaceFile = async (fileId: string, newFile: File) => {
    try {
      const formData = new FormData()
      formData.append('file', newFile)
      formData.append('fileId', fileId)

      const response = await fetch('/api/media-files/replace', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to replace file')
      }

      const result = await response.json()
      
      // Update the file in the list
      setMediaFiles(prev => prev.map(file => 
        file.id === fileId ? {
          ...file,
          name: result.data.name,
          originalName: result.data.originalName,
          size: result.data.size,
          updatedAt: result.data.updatedAt
        } : file
      ))

      return result.data
    } catch (error) {
      console.error('Error replacing file:', error)
      setError('فشل في استبدال الملف')
      throw error
    }
  }

  const handleReplaceFileSubmit = async () => {
    if (!editingFile || !replaceFile) return

    try {
      await handleReplaceFile(editingFile.id, replaceFile)
      setShowReplaceDialog(false)
      setEditingFile(null)
      setReplaceFile(null)
    } catch (error) {
      console.error('Error replacing file:', error)
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
    { value: 'gallery', label: 'معرض الصور' },
    { value: 'banner', label: 'اللافتات' }
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
              {/* File count display */}
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                إجمالي الملفات في قاعدة البيانات: {mediaFiles.length} | المعروضة: {filteredFiles.length}
              </div>
              
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
                          <div className="w-full h-32 relative bg-gray-100">
                            <Image
                              src={file.thumbnailUrl || file.url}
                              alt={file.altText || file.title || file.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                              onError={(e) => {
                                // Handle broken images
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.parentElement?.classList.add('bg-gray-200')
                                const placeholder = target.parentElement?.querySelector('.image-placeholder')
                                if (placeholder) {
                                  (placeholder as HTMLElement).style.display = 'flex'
                                }
                              }}
                            />
                            <div className="image-placeholder absolute inset-0 bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
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
                          <Button variant="secondary" size="sm" onClick={() => handleReplaceFileDialog(file)}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm truncate mb-1" title={file.title || file.name}>
                          {file.title || file.name}
                        </h3>
                        {file.altText && (
                          <p className="text-xs text-gray-600 truncate mb-1" title={file.altText}>
                            {file.altText}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mb-2">
                          {formatFileSize(file.size)}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.value === file.category)?.label || file.category || 'غير مصنف'}
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
                            <div className="w-16 h-16 relative bg-gray-100 rounded">
                              <Image
                                src={file.thumbnailUrl || file.url}
                                alt={file.altText || file.title || file.name}
                                fill
                                className="object-cover rounded"
                                sizes="64px"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.classList.add('bg-gray-200')
                                    const placeholder = document.createElement('div')
                                    placeholder.className = 'absolute inset-0 flex items-center justify-center'
                                    placeholder.innerHTML = '<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'
                                    parent.appendChild(placeholder)
                                  }
                                }}
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
                            <Button variant="ghost" size="sm" onClick={() => handleReplaceFileDialog(file)}>
                              <RefreshCw className="h-4 w-4" />
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

      {/* Replace File Dialog */}
      <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>استبدال الملف</DialogTitle>
            <DialogDescription>
              استبدال الملف الحالي بملف جديد. سيتم إنشاء نسخة احتياطية من الملف الأصلي.
            </DialogDescription>
          </DialogHeader>
          
          {editingFile && (
            <div className="space-y-4">
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-sm font-medium mb-1">الملف الحالي:</p>
                <p className="text-sm text-gray-600">{editingFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(editingFile.size)}</p>
              </div>
              
              <div>
                <Label htmlFor="replaceFile">اختر ملفاً جديداً:</Label>
                <Input
                  id="replaceFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
              </div>
              
              {replaceFile && (
                <div className="border rounded-lg p-3 bg-blue-50">
                  <p className="text-sm font-medium mb-1">الملف الجديد:</p>
                  <p className="text-sm text-gray-600">{replaceFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(replaceFile.size)}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowReplaceDialog(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleReplaceFileSubmit}
              disabled={!replaceFile}
            >
              استبدال الملف
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}