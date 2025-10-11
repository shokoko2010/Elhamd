'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Settings,
  BarChart3,
  Users,
  Car,
  Calendar,
  Target,
  Layout,
  Palette,
  Database,
  LogOut,
  Globe,
  Image as ImageIcon,
  Share2,
  Code
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

interface PageSEO {
  id?: string
  pagePath: string
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  canonicalUrl?: string
  noIndex: boolean
  noFollow: boolean
  structuredData?: any
  customMeta?: any
  hreflang?: any
  priority: number
  changeFreq: string
  lastMod?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

const defaultPages = [
  { path: '/', title: 'Home Page', description: 'Homepage of Al-Hamd Cars' },
  { path: '/about', title: 'About Us', description: 'About Al-Hamd Cars' },
  { path: '/vehicles', title: 'Vehicles', description: 'Vehicle listings' },
  { path: '/contact', title: 'Contact', description: 'Contact information' },
  { path: '/booking', title: 'Booking', description: 'Service booking' },
  { path: '/test-drive', title: 'Test Drive', description: 'Test drive booking' },
  { path: '/maintenance', title: 'Maintenance', description: 'Vehicle maintenance' },
  { path: '/financing', title: 'Financing', description: 'Vehicle financing' }
]

export default function AdminPageSEOPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAdmin } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [pageSEOs, setPageSEOs] = useState<PageSEO[]>([])
  const [filteredSEOs, setFilteredSEOs] = useState<PageSEO[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingSEO, setEditingSEO] = useState<PageSEO | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      if (!isAdmin) {
        router.push('/dashboard')
        return
      }
      
      fetchPageSEOs()
    }
  }, [status, router, user, isAdmin])

  useEffect(() => {
    if (searchTerm) {
      const filtered = pageSEOs.filter(seo => 
        seo.pagePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSEOs(filtered)
    } else {
      setFilteredSEOs(pageSEOs)
    }
  }, [searchTerm, pageSEOs])

  const fetchPageSEOs = async () => {
    try {
      const response = await fetch('/api/page-seo')
      if (response.ok) {
        const data = await response.json()
        setPageSEOs(data)
        setFilteredSEOs(data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch page SEO settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (seo: PageSEO) => {
    try {
      setLoading(true)
      const response = await fetch('/api/page-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(seo)
      })

      if (response.ok) {
        const savedSEO = await response.json()
        
        if (editingSEO) {
          setPageSEOs(prev => prev.map(s => s.pagePath === savedSEO.pagePath ? savedSEO : s))
          toast({
            title: 'Success',
            description: 'Page SEO updated successfully'
          })
        } else {
          setPageSEOs(prev => [...prev, savedSEO])
          toast({
            title: 'Success',
            description: 'Page SEO created successfully'
          })
        }

        setEditingSEO(null)
        setIsCreating(false)
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to save page SEO',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save page SEO',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (pagePath: string) => {
    if (!confirm('Are you sure you want to delete this page SEO?')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/page-seo?pagePath=${encodeURIComponent(pagePath)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPageSEOs(prev => prev.filter(seo => seo.pagePath !== pagePath))
        toast({
          title: 'Success',
          description: 'Page SEO deleted successfully'
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete page SEO',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete page SEO',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setEditingSEO({
      pagePath: '',
      title: '',
      description: '',
      keywords: '',
      ogImage: '',
      ogTitle: '',
      ogDescription: '',
      twitterCard: 'summary_large_image',
      twitterTitle: '',
      twitterDescription: '',
      canonicalUrl: '',
      noIndex: false,
      noFollow: false,
      priority: 0.5,
      changeFreq: 'weekly',
      isActive: true
    })
    setIsCreating(true)
  }

  const handleEdit = (seo: PageSEO) => {
    setEditingSEO({ ...seo })
    setIsCreating(false)
  }

  const handleCancel = () => {
    setEditingSEO(null)
    setIsCreating(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}` : undefined} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Page SEO Management</h1>
            <p className="text-gray-600">Manage SEO settings for individual pages</p>
          </div>
        </div>
        <Button onClick={() => router.push('/admin/site-settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Site Settings
        </Button>
      </div>

      {/* Search and Create */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Page SEO
        </Button>
      </div>

      {/* SEO Form */}
      {editingSEO && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              {isCreating ? 'Create New Page SEO' : 'Edit Page SEO'}
            </CardTitle>
            <CardDescription>
              Configure SEO settings for this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pagePath">Page Path *</Label>
                <Input
                  id="pagePath"
                  value={editingSEO.pagePath}
                  onChange={(e) => setEditingSEO(prev => prev ? { ...prev, pagePath: e.target.value } : null)}
                  placeholder="/example-page"
                  disabled={!isCreating}
                />
              </div>
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={editingSEO.title || ''}
                  onChange={(e) => setEditingSEO(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Enter page title"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Meta Description</Label>
              <Textarea
                id="description"
                value={editingSEO.description || ''}
                onChange={(e) => setEditingSEO(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Enter meta description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={editingSEO.keywords || ''}
                onChange={(e) => setEditingSEO(prev => prev ? { ...prev, keywords: e.target.value } : null)}
                placeholder="Enter keywords (comma separated)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ogImage">OG Image</Label>
                <Input
                  id="ogImage"
                  value={editingSEO.ogImage || ''}
                  onChange={(e) => setEditingSEO(prev => prev ? { ...prev, ogImage: e.target.value } : null)}
                  placeholder="/og-image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={editingSEO.canonicalUrl || ''}
                  onChange={(e) => setEditingSEO(prev => prev ? { ...prev, canonicalUrl: e.target.value } : null)}
                  placeholder="https://example.com/page"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={editingSEO.priority.toString()} 
                  onValueChange={(value) => setEditingSEO(prev => prev ? { ...prev, priority: parseFloat(value) } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">0.1 - Low</SelectItem>
                    <SelectItem value="0.3">0.3 - Medium</SelectItem>
                    <SelectItem value="0.5">0.5 - Normal</SelectItem>
                    <SelectItem value="0.7">0.7 - High</SelectItem>
                    <SelectItem value="1.0">1.0 - Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="changeFreq">Change Frequency</Label>
                <Select 
                  value={editingSEO.changeFreq} 
                  onValueChange={(value) => setEditingSEO(prev => prev ? { ...prev, changeFreq: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="twitterCard">Twitter Card</Label>
                <Select 
                  value={editingSEO.twitterCard || 'summary_large_image'} 
                  onValueChange={(value) => setEditingSEO(prev => prev ? { ...prev, twitterCard: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="noIndex">No Index</Label>
                  <p className="text-sm text-gray-600">Prevent search indexing</p>
                </div>
                <Switch
                  id="noIndex"
                  checked={editingSEO.noIndex}
                  onCheckedChange={(checked) => setEditingSEO(prev => prev ? { ...prev, noIndex: checked } : null)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="noFollow">No Follow</Label>
                  <p className="text-sm text-gray-600">Prevent link following</p>
                </div>
                <Switch
                  id="noFollow"
                  checked={editingSEO.noFollow}
                  onCheckedChange={(checked) => setEditingSEO(prev => prev ? { ...prev, noFollow: checked } : null)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-sm text-gray-600">Enable SEO settings</p>
                </div>
                <Switch
                  id="isActive"
                  checked={editingSEO.isActive}
                  onCheckedChange={(checked) => setEditingSEO(prev => prev ? { ...prev, isActive: checked } : null)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={() => editingSEO && handleSave(editingSEO)}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page SEO List */}
      <div className="space-y-4">
        {filteredSEOs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">No page SEO settings found</p>
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Page SEO
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredSEOs.map((seo) => (
            <Card key={seo.pagePath}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{seo.pagePath}</h3>
                      <Badge variant={seo.isActive ? "default" : "secondary"}>
                        {seo.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {seo.noIndex && <Badge variant="destructive">No Index</Badge>}
                      {seo.noFollow && <Badge variant="destructive">No Follow</Badge>}
                    </div>
                    
                    {seo.title && (
                      <p className="text-gray-600 mb-1">
                        <strong>Title:</strong> {seo.title}
                      </p>
                    )}
                    
                    {seo.description && (
                      <p className="text-gray-600 mb-1">
                        <strong>Description:</strong> {seo.description}
                      </p>
                    )}
                    
                    {seo.keywords && (
                      <p className="text-gray-600 mb-1">
                        <strong>Keywords:</strong> {seo.keywords}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <span>Priority: {seo.priority}</span>
                      <span>Change Freq: {seo.changeFreq}</span>
                      {seo.lastMod && (
                        <span>Last Modified: {new Date(seo.lastMod).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(seo)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(seo.pagePath)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" onClick={() => router.push('/admin')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/vehicles')}>
            <Car className="w-4 h-4 mr-2" />
            Vehicle Management
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/customers')}>
            <Users className="w-4 h-4 mr-2" />
            Customer Management
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/bookings')}>
            <Calendar className="w-4 h-4 mr-2" />
            Booking Management
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/content')}>
            <Layout className="w-4 h-4 mr-2" />
            Content Management
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}