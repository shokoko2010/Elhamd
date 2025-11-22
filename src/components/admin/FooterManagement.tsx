'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Upload, 
  Download, 
  Eye,
  EyeOff,
  Settings,
  Layout,
  Type,
  Image as ImageIcon,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
  Menu,
  X,
  ChevronDown,
  Move,
  GripVertical,
  ExternalLink,
  FileText,
  MapPin,
  Clock,
  Share2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FooterColumn {
  id: string
  title: string
  content: string
  order: number
  isVisible: boolean
  type: 'links' | 'text' | 'contact' | 'social'
}

interface FooterSettings {
  showLogo: boolean
  showNavigation: boolean
  showContactInfo: boolean
  showSocialLinks: boolean
  showNewsletter: boolean
  showCopyright: boolean
  showBackToTop: boolean
  columns: number
  layout: 'standard' | 'minimal' | 'centered' | 'split'
}

interface FooterContent {
  logoUrl?: string
  logoText?: string
  tagline?: string
  primaryPhone?: string
  secondaryPhone?: string
  primaryEmail?: string
  secondaryEmail?: string
  address?: string
  workingHours?: string
  copyrightText?: string
  newsletterText?: string
  backToTopText?: string
}

interface SocialLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
}

export default function FooterManagement() {
  const { toast } = useToast()
  
  const [settings, setSettings] = useState<FooterSettings>({
    showLogo: true,
    showNavigation: true,
    showContactInfo: true,
    showSocialLinks: true,
    showNewsletter: true,
    showCopyright: true,
    showBackToTop: true,
    columns: 6,
    layout: 'standard'
  })

  const [content, setContent] = useState<FooterContent>({
    logoText: 'Al-Hamd Cars',
    tagline: 'Your Trusted Car Dealership',
    primaryPhone: '+20 2 1234 5678',
    primaryEmail: 'info@elhamdimport.com',
    address: 'Cairo, Egypt',
    workingHours: 'Sat-Thu: 9AM-8PM, Fri: 2PM-8PM',
    copyrightText: '© 2024 Al-Hamd Cars. All rights reserved.',
    newsletterText: 'Subscribe to our newsletter for the latest updates and offers.',
    backToTopText: 'Back to Top'
  })

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({})
  const [columns, setColumns] = useState<FooterColumn[]>([
    { 
      id: '1', 
      title: 'روابط سريعة', 
      content: 'الرئيسية\nالسيارات\nالخدمات\nمن نحن\nاتصل بنا', 
      order: 1, 
      isVisible: true,
      type: 'links'
    },
    { 
      id: '2', 
      title: 'خدماتنا', 
      content: 'بيع السيارات\nقيادة تجريبية\nحجز الخدمة\nالتمويل\nالصيانة', 
      order: 2, 
      isVisible: true,
      type: 'links'
    },
    { 
      id: '3', 
      title: 'معلومات التواصل', 
      content: '+20 2 1234 5678\ninfo@elhamdimport.com\nالقاهرة، مصر\nالسبت - الخميس: 9:00 ص - 8:00 م', 
      order: 3, 
      isVisible: true,
      type: 'contact'
    },
    { 
      id: '4', 
      title: 'تابعنا', 
      content: 'فيسبوك\nتويتر\nانستغرام\nلينكدإن', 
      order: 4, 
      isVisible: true,
      type: 'social'
    },
    { 
      id: '5', 
      title: 'سياسة الخصوصية', 
      content: 'سياسة الخصوصية\nالشروط والأحكام\nالأسئلة الشائعة\nخريطة الموقع', 
      order: 5, 
      isVisible: true,
      type: 'links'
    },
    { 
      id: '6', 
      title: 'الدعم الفني', 
      content: 'الدعم الفني\nالضمان\nالصيانة\nقطع الغيار', 
      order: 6, 
      isVisible: true,
      type: 'links'
    }
  ])

  const [loading, setLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<FooterColumn | null>(null)
  const [newColumn, setNewColumn] = useState({ title: '', content: '', type: 'text' as const })
  const [showHtmlPreview, setShowHtmlPreview] = useState(false)

  useEffect(() => {
    fetchFooterData()
  }, [])

  const fetchFooterData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const [settingsResponse, contentResponse, socialResponse, columnsResponse] = await Promise.all([
        fetch('/api/site-settings', { method: 'GET', headers }),
        fetch('/api/footer/content', { method: 'GET', headers }),
        fetch('/api/footer/social', { method: 'GET', headers }),
        fetch('/api/footer/columns', { method: 'GET', headers })
      ])

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        if (settingsData[0]?.footerSettings) {
          setSettings(settingsData[0].footerSettings)
        }
      }

      if (contentResponse.ok) {
        const contentData = await contentResponse.json()
        setContent(contentData)
      }

      if (socialResponse.ok) {
        const socialData = await socialResponse.json()
        setSocialLinks(socialData)
      }

      if (columnsResponse.ok) {
        const columnsData = await columnsResponse.json()
        setColumns(columnsData)
      }
    } catch (error) {
      console.error('Error fetching footer data:', error)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ footerSettings: settings })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Footer settings saved successfully'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save footer settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveContent = async () => {
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/footer/content', {
        method: 'PUT',
        headers,
        body: JSON.stringify(content)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Footer content saved successfully'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save footer content',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSocial = async () => {
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/footer/social', {
        method: 'PUT',
        headers,
        body: JSON.stringify(socialLinks)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Social links saved successfully'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save social links',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveColumns = async () => {
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/footer/columns', {
        method: 'PUT',
        headers,
        body: JSON.stringify(columns)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Footer columns saved successfully'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save footer columns',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddColumn = () => {
    if (!newColumn.title || !newColumn.content) return

    const newCol: FooterColumn = {
      id: Date.now().toString(),
      title: newColumn.title,
      content: newColumn.content,
      order: columns.length + 1,
      isVisible: true,
      type: newColumn.type
    }

    setColumns([...columns, newCol])
    setNewColumn({ title: '', content: '', type: 'text' })
    setIsAddDialogOpen(false)
  }

  const handleUpdateColumn = (id: string, updates: Partial<FooterColumn>) => {
    setColumns(columns.map(col => 
      col.id === id ? { ...col, ...updates } : col
    ))
  }

  const handleDeleteColumn = (id: string) => {
    if (!confirm('Are you sure you want to delete this column?')) return
    setColumns(columns.filter(col => col.id !== id))
  }

  const handleReorderColumns = (fromIndex: number, toIndex: number) => {
    const newColumns = [...columns]
    const [removed] = newColumns.splice(fromIndex, 1)
    newColumns.splice(toIndex, 0, removed)
    
    // Update order numbers
    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index + 1
    }))
    
    setColumns(updatedColumns)
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    // Upload as a general asset with a descriptive filename so footer logo saves correctly
    formData.append('file', file)
    formData.append('type', 'general')
    formData.append('entityId', 'footer-logo')
    formData.append('filenameHint', content.logoText || 'footer-logo')

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: Record<string, string> = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers,
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setContent(prev => ({ ...prev, logoUrl: data.url }))
        toast({
          title: 'Success',
          description: 'Logo uploaded successfully'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload logo',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Footer Management</h2>
          <p className="text-gray-600">Customize your website footer appearance and content</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.open('/admin/site-settings', '_self')}>
            <Settings className="w-4 h-4 mr-2" />
            Back to Site Settings
          </Button>
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => {
            handleSaveSettings()
            handleSaveContent()
            handleSaveSocial()
            handleSaveColumns()
          }} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Save All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="columns">Columns</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Footer Settings
              </CardTitle>
              <CardDescription>
                Configure footer behavior and display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Display Options</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showLogo">Show Logo</Label>
                    <Switch
                      id="showLogo"
                      checked={settings.showLogo ?? true}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLogo: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showNavigation">Show Navigation</Label>
                    <Switch
                      id="showNavigation"
                      checked={settings.showNavigation ?? true}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showNavigation: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showContactInfo">Show Contact Info</Label>
                    <Switch
                      id="showContactInfo"
                      checked={settings.showContactInfo ?? true}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showContactInfo: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showSocialLinks">Show Social Links</Label>
                    <Switch
                      id="showSocialLinks"
                      checked={settings.showSocialLinks ?? true}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showSocialLinks: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Additional Features</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showNewsletter">Show Newsletter</Label>
                    <Switch
                      id="showNewsletter"
                      checked={settings.showNewsletter ?? true}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showNewsletter: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showCopyright">Show Copyright</Label>
                    <Switch
                      id="showCopyright"
                      checked={settings.showCopyright ?? true}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showCopyright: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showBackToTop">Show Back to Top</Label>
                    <Switch
                      id="showBackToTop"
                      checked={settings.showBackToTop ?? true}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showBackToTop: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Layout Options</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="columns">Number of Columns</Label>
                    <Select 
                      value={settings.columns?.toString() || '6'} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, columns: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of columns" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Column</SelectItem>
                        <SelectItem value="2">2 Columns</SelectItem>
                        <SelectItem value="3">3 Columns</SelectItem>
                        <SelectItem value="4">4 Columns</SelectItem>
                        <SelectItem value="5">5 Columns</SelectItem>
                        <SelectItem value="6">6 Columns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="layout">Layout Style</Label>
                    <Select 
                      value={settings.layout ?? 'standard'} 
                      onValueChange={(value: any) => setSettings(prev => ({ ...prev, layout: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of columns" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="centered">Centered</SelectItem>
                        <SelectItem value="split">Split Layout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Footer Content
              </CardTitle>
              <CardDescription>
                Manage footer text content and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Branding</h3>
                  
                  <div>
                    <Label htmlFor="logoText">Logo Text</Label>
                    <Input
                      id="logoText"
                      value={content.logoText || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, logoText: e.target.value }))}
                      placeholder="Enter logo text"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={content.tagline || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="Enter tagline"
                    />
                  </div>

                  <div>
                    <Label>Logo Image</Label>
                    <div className="mt-2">
                      {content.logoUrl ? (
                        <div className="flex items-center gap-4">
                          <img 
                            src={content.logoUrl} 
                            alt="Logo" 
                            className="h-16 w-auto border rounded"
                          />
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                              id="logo-upload"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => document.getElementById('logo-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Change Logo
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Logo
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Contact Information</h3>
                  
                  <div>
                    <Label htmlFor="primaryPhone">Primary Phone</Label>
                    <Input
                      id="primaryPhone"
                      value={content.primaryPhone || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, primaryPhone: e.target.value }))}
                      placeholder="Enter primary phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                    <Input
                      id="secondaryPhone"
                      value={content.secondaryPhone || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, secondaryPhone: e.target.value }))}
                      placeholder="Enter secondary phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="primaryEmail">Primary Email</Label>
                    <Input
                      id="primaryEmail"
                      type="email"
                      value={content.primaryEmail || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, primaryEmail: e.target.value }))}
                      placeholder="Enter primary email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondaryEmail">Secondary Email</Label>
                    <Input
                      id="secondaryEmail"
                      type="email"
                      value={content.secondaryEmail || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, secondaryEmail: e.target.value }))}
                      placeholder="Enter secondary email"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Location & Hours</h3>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={content.address || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter address"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="workingHours">Working Hours</Label>
                    <Textarea
                      id="workingHours"
                      value={content.workingHours || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, workingHours: e.target.value }))}
                      placeholder="Enter working hours"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Additional Content</h3>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="copyrightText">Copyright Text</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHtmlPreview(!showHtmlPreview)}
                        className="text-xs"
                      >
                        {showHtmlPreview ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                        {showHtmlPreview ? 'Hide Preview' : 'Show Preview'}
                      </Button>
                    </div>
                    <div className="border rounded-md">
                      <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('copyrightText') as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const selectedText = textarea.value.substring(start, end)
                              const newText = `<strong>${selectedText}</strong>`
                              textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                              setContent(prev => ({ ...prev, copyrightText: textarea.value }))
                              textarea.focus()
                              textarea.setSelectionRange(start + 8, start + 8 + selectedText.length)
                            }
                          }}
                          className="font-bold"
                        >
                          B
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('copyrightText') as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const selectedText = textarea.value.substring(start, end)
                              const newText = `<em>${selectedText}</em>`
                              textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                              setContent(prev => ({ ...prev, copyrightText: textarea.value }))
                              textarea.focus()
                              textarea.setSelectionRange(start + 4, start + 4 + selectedText.length)
                            }
                          }}
                          className="italic"
                        >
                          I
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('copyrightText') as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const selectedText = textarea.value.substring(start, end)
                              const newText = `<u>${selectedText}</u>`
                              textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                              setContent(prev => ({ ...prev, copyrightText: textarea.value }))
                              textarea.focus()
                              textarea.setSelectionRange(start + 3, start + 3 + selectedText.length)
                            }
                          }}
                          className="underline"
                        >
                          U
                        </Button>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('copyrightText') as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const selectedText = textarea.value.substring(start, end)
                              const newText = `<a href="#" title="link">${selectedText}</a>`
                              textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                              setContent(prev => ({ ...prev, copyrightText: textarea.value }))
                              textarea.focus()
                              textarea.setSelectionRange(start + 9, start + 9 + 4)
                            }
                          }}
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('copyrightText') as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const selectedText = textarea.value.substring(start, end)
                              const newText = `<span style=\"color: #0A1A3F\">${selectedText}</span>`
                              textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                              setContent(prev => ({ ...prev, copyrightText: textarea.value }))
                              textarea.focus()
                              textarea.setSelectionRange(start + 25, start + 25 + selectedText.length)
                            }
                          }}
                          className="text-[#0A1A3F]"
                        >
                          A
                        </Button>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('copyrightText') as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const newText = `&copy; `
                              textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                              setContent(prev => ({ ...prev, copyrightText: textarea.value }))
                              textarea.focus()
                              textarea.setSelectionRange(start + 6, start + 6)
                            }
                          }}
                        >
                          ©
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('copyrightText') as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const newText = `&reg; `
                              textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                              setContent(prev => ({ ...prev, copyrightText: textarea.value }))
                              textarea.focus()
                              textarea.setSelectionRange(start + 6, start + 6)
                            }
                          }}
                        >
                          ®
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById('copyrightText') as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const newText = `&trade; `
                              textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
                              setContent(prev => ({ ...prev, copyrightText: textarea.value }))
                              textarea.focus()
                              textarea.setSelectionRange(start + 7, start + 7)
                            }
                          }}
                        >
                          ™
                        </Button>
                      </div>
                      <Textarea
                        id="copyrightText"
                        value={content.copyrightText || ''}
                        onChange={(e) => setContent(prev => ({ ...prev, copyrightText: e.target.value }))}
                        placeholder="Enter copyright text (HTML supported)"
                        rows={4}
                        className="border-0 focus:ring-0 font-mono text-sm"
                      />
                    </div>
                    
                    {/* HTML Preview */}
                    {showHtmlPreview && (
                      <div className="mt-2 p-3 border rounded-md bg-gray-50">
                        <div className="text-xs text-gray-500 mb-1">Preview:</div>
                        <div 
                          className="text-sm text-gray-700"
                          dangerouslySetInnerHTML={{ 
                            __html: content.copyrightText || `© ${new Date().getFullYear()} Al-Hamd Cars. All rights reserved.` 
                          }}
                        />
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      HTML tags supported: &lt;strong&gt;, &lt;em&gt;, &lt;u&gt;, &lt;a&gt;, &lt;span&gt;, &amp;copy;, &amp;reg;, &amp;trade;
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="newsletterText">Newsletter Text</Label>
                    <Textarea
                      id="newsletterText"
                      value={content.newsletterText || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, newsletterText: e.target.value }))}
                      placeholder="Enter newsletter text"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="backToTopText">Back to Top Text</Label>
                    <Input
                      id="backToTopText"
                      value={content.backToTopText || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, backToTopText: e.target.value }))}
                      placeholder="Enter back to top text"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="columns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Footer Columns
              </CardTitle>
              <CardDescription>
                Manage footer column content and layout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Footer Columns</h3>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Column
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Column</DialogTitle>
                      <DialogDescription>
                        Create a new footer column with custom content
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newColumnTitle">Column Title</Label>
                        <Input
                          id="newColumnTitle"
                          value={newColumn.title}
                          onChange={(e) => setNewColumn(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter column title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newColumnType">Column Type</Label>
                        <Select 
                          value={newColumn.type} 
                          onValueChange={(value: any) => setNewColumn(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="links">Links</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="contact">Contact</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="newColumnContent">Content</Label>
                        <Textarea
                          id="newColumnContent"
                          value={newColumn.content}
                          onChange={(e) => setNewColumn(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Enter column content (one item per line)"
                          rows={5}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddColumn}>
                          Add Column
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {columns.map((column, index) => (
                  <Card key={column.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          {column.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={column.isVisible}
                            onCheckedChange={(checked) => handleUpdateColumn(column.id, { isVisible: checked })}
                          />
                          <Badge variant="outline">{column.type}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <Textarea
                          value={column.content}
                          onChange={(e) => handleUpdateColumn(column.id, { content: e.target.value })}
                          placeholder="Column content"
                          rows={4}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (index > 0) handleReorderColumns(index, index - 1)
                              }}
                              disabled={index === 0}
                            >
                              <ChevronDown className="w-4 h-4 rotate-180" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (index < columns.length - 1) handleReorderColumns(index, index + 1)
                              }}
                              disabled={index === columns.length - 1}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteColumn(column.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Social Media Links
              </CardTitle>
              <CardDescription>
                Configure social media links for the footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={socialLinks.facebook || ''}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={socialLinks.twitter || ''}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={socialLinks.instagram || ''}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={socialLinks.linkedin || ''}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={socialLinks.youtube || ''}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, youtube: e.target.value }))}
                    placeholder="https://youtube.com/yourchannel"
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={socialLinks.tiktok || ''}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, tiktok: e.target.value }))}
                    placeholder="https://tiktok.com/@yourhandle"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}