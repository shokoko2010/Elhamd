'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Save, 
  Upload, 
  Palette, 
  Settings, 
  Smartphone,
  Monitor,
  Type,
  Image as ImageIcon,
  Link,
  Search,
  Share2,
  Layout,
  Columns
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SiteSettings {
  id?: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  siteTitle: string
  siteDescription: string
  contactEmail: string
  contactPhone?: string
  contactAddress?: string
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  seoSettings: {
    metaTitle: string
    metaDescription: string
    keywords: string
    ogImage?: string
    twitterHandle?: string
  }
  headerSettings: {
    showLogo: boolean
    showNavigation: boolean
    showContactInfo: boolean
    showSocialLinks: boolean
    stickyHeader: boolean
    transparentHeader: boolean
  }
  footerSettings: {
    showLogo: boolean
    showNavigation: boolean
    showContactInfo: boolean
    showSocialLinks: boolean
    showNewsletter: boolean
    showCopyright: boolean
    columns: number
  }
}

export default function SiteSettingsManager() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SiteSettings>({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    siteTitle: 'Al-Hamd Cars',
    siteDescription: 'Premium Car Dealership in Egypt',
    contactEmail: 'info@alhamdcars.com',
    contactPhone: '+20 123 456 7890',
    contactAddress: 'Cairo, Egypt',
    socialLinks: {
      facebook: 'https://facebook.com/alhamdcars',
      twitter: 'https://twitter.com/alhamdcars',
      instagram: 'https://instagram.com/alhamdcars',
      linkedin: 'https://linkedin.com/company/alhamdcars'
    },
    seoSettings: {
      metaTitle: 'Al-Hamd Cars - Premium Car Dealership in Egypt',
      metaDescription: 'Discover premium cars at Al-Hamd Cars. Best prices, excellent service, and wide selection of vehicles.',
      keywords: 'cars, dealership, egypt, premium vehicles, car sales',
      ogImage: '/og-image.jpg',
      twitterHandle: '@alhamdcars'
    },
    headerSettings: {
      showLogo: true,
      showNavigation: true,
      showContactInfo: true,
      showSocialLinks: true,
      stickyHeader: true,
      transparentHeader: false
    },
    footerSettings: {
      showLogo: true,
      showNavigation: true,
      showContactInfo: true,
      showSocialLinks: true,
      showNewsletter: true,
      showCopyright: true,
      columns: 4
    }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSiteSettings()
  }, [])

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('/api/site-settings')
      if (response.ok) {
        const data = await response.json()
        if (data[0]) {
          setSettings(data[0])
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch site settings',
        variant: 'destructive'
      })
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Site settings saved successfully'
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to save site settings',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save site settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (type: 'logo' | 'favicon') => {
    // This is a placeholder for image upload functionality
    // In a real implementation, you would integrate with an image upload service
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Simulate upload - in real implementation, upload to server and get URL
        const fakeUrl = `/uploads/${type}-${Date.now()}.${file.name.split('.').pop()}`
        setSettings(prev => ({
          ...prev,
          [type === 'logo' ? 'logoUrl' : 'faviconUrl']: fakeUrl
        }))
        toast({
          title: 'Success',
          description: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`
        })
      }
    }
    input.click()
  }

  const updateSettings = (path: string[], value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      let current: any = newSettings
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      
      current[path[path.length - 1]] = value
      return newSettings
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Site Settings</h2>
          <p className="text-gray-600">Manage your website appearance and configuration</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                General site information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteTitle">Site Title *</Label>
                  <Input
                    id="siteTitle"
                    value={settings.siteTitle}
                    onChange={(e) => updateSettings(['siteTitle'], e.target.value)}
                    placeholder="Enter site title"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateSettings(['contactEmail'], e.target.value)}
                    placeholder="Enter contact email"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => updateSettings(['siteDescription'], e.target.value)}
                  placeholder="Enter site description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone || ''}
                    onChange={(e) => updateSettings(['contactPhone'], e.target.value)}
                    placeholder="Enter contact phone"
                  />
                </div>
                <div>
                  <Label htmlFor="contactAddress">Contact Address</Label>
                  <Input
                    id="contactAddress"
                    value={settings.contactAddress || ''}
                    onChange={(e) => updateSettings(['contactAddress'], e.target.value)}
                    placeholder="Enter contact address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Social Media Links
              </CardTitle>
              <CardDescription>
                Connect your social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={settings.socialLinks.facebook || ''}
                    onChange={(e) => updateSettings(['socialLinks', 'facebook'], e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={settings.socialLinks.twitter || ''}
                    onChange={(e) => updateSettings(['socialLinks', 'twitter'], e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.socialLinks.instagram || ''}
                    onChange={(e) => updateSettings(['socialLinks', 'instagram'], e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={settings.socialLinks.linkedin || ''}
                    onChange={(e) => updateSettings(['socialLinks', 'linkedin'], e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Logo & Favicon
              </CardTitle>
              <CardDescription>
                Upload and manage your site logo and favicon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Logo</Label>
                  <div className="mt-2">
                    {settings.logoUrl ? (
                      <div className="flex items-center gap-4">
                        <img 
                          src={settings.logoUrl} 
                          alt="Logo" 
                          className="h-16 w-auto border rounded"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleImageUpload('logo')}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Change Logo
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => handleImageUpload('logo')}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Favicon</Label>
                  <div className="mt-2">
                    {settings.faviconUrl ? (
                      <div className="flex items-center gap-4">
                        <img 
                          src={settings.faviconUrl} 
                          alt="Favicon" 
                          className="h-16 w-16 border rounded"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleImageUpload('favicon')}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Change Favicon
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => handleImageUpload('favicon')}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Favicon
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Colors & Typography
              </CardTitle>
              <CardDescription>
                Customize your site colors and fonts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSettings(['primaryColor'], e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => updateSettings(['primaryColor'], e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSettings(['secondaryColor'], e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => updateSettings(['secondaryColor'], e.target.value)}
                      placeholder="#10B981"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => updateSettings(['accentColor'], e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => updateSettings(['accentColor'], e.target.value)}
                      placeholder="#F59E0B"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value) => updateSettings(['fontFamily'], value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Header Configuration
              </CardTitle>
              <CardDescription>
                Customize your website header appearance and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showLogo">Show Logo</Label>
                    <Switch
                      id="showLogo"
                      checked={settings.headerSettings.showLogo}
                      onCheckedChange={(checked) => updateSettings(['headerSettings', 'showLogo'], checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showNavigation">Show Navigation</Label>
                    <Switch
                      id="showNavigation"
                      checked={settings.headerSettings.showNavigation}
                      onCheckedChange={(checked) => updateSettings(['headerSettings', 'showNavigation'], checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showContactInfo">Show Contact Info</Label>
                    <Switch
                      id="showContactInfo"
                      checked={settings.headerSettings.showContactInfo}
                      onCheckedChange={(checked) => updateSettings(['headerSettings', 'showContactInfo'], checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showSocialLinks">Show Social Links</Label>
                    <Switch
                      id="showSocialLinks"
                      checked={settings.headerSettings.showSocialLinks}
                      onCheckedChange={(checked) => updateSettings(['headerSettings', 'showSocialLinks'], checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stickyHeader">Sticky Header</Label>
                    <Switch
                      id="stickyHeader"
                      checked={settings.headerSettings.stickyHeader}
                      onCheckedChange={(checked) => updateSettings(['headerSettings', 'stickyHeader'], checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="transparentHeader">Transparent Header</Label>
                    <Switch
                      id="transparentHeader"
                      checked={settings.headerSettings.transparentHeader}
                      onCheckedChange={(checked) => updateSettings(['headerSettings', 'transparentHeader'], checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Columns className="w-5 h-5" />
                Footer Configuration
              </CardTitle>
              <CardDescription>
                Customize your website footer layout and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="footerShowLogo">Show Logo</Label>
                    <Switch
                      id="footerShowLogo"
                      checked={settings.footerSettings.showLogo}
                      onCheckedChange={(checked) => updateSettings(['footerSettings', 'showLogo'], checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="footerShowNavigation">Show Navigation</Label>
                    <Switch
                      id="footerShowNavigation"
                      checked={settings.footerSettings.showNavigation}
                      onCheckedChange={(checked) => updateSettings(['footerSettings', 'showNavigation'], checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="footerShowContactInfo">Show Contact Info</Label>
                    <Switch
                      id="footerShowContactInfo"
                      checked={settings.footerSettings.showContactInfo}
                      onCheckedChange={(checked) => updateSettings(['footerSettings', 'showContactInfo'], checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="footerShowSocialLinks">Show Social Links</Label>
                    <Switch
                      id="footerShowSocialLinks"
                      checked={settings.footerSettings.showSocialLinks}
                      onCheckedChange={(checked) => updateSettings(['footerSettings', 'showSocialLinks'], checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="footerShowNewsletter">Show Newsletter</Label>
                    <Switch
                      id="footerShowNewsletter"
                      checked={settings.footerSettings.showNewsletter}
                      onCheckedChange={(checked) => updateSettings(['footerSettings', 'showNewsletter'], checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="footerShowCopyright">Show Copyright</Label>
                    <Switch
                      id="footerShowCopyright"
                      checked={settings.footerSettings.showCopyright}
                      onCheckedChange={(checked) => updateSettings(['footerSettings', 'showCopyright'], checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="footerColumns">Number of Columns</Label>
                <Select
                  value={settings.footerSettings.columns.toString()}
                  onValueChange={(value) => updateSettings(['footerSettings', 'columns'], parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Column</SelectItem>
                    <SelectItem value="2">2 Columns</SelectItem>
                    <SelectItem value="3">3 Columns</SelectItem>
                    <SelectItem value="4">4 Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                SEO Settings
              </CardTitle>
              <CardDescription>
                Optimize your site for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={settings.seoSettings.metaTitle}
                  onChange={(e) => updateSettings(['seoSettings', 'metaTitle'], e.target.value)}
                  placeholder="Enter meta title"
                />
              </div>
              
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seoSettings.metaDescription}
                  onChange={(e) => updateSettings(['seoSettings', 'metaDescription'], e.target.value)}
                  placeholder="Enter meta description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={settings.seoSettings.keywords}
                  onChange={(e) => updateSettings(['seoSettings', 'keywords'], e.target.value)}
                  placeholder="Enter keywords (comma separated)"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ogImage">OG Image URL</Label>
                  <Input
                    id="ogImage"
                    value={settings.seoSettings.ogImage || ''}
                    onChange={(e) => updateSettings(['seoSettings', 'ogImage'], e.target.value)}
                    placeholder="Enter OG image URL"
                  />
                </div>
                <div>
                  <Label htmlFor="twitterHandle">Twitter Handle</Label>
                  <Input
                    id="twitterHandle"
                    value={settings.seoSettings.twitterHandle || ''}
                    onChange={(e) => updateSettings(['seoSettings', 'twitterHandle'], e.target.value)}
                    placeholder="@yourhandle"
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