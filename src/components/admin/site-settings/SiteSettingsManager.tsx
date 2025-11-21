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
import HeaderManagement from '@/components/admin/HeaderManagement'
import FooterManagement from '@/components/admin/FooterManagement'

interface SiteSettings {
  id?: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  neutralDarkColor?: string
  neutralLightColor?: string
  surfaceColor?: string
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
    canonicalUrl?: string
    robotsTxt?: string
    sitemapEnabled: boolean
    googleAnalyticsId?: string
    googleTagManagerId?: string
    bingWebmasterId?: string
    yandexWebmasterId?: string
    facebookDomainVerification?: string
    structuredDataEnabled: boolean
    openGraphEnabled: boolean
    twitterCardEnabled: boolean
    noIndexDefault: boolean
    hreflangEnabled: boolean
    defaultLanguage: string
  }
  performanceSettings: {
    cachingEnabled: boolean
    cacheTTL: number
    compressionEnabled: boolean
    imageOptimizationEnabled: boolean
    lazyLoadingEnabled: boolean
    minificationEnabled: boolean
    bundleOptimizationEnabled: boolean
    cdnEnabled: boolean
    cdnUrl?: string
    prefetchingEnabled: boolean
    monitoringEnabled: boolean
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
    primaryColor: '#0A1A3F',
    secondaryColor: '#C1272D',
    accentColor: '#C9C9C9',
    neutralDarkColor: '#1F1F1F',
    neutralLightColor: '#EEEEEE',
    surfaceColor: '#FFFFFF',
    fontFamily: 'Inter',
    siteTitle: 'Al-Hamd Cars',
    siteDescription: 'Premium Car Dealership in Egypt',
    contactEmail: 'info@elhamdimport.com',
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
      twitterHandle: '@alhamdcars',
      canonicalUrl: 'https://alhamdcars.com',
      robotsTxt: 'User-agent: *\nAllow: /\n\nSitemap: https://alhamdcars.com/sitemap.xml',
      sitemapEnabled: true,
      googleAnalyticsId: '',
      googleTagManagerId: '',
      bingWebmasterId: '',
      yandexWebmasterId: '',
      facebookDomainVerification: '',
      structuredDataEnabled: true,
      openGraphEnabled: true,
      twitterCardEnabled: true,
      noIndexDefault: false,
      hreflangEnabled: true,
      defaultLanguage: 'ar'
    },
    performanceSettings: {
      cachingEnabled: true,
      cacheTTL: 300,
      compressionEnabled: true,
      imageOptimizationEnabled: true,
      lazyLoadingEnabled: true,
      minificationEnabled: true,
      bundleOptimizationEnabled: true,
      cdnEnabled: false,
      cdnUrl: '',
      prefetchingEnabled: true,
      monitoringEnabled: true
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
      const response = await fetch('/api/site-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data[0]) {
          setSettings(data[0])
        }
      } else if (response.status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/login'
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
      } else if (response.status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/login'
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
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
                    value={settings.socialLinks?.facebook || ''}
                    onChange={(e) => updateSettings(['socialLinks', 'facebook'], e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={settings.socialLinks?.twitter || ''}
                    onChange={(e) => updateSettings(['socialLinks', 'twitter'], e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.socialLinks?.instagram || ''}
                    onChange={(e) => updateSettings(['socialLinks', 'instagram'], e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={settings.socialLinks?.linkedin || ''}
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
                      placeholder="#0A1A3F"
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
                      placeholder="#C1272D"
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
                      placeholder="#C9C9C9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="neutralDarkColor">Dark Gray</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="neutralDarkColor"
                      type="color"
                      value={settings.neutralDarkColor || '#1F1F1F'}
                      onChange={(e) => updateSettings(['neutralDarkColor'], e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.neutralDarkColor || '#1F1F1F'}
                      onChange={(e) => updateSettings(['neutralDarkColor'], e.target.value)}
                      placeholder="#1F1F1F"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="neutralLightColor">Light Gray</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="neutralLightColor"
                      type="color"
                      value={settings.neutralLightColor || '#EEEEEE'}
                      onChange={(e) => updateSettings(['neutralLightColor'], e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.neutralLightColor || '#EEEEEE'}
                      onChange={(e) => updateSettings(['neutralLightColor'], e.target.value)}
                      placeholder="#EEEEEE"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="surfaceColor">Surface / Background</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="surfaceColor"
                      type="color"
                      value={settings.surfaceColor || '#FFFFFF'}
                      onChange={(e) => updateSettings(['surfaceColor'], e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.surfaceColor || '#FFFFFF'}
                      onChange={(e) => updateSettings(['surfaceColor'], e.target.value)}
                      placeholder="#FFFFFF"
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
          <HeaderManagement />
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <FooterManagement />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Basic SEO Settings
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
                  value={settings.seoSettings?.metaTitle || ''}
                  onChange={(e) => updateSettings(['seoSettings', 'metaTitle'], e.target.value)}
                  placeholder="Enter meta title"
                />
              </div>
              
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seoSettings?.metaDescription || ''}
                  onChange={(e) => updateSettings(['seoSettings', 'metaDescription'], e.target.value)}
                  placeholder="Enter meta description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={settings.seoSettings?.keywords || ''}
                  onChange={(e) => updateSettings(['seoSettings', 'keywords'], e.target.value)}
                  placeholder="Enter keywords (comma separated)"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ogImage">OG Image URL</Label>
                  <Input
                    id="ogImage"
                    value={settings.seoSettings?.ogImage || ''}
                    onChange={(e) => updateSettings(['seoSettings', 'ogImage'], e.target.value)}
                    placeholder="Enter OG image URL"
                  />
                </div>
                <div>
                  <Label htmlFor="twitterHandle">Twitter Handle</Label>
                  <Input
                    id="twitterHandle"
                    value={settings.seoSettings?.twitterHandle || ''}
                    onChange={(e) => updateSettings(['seoSettings', 'twitterHandle'], e.target.value)}
                    placeholder="@yourhandle"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    value={settings.seoSettings?.canonicalUrl || ''}
                    onChange={(e) => updateSettings(['seoSettings', 'canonicalUrl'], e.target.value)}
                    placeholder="https://yourdomain.com"
                  />
                </div>
                <div>
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Select 
                    value={settings.seoSettings?.defaultLanguage || 'ar'} 
                    onValueChange={(value) => updateSettings(['seoSettings', 'defaultLanguage'], value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Social Media & Verification
              </CardTitle>
              <CardDescription>
                Configure social media and search engine verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={settings.seoSettings?.googleAnalyticsId || ''}
                    onChange={(e) => updateSettings(['seoSettings', 'googleAnalyticsId'], e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                  <Input
                    id="googleTagManagerId"
                    value={settings.seoSettings?.googleTagManagerId || ''}
                    onChange={(e) => updateSettings(['seoSettings', 'googleTagManagerId'], e.target.value)}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bingWebmasterId">Bing Webmaster ID</Label>
                  <Input
                    id="bingWebmasterId"
                    value={settings.seoSettings?.bingWebmasterId || ''}
                    onChange={(e) => updateSettings(['seoSettings', 'bingWebmasterId'], e.target.value)}
                    placeholder="Bing verification code"
                  />
                </div>
                <div>
                  <Label htmlFor="facebookDomainVerification">Facebook Domain Verification</Label>
                  <Input
                    id="facebookDomainVerification"
                    value={settings.seoSettings?.facebookDomainVerification || ''}
                    onChange={(e) => updateSettings(['seoSettings', 'facebookDomainVerification'], e.target.value)}
                    placeholder="Facebook verification code"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced SEO Settings
              </CardTitle>
              <CardDescription>
                Advanced SEO configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="structuredDataEnabled">Structured Data</Label>
                    <p className="text-sm text-gray-600">Enable schema.org structured data</p>
                  </div>
                  <Switch
                    id="structuredDataEnabled"
                    checked={settings.seoSettings?.structuredDataEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['seoSettings', 'structuredDataEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="openGraphEnabled">Open Graph</Label>
                    <p className="text-sm text-gray-600">Enable Open Graph tags</p>
                  </div>
                  <Switch
                    id="openGraphEnabled"
                    checked={settings.seoSettings?.openGraphEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['seoSettings', 'openGraphEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twitterCardEnabled">Twitter Cards</Label>
                    <p className="text-sm text-gray-600">Enable Twitter Card tags</p>
                  </div>
                  <Switch
                    id="twitterCardEnabled"
                    checked={settings.seoSettings?.twitterCardEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['seoSettings', 'twitterCardEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sitemapEnabled">Sitemap</Label>
                    <p className="text-sm text-gray-600">Generate XML sitemap</p>
                  </div>
                  <Switch
                    id="sitemapEnabled"
                    checked={settings.seoSettings?.sitemapEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['seoSettings', 'sitemapEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hreflangEnabled">Hreflang</Label>
                    <p className="text-sm text-gray-600">Enable hreflang tags</p>
                  </div>
                  <Switch
                    id="hreflangEnabled"
                    checked={settings.seoSettings?.hreflangEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['seoSettings', 'hreflangEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="noIndexDefault">No Index Default</Label>
                    <p className="text-sm text-gray-600">Prevent indexing by default</p>
                  </div>
                  <Switch
                    id="noIndexDefault"
                    checked={settings.seoSettings?.noIndexDefault || false}
                    onCheckedChange={(checked) => updateSettings(['seoSettings', 'noIndexDefault'], checked)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="robotsTxt">Robots.txt Content</Label>
                <Textarea
                  id="robotsTxt"
                  value={settings.seoSettings?.robotsTxt || ''}
                  onChange={(e) => updateSettings(['seoSettings', 'robotsTxt'], e.target.value)}
                  placeholder="Enter robots.txt content"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Performance Optimization
              </CardTitle>
              <CardDescription>
                Configure performance optimization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cachingEnabled">Caching</Label>
                    <p className="text-sm text-gray-600">Enable response caching</p>
                  </div>
                  <Switch
                    id="cachingEnabled"
                    checked={settings.performanceSettings?.cachingEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['performanceSettings', 'cachingEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compressionEnabled">Compression</Label>
                    <p className="text-sm text-gray-600">Enable Gzip compression</p>
                  </div>
                  <Switch
                    id="compressionEnabled"
                    checked={settings.performanceSettings?.compressionEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['performanceSettings', 'compressionEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="imageOptimizationEnabled">Image Optimization</Label>
                    <p className="text-sm text-gray-600">Optimize images automatically</p>
                  </div>
                  <Switch
                    id="imageOptimizationEnabled"
                    checked={settings.performanceSettings?.imageOptimizationEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['performanceSettings', 'imageOptimizationEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lazyLoadingEnabled">Lazy Loading</Label>
                    <p className="text-sm text-gray-600">Enable lazy loading for images</p>
                  </div>
                  <Switch
                    id="lazyLoadingEnabled"
                    checked={settings.performanceSettings?.lazyLoadingEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['performanceSettings', 'lazyLoadingEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="minificationEnabled">Minification</Label>
                    <p className="text-sm text-gray-600">Minify CSS and JavaScript</p>
                  </div>
                  <Switch
                    id="minificationEnabled"
                    checked={settings.performanceSettings?.minificationEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['performanceSettings', 'minificationEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bundleOptimizationEnabled">Bundle Optimization</Label>
                    <p className="text-sm text-gray-600">Optimize JavaScript bundles</p>
                  </div>
                  <Switch
                    id="bundleOptimizationEnabled"
                    checked={settings.performanceSettings?.bundleOptimizationEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['performanceSettings', 'bundleOptimizationEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cdnEnabled">CDN</Label>
                    <p className="text-sm text-gray-600">Use Content Delivery Network</p>
                  </div>
                  <Switch
                    id="cdnEnabled"
                    checked={settings.performanceSettings?.cdnEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['performanceSettings', 'cdnEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="prefetchingEnabled">Prefetching</Label>
                    <p className="text-sm text-gray-600">Enable link prefetching</p>
                  </div>
                  <Switch
                    id="prefetchingEnabled"
                    checked={settings.performanceSettings?.prefetchingEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['performanceSettings', 'prefetchingEnabled'], checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monitoringEnabled">Monitoring</Label>
                    <p className="text-sm text-gray-600">Enable performance monitoring</p>
                  </div>
                  <Switch
                    id="monitoringEnabled"
                    checked={settings.performanceSettings?.monitoringEnabled || false}
                    onCheckedChange={(checked) => updateSettings(['performanceSettings', 'monitoringEnabled'], checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cacheTTL">Cache TTL (seconds)</Label>
                  <Input
                    id="cacheTTL"
                    type="number"
                    value={settings.performanceSettings?.cacheTTL || 300}
                    onChange={(e) => updateSettings(['performanceSettings', 'cacheTTL'], parseInt(e.target.value) || 300)}
                    placeholder="300"
                  />
                </div>
                <div>
                  <Label htmlFor="cdnUrl">CDN URL</Label>
                  <Input
                    id="cdnUrl"
                    value={settings.performanceSettings?.cdnUrl || ''}
                    onChange={(e) => updateSettings(['performanceSettings', 'cdnUrl'], e.target.value)}
                    placeholder="https://cdn.yourdomain.com"
                    disabled={!settings.performanceSettings?.cdnEnabled}
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