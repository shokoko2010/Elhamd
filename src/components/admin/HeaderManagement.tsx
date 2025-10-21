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
  Settings,
  Palette,
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
  ExternalLink
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface NavigationItem {
  id: string
  label: string
  href: string
  order: number
  isVisible: boolean
  children?: NavigationItem[]
}

interface HeaderSettings {
  showLogo: boolean
  showNavigation: boolean
  showContactInfo: boolean
  showSocialLinks: boolean
  stickyHeader: boolean
  transparentHeader: boolean
  showSearch: boolean
  showUserMenu: boolean
  showLanguageSelector: boolean
  mobileMenuStyle: 'overlay' | 'slide' | 'drawer'
  navigationStyle: 'horizontal' | 'vertical' | 'centered'
}

interface HeaderContent {
  logoUrl?: string
  logoText?: string
  tagline?: string
  primaryPhone?: string
  secondaryPhone?: string
  primaryEmail?: string
  secondaryEmail?: string
  address?: string
  workingHours?: string
  ctaButton?: {
    text: string
    href: string
    isVisible: boolean
    style: 'primary' | 'secondary' | 'outline'
  }
}

interface SocialLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
}

export default function HeaderManagement() {
  const { toast } = useToast()
  
  const [settings, setSettings] = useState<HeaderSettings>({
    showLogo: true,
    showNavigation: true,
    showContactInfo: true,
    showSocialLinks: true,
    stickyHeader: true,
    transparentHeader: false,
    showSearch: true,
    showUserMenu: true,
    showLanguageSelector: false,
    mobileMenuStyle: 'overlay',
    navigationStyle: 'horizontal'
  })

  const [content, setContent] = useState<HeaderContent>({
    logoText: 'Al-Hamd Cars',
    tagline: 'Your Trusted Car Dealership',
    primaryPhone: '+20 2 1234 5678',
    primaryEmail: 'info@elhamdimport.com',
    address: 'Cairo, Egypt',
    workingHours: 'Sat-Thu: 9AM-8PM, Fri: 2PM-8PM',
    ctaButton: {
      text: 'Book a Test Drive',
      href: '/test-drive',
      isVisible: true,
      style: 'primary'
    }
  })

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({})
  const [navigation, setNavigation] = useState<NavigationItem[]>([
    { id: '1', label: 'Home', href: '/', order: 1, isVisible: true },
    { id: '2', label: 'Vehicles', href: '/vehicles', order: 2, isVisible: true },
    { id: '3', label: 'Services', href: '/service-booking', order: 3, isVisible: true },
    { id: '4', label: 'Test Drive', href: '/test-drive', order: 4, isVisible: true },
    { id: '5', label: 'About Us', href: '/about', order: 5, isVisible: true },
    { id: '6', label: 'Contact', href: '/contact', order: 6, isVisible: true }
  ])

  const [loading, setLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null)
  const [newItem, setNewItem] = useState({ label: '', href: '' })

  useEffect(() => {
    fetchHeaderData()
  }, [])

  const fetchHeaderData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const [settingsResponse, contentResponse, socialResponse, navigationResponse] = await Promise.all([
        fetch('/api/site-settings', { method: 'GET', headers }),
        fetch('/api/header/content', { method: 'GET', headers }),
        fetch('/api/header/social', { method: 'GET', headers }),
        fetch('/api/header/navigation', { method: 'GET', headers })
      ])

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        if (settingsData[0]?.headerSettings) {
          setSettings(settingsData[0].headerSettings)
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

      if (navigationResponse.ok) {
        const navigationData = await navigationResponse.json()
        setNavigation(navigationData)
      }
    } catch (error) {
      console.error('Error fetching header data:', error)
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
        body: JSON.stringify({ headerSettings: settings })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Header settings saved successfully'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save header settings',
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

      const response = await fetch('/api/header/content', {
        method: 'PUT',
        headers,
        body: JSON.stringify(content)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Header content saved successfully'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save header content',
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

      const response = await fetch('/api/header/social', {
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

  const handleSaveNavigation = async () => {
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/header/navigation', {
        method: 'PUT',
        headers,
        body: JSON.stringify(navigation)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Navigation saved successfully'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save navigation',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddNavigationItem = () => {
    if (!newItem.label || !newItem.href) return

    const newNav: NavigationItem = {
      id: Date.now().toString(),
      label: newItem.label,
      href: newItem.href,
      order: navigation.length + 1,
      isVisible: true
    }

    setNavigation([...navigation, newNav])
    setNewItem({ label: '', href: '' })
    setIsAddDialogOpen(false)
  }

  const handleUpdateNavigationItem = (id: string, updates: Partial<NavigationItem>) => {
    setNavigation(navigation.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const handleDeleteNavigationItem = (id: string) => {
    if (!confirm('Are you sure you want to delete this navigation item?')) return
    setNavigation(navigation.filter(item => item.id !== id))
  }

  const handleReorderNavigation = (fromIndex: number, toIndex: number) => {
    const newNavigation = [...navigation]
    const [removed] = newNavigation.splice(fromIndex, 1)
    newNavigation.splice(toIndex, 0, removed)
    
    // Update order numbers
    const updatedNavigation = newNavigation.map((item, index) => ({
      ...item,
      order: index + 1
    }))
    
    setNavigation(updatedNavigation)
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'logo')

    try {
      // Try public upload first (no auth required)
      let response = await fetch('/api/upload/public', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setContent(prev => ({ ...prev, logoUrl: data.url }))
        toast({
          title: 'Success',
          description: 'Logo uploaded successfully'
        })
        return
      }

      // Try simple upload with auth
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: Record<string, string> = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      response = await fetch('/api/upload/simple', {
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
        return
      }

      // Fallback to complex upload
      formData.set('type', 'general')
      formData.set('entityId', 'logo')
      
      response = await fetch('/api/upload/image', {
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
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload logo')
      }
    } catch (error) {
      console.error('Logo upload error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload logo',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Header Management</h2>
          <p className="text-gray-600">Customize your website header appearance and content</p>
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
            handleSaveNavigation()
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
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Header Settings
              </CardTitle>
              <CardDescription>
                Configure header behavior and display options
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
                  <h3 className="font-medium">Header Behavior</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stickyHeader">Sticky Header</Label>
                    <Switch
                      id="stickyHeader"
                      checked={settings.stickyHeader ?? true}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, stickyHeader: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="transparentHeader">Transparent Header</Label>
                    <Switch
                      id="transparentHeader"
                      checked={settings.transparentHeader ?? false}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, transparentHeader: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showSearch">Show Search</Label>
                    <Switch
                      id="showSearch"
                      checked={settings.showSearch ?? true}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showSearch: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showUserMenu">Show User Menu</Label>
                    <Switch
                      id="showUserMenu"
                      checked={settings.showUserMenu ?? true}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showUserMenu: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Style Options</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobileMenuStyle">Mobile Menu Style</Label>
                    <Select 
                      value={settings.mobileMenuStyle ?? 'overlay'} 
                      onValueChange={(value: any) => setSettings(prev => ({ ...prev, mobileMenuStyle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mobile menu style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overlay">Overlay</SelectItem>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="drawer">Drawer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="navigationStyle">Navigation Style</Label>
                    <Select 
                      value={settings.navigationStyle ?? 'horizontal'} 
                      onValueChange={(value: any) => setSettings(prev => ({ ...prev, navigationStyle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mobile menu style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="horizontal">Horizontal</SelectItem>
                        <SelectItem value="vertical">Vertical</SelectItem>
                        <SelectItem value="centered">Centered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveSettings} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Header Content
              </CardTitle>
              <CardDescription>
                Manage header text, logo, and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Logo & Branding</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logoText">Logo Text</Label>
                    <Input
                      id="logoText"
                      value={content.logoText}
                      onChange={(e) => setContent(prev => ({ ...prev, logoText: e.target.value }))}
                      placeholder="Enter logo text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={content.tagline}
                      onChange={(e) => setContent(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="Enter tagline"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Logo Image</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        {content.logoUrl ? (
                          <img src={content.logoUrl} alt="Logo" className="w-full h-full object-cover rounded" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="mb-2"
                        />
                        <Button variant="outline" size="sm" onClick={() => setContent(prev => ({ ...prev, logoUrl: undefined }))}>
                          Remove Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Contact Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primaryPhone">Primary Phone</Label>
                    <Input
                      id="primaryPhone"
                      value={content.primaryPhone}
                      onChange={(e) => setContent(prev => ({ ...prev, primaryPhone: e.target.value }))}
                      placeholder="+20 2 1234 5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                    <Input
                      id="secondaryPhone"
                      value={content.secondaryPhone}
                      onChange={(e) => setContent(prev => ({ ...prev, secondaryPhone: e.target.value }))}
                      placeholder="+20 2 1234 5679"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryEmail">Primary Email</Label>
                    <Input
                      id="primaryEmail"
                      value={content.primaryEmail}
                      onChange={(e) => setContent(prev => ({ ...prev, primaryEmail: e.target.value }))}
                      placeholder="info@elhamdimport.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryEmail">Secondary Email</Label>
                    <Input
                      id="secondaryEmail"
                      value={content.secondaryEmail}
                      onChange={(e) => setContent(prev => ({ ...prev, secondaryEmail: e.target.value }))}
                      placeholder="sales@alhamdcars.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Location & Hours</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={content.address}
                      onChange={(e) => setContent(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter business address"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workingHours">Working Hours</Label>
                    <Input
                      id="workingHours"
                      value={content.workingHours}
                      onChange={(e) => setContent(prev => ({ ...prev, workingHours: e.target.value }))}
                      placeholder="Sat-Thu: 9AM-8PM, Fri: 2PM-8PM"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Call to Action Button</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showCta">Show CTA Button</Label>
                    <Switch
                      id="showCta"
                      checked={content.ctaButton?.isVisible || false}
                      onCheckedChange={(checked) => setContent(prev => ({ 
                        ...prev, 
                        ctaButton: { ...prev.ctaButton!, isVisible: checked }
                      }))}
                    />
                  </div>

                  {content.ctaButton?.isVisible && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="ctaText">Button Text</Label>
                        <Input
                          id="ctaText"
                          value={content.ctaButton.text}
                          onChange={(e) => setContent(prev => ({ 
                            ...prev, 
                            ctaButton: { ...prev.ctaButton!, text: e.target.value }
                          }))}
                          placeholder="Book a Test Drive"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ctaHref">Button Link</Label>
                        <Input
                          id="ctaHref"
                          value={content.ctaButton.href}
                          onChange={(e) => setContent(prev => ({ 
                            ...prev, 
                            ctaButton: { ...prev.ctaButton!, href: e.target.value }
                          }))}
                          placeholder="/test-drive"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ctaStyle">Button Style</Label>
                        <Select 
                          value={content.ctaButton.style} 
                          onValueChange={(value: any) => setContent(prev => ({ 
                            ...prev, 
                            ctaButton: { ...prev.ctaButton!, style: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveContent} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="w-5 h-5" />
                Navigation Menu
              </CardTitle>
              <CardDescription>
                Manage navigation menu items and their order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Navigation Items</h3>
                  <p className="text-sm text-gray-600">Drag to reorder items</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Navigation Item</DialogTitle>
                      <DialogDescription>
                        Create a new navigation menu item
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newItemLabel">Label</Label>
                        <Input
                          id="newItemLabel"
                          value={newItem.label}
                          onChange={(e) => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                          placeholder="Enter label"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newItemHref">Link</Label>
                        <Input
                          id="newItemHref"
                          value={newItem.href}
                          onChange={(e) => setNewItem(prev => ({ ...prev, href: e.target.value }))}
                          placeholder="Enter URL"
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleAddNavigationItem} className="flex-1">
                          Add Item
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {navigation.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          value={item.label}
                          onChange={(e) => handleUpdateNavigationItem(item.id, { label: e.target.value })}
                          className="flex-1"
                        />
                        <Input
                          value={item.href}
                          onChange={(e) => handleUpdateNavigationItem(item.id, { href: e.target.value })}
                          className="flex-1"
                          placeholder="/path"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.isVisible}
                        onCheckedChange={(checked) => handleUpdateNavigationItem(item.id, { isVisible: checked })}
                      />
                      <Badge variant={item.isVisible ? 'default' : 'secondary'}>
                        {item.isVisible ? 'Visible' : 'Hidden'}
                      </Badge>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem(item)
                          setNewItem({ label: item.label, href: item.href })
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteNavigationItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveNavigation} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Navigation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Social Media Links
              </CardTitle>
              <CardDescription>
                Configure social media links for the header
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Social Networks</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          value={socialLinks.facebook || ''}
                          onChange={(e) => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))}
                          placeholder="https://facebook.com/yourpage"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Twitter className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          value={socialLinks.twitter || ''}
                          onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                          placeholder="https://twitter.com/yourhandle"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <div className="flex-1">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          value={socialLinks.instagram || ''}
                          onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                          placeholder="https://instagram.com/yourhandle"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Linkedin className="w-5 h-5 text-blue-700" />
                      <div className="flex-1">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={socialLinks.linkedin || ''}
                          onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Additional Networks</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">YT</span>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="youtube">YouTube</Label>
                        <Input
                          id="youtube"
                          value={socialLinks.youtube || ''}
                          onChange={(e) => setSocialLinks(prev => ({ ...prev, youtube: e.target.value }))}
                          placeholder="https://youtube.com/yourchannel"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">TT</span>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="tiktok">TikTok</Label>
                        <Input
                          id="tiktok"
                          value={socialLinks.tiktok || ''}
                          onChange={(e) => setSocialLinks(prev => ({ ...prev, tiktok: e.target.value }))}
                          placeholder="https://tiktok.com/@yourhandle"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveSocial} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Social Links
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}