'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  LayoutTemplate,
  Settings,
  Save,
  X,
  MoveUp,
  MoveDown,
  Eye,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'
import { SliderImageManager } from '@/components/admin/SliderImageManager'

type SliderContentPosition =
  | 'top-right'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center'
  | 'top-left'
  | 'bottom-left'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'

interface SliderItem {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  ctaText: string
  ctaLink: string
  badge?: string
  badgeColor?: string
  contentPosition?: SliderContentPosition
  contentSize?: 'sm' | 'md' | 'lg'
  contentColor?: string
  contentShadow?: boolean
  contentStrokeColor?: string
  contentStrokeWidth?: number
  order: number
  isActive: boolean
}

interface CompanyInfo {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  features: string[]
  ctaButtons: {
    text: string
    link: string
    variant: 'primary' | 'secondary'
  }[]
}

interface ServiceItem {
  id: string
  title: string
  description: string
  icon: string
  link: string
  order: number
  isActive: boolean
}

interface CompanyFeature {
  id: string
  title: string
  description: string
  icon: string
  color: string
  features: string[]
  order: number
  isActive: boolean
}

interface HomepageSettings {
  showHeroSlider: boolean
  autoPlaySlider: boolean
  sliderInterval: number
  showFeaturedVehicles: boolean
  featuredVehiclesCount: number
  showServices: boolean
  showCompanyInfo: boolean
  servicesTitle: string
  servicesSubtitle: string
  servicesDescription: string
  servicesCtaText: string
  facebookPageUrl: string
  facebookVideoUrl: string
  theme: 'light' | 'dark' | 'auto'
}

export default function AdminHomepagePage() {
  return <HomepageContent />
}

function HomepageContent() {
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([])
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [companyFeatures, setCompanyFeatures] = useState<CompanyFeature[]>([])
  const [settings, setSettings] = useState<HomepageSettings>({
    showHeroSlider: true,
    autoPlaySlider: true,
    sliderInterval: 5000,
    showFeaturedVehicles: true,
    featuredVehiclesCount: 6,
    showServices: true,
    showCompanyInfo: true,
    servicesTitle: 'خدماتنا المتكاملة',
    servicesSubtitle: 'نقدم مجموعة شاملة من الخدمات لضمان أفضل تجربة لعملائنا',
    servicesDescription: 'اكتشف حلولنا المتكاملة في البيع، الصيانة، التمويل، وقطع الغيار مع فريق دعم متخصص.',
    servicesCtaText: 'احجز الآن',
    facebookPageUrl: 'https://www.facebook.com/elhamdimport',
    facebookVideoUrl: 'https://www.facebook.com/elhamdimport/videos',
    theme: 'light'
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('slider')

  // Dialog states
  const [showSliderDialog, setShowSliderDialog] = useState(false)
  const [showCompanyDialog, setShowCompanyDialog] = useState(false)
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [showFeaturesDialog, setShowFeaturesDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // Form states
  const [editingSlider, setEditingSlider] = useState<SliderItem | null>(null)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [sliderForm, setSliderForm] = useState<Partial<SliderItem>>({})
  const [serviceForm, setServiceForm] = useState<Partial<ServiceItem>>({})
  const [companyForm, setCompanyForm] = useState<CompanyInfo | null>(null)

  useEffect(() => {
    loadHomepageData()
  }, [])

  const defaultCompanyInfo: CompanyInfo = {
    id: 'new-company',
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    features: [],
    ctaButtons: []
  }

  const normalizeContentPosition = (position?: string): SliderContentPosition => {
    switch (position) {
      case 'top-right':
      case 'bottom-right':
      case 'top-center':
      case 'bottom-center':
      case 'top-left':
      case 'bottom-left':
      case 'middle-left':
      case 'middle-center':
      case 'middle-right':
        return position
      case 'left':
        return 'middle-left'
      case 'center':
        return 'middle-center'
      case 'right':
        return 'middle-right'
      case 'top':
        return 'top-center'
      case 'bottom':
        return 'bottom-center'
      default:
        return 'top-right'
    }
  }

  const adaptCompanyInfo = (payload: any): CompanyInfo => {
    return {
      id: typeof payload?.id === 'string' ? payload.id : 'company-info',
      title: typeof payload?.title === 'string' ? payload.title : '',
      subtitle: typeof payload?.subtitle === 'string' ? payload.subtitle : '',
      description: typeof payload?.description === 'string' ? payload.description : '',
      imageUrl: typeof payload?.imageUrl === 'string' ? payload.imageUrl : '',
      features: Array.isArray(payload?.features)
        ? payload.features.filter((feature: unknown): feature is string => typeof feature === 'string')
        : typeof payload?.features === 'string'
          ? payload.features
              .split('\n')
              .map((feature: string) => feature.trim())
              .filter(Boolean)
          : [],
      ctaButtons: Array.isArray(payload?.ctaButtons)
        ? payload.ctaButtons.map((button: any) => ({
            text: typeof button?.text === 'string' ? button.text : '',
            link: typeof button?.link === 'string' ? button.link : '',
            variant: button?.variant === 'secondary' ? 'secondary' : 'primary'
          }))
        : []
    }
  }

  const loadHomepageData = async () => {
    setLoading(true)
    try {
      // Fetch sliders from API
      const slidersResponse = await fetch('/api/sliders', { cache: 'no-store' })
      if (slidersResponse.ok) {
        const slidersData = await slidersResponse.json()
        const normalizedSliders = Array.isArray(slidersData?.sliders)
          ? slidersData.sliders
          : []

        setSliderItems(
          normalizedSliders.map((slider, index) => ({
            ...slider,
            contentPosition: normalizeContentPosition(slider?.contentPosition),
            contentSize: slider?.contentSize || 'lg',
            contentColor: slider?.contentColor || '#ffffff',
            contentShadow: slider?.contentShadow !== false,
            contentStrokeColor: slider?.contentStrokeColor || '#000000',
            contentStrokeWidth:
              typeof slider?.contentStrokeWidth === 'number' && slider.contentStrokeWidth >= 0
                ? slider.contentStrokeWidth
                : 0,
            order: typeof slider?.order === 'number' ? slider.order : index
          }))
        )
      } else {
        console.error('Failed to fetch sliders')
        // Use empty array on error
        setSliderItems([])
      }

      // Fetch company info from API
      const companyInfoResponse = await fetch('/api/company-info', { cache: 'no-store' })
      if (companyInfoResponse.ok) {
        const companyInfoData = await companyInfoResponse.json()
        setCompanyInfo(adaptCompanyInfo(companyInfoData))
      } else {
        setCompanyInfo(defaultCompanyInfo)
      }

      // Fetch service items from API
      const serviceItemsResponse = await fetch('/api/service-items', { cache: 'no-store' })
      if (serviceItemsResponse.ok) {
        const serviceItemsData = await serviceItemsResponse.json()
        const normalizedServices = Array.isArray(serviceItemsData)
          ? serviceItemsData.map((item, index) => ({
              id: typeof item?.id === 'string' ? item.id : `service-${index}`,
              title: typeof item?.title === 'string' ? item.title : '',
              description: typeof item?.description === 'string' ? item.description : '',
              icon: typeof item?.icon === 'string' ? item.icon : 'Wrench',
              link: typeof item?.link === 'string' ? item.link : '',
              order: typeof item?.order === 'number' ? item.order : index,
              isActive: Boolean(item?.isActive)
            }))
          : []
        setServiceItems(normalizedServices.sort((a, b) => a.order - b.order))
      }

      // Fetch company features from API
      const featuresResponse = await fetch('/api/about/features', { cache: 'no-store' })
      if (featuresResponse.ok) {
        const featuresData = await featuresResponse.json()
        const normalizedFeatures = Array.isArray(featuresData)
          ? featuresData.map((feature, index) => ({
              ...feature,
              id: typeof feature?.id === 'string' ? feature.id : `feature-${index}`,
              features: Array.isArray(feature?.features)
                ? feature.features.filter((item: unknown): item is string => typeof item === 'string')
                : []
            }))
          : []
        setCompanyFeatures(normalizedFeatures.sort((a, b) => a.order - b.order))
      }

      // Fetch homepage settings
      const settingsResponse = await fetch('/api/admin/homepage/settings', {
        cache: 'no-store',
        credentials: 'include'
      })
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setSettings({
          showHeroSlider: Boolean(settingsData?.showHeroSlider),
          autoPlaySlider: Boolean(settingsData?.autoPlaySlider),
          sliderInterval: typeof settingsData?.sliderInterval === 'number' ? settingsData.sliderInterval : 5000,
          showFeaturedVehicles: Boolean(settingsData?.showFeaturedVehicles),
          featuredVehiclesCount: typeof settingsData?.featuredVehiclesCount === 'number' ? settingsData.featuredVehiclesCount : 6,
          showServices: Boolean(settingsData?.showServices),
          showCompanyInfo: Boolean(settingsData?.showCompanyInfo),
          servicesTitle: typeof settingsData?.servicesTitle === 'string' ? settingsData.servicesTitle : 'خدماتنا المتكاملة',
          servicesSubtitle: typeof settingsData?.servicesSubtitle === 'string'
            ? settingsData.servicesSubtitle
            : 'نقدم مجموعة شاملة من الخدمات لضمان أفضل تجربة لعملائنا',
          servicesDescription: typeof settingsData?.servicesDescription === 'string'
            ? settingsData.servicesDescription
            : 'اكتشف حلولنا المتكاملة في البيع، الصيانة، التمويل، وقطع الغيار مع فريق دعم متخصص.',
          servicesCtaText: typeof settingsData?.servicesCtaText === 'string' ? settingsData.servicesCtaText : 'احجز الآن',
          facebookPageUrl: typeof settingsData?.facebookPageUrl === 'string'
            ? settingsData.facebookPageUrl
            : 'https://www.facebook.com/elhamdimport',
          facebookVideoUrl: typeof settingsData?.facebookVideoUrl === 'string'
            ? settingsData.facebookVideoUrl
            : 'https://www.facebook.com/elhamdimport/videos',
          theme: settingsData?.theme === 'dark' || settingsData?.theme === 'DARK'
            ? 'dark'
            : settingsData?.theme === 'auto' || settingsData?.theme === 'AUTO'
              ? 'auto'
              : 'light'
        })
      }
    } catch (error) {
      console.error('Error loading homepage data:', error)
      // Set empty arrays on error
      setSliderItems([])
      setCompanyInfo(defaultCompanyInfo)
      setServiceItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddSlider = () => {
    setSliderForm({
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      ctaText: '',
      ctaLink: '',
      badge: '',
      badgeColor: 'bg-blue-500',
      contentPosition: 'top-right',
      contentSize: 'lg',
      contentColor: '#ffffff',
      contentShadow: true,
      contentStrokeColor: '#000000',
      contentStrokeWidth: 0,
      order: sliderItems.length,
      isActive: true
    })
    setEditingSlider(null)
    setShowSliderDialog(true)
  }

  const handleOpenCompanyDialog = () => {
    const base = companyInfo
      ? {
          ...companyInfo,
          features: [...(companyInfo.features || [])],
          ctaButtons: companyInfo.ctaButtons?.map((button) => ({ ...button })) || []
        }
      : { ...defaultCompanyInfo }

    setCompanyForm(base)
    setShowCompanyDialog(true)
  }

  const handleAddCompanyFeature = () => {
    if (!companyForm) return
    setCompanyForm({
      ...companyForm,
      features: [...(companyForm.features || []), 'ميزة جديدة']
    })
  }

  const handleRemoveCompanyFeature = (index: number) => {
    if (!companyForm) return
    setCompanyForm({
      ...companyForm,
      features: companyForm.features.filter((_, featureIndex) => featureIndex !== index)
    })
  }

  const handleUpdateCompanyFeature = (index: number, value: string) => {
    if (!companyForm) return
    const nextFeatures = [...(companyForm.features || [])]
    nextFeatures[index] = value
    setCompanyForm({
      ...companyForm,
      features: nextFeatures
    })
  }

  const handleAddCompanyButton = () => {
    if (!companyForm) return
    setCompanyForm({
      ...companyForm,
      ctaButtons: [
        ...(companyForm.ctaButtons || []),
        { text: 'زر جديد', link: '/', variant: 'primary' as const }
      ]
    })
  }

  const handleUpdateCompanyButton = (index: number, key: 'text' | 'link' | 'variant', value: string) => {
    if (!companyForm) return
    const nextButtons = (companyForm.ctaButtons || []).map((button, buttonIndex) =>
      buttonIndex === index
        ? {
            ...button,
            [key]: key === 'variant' && value === 'secondary' ? 'secondary' : key === 'variant' ? 'primary' : value
          }
        : button
    )
    setCompanyForm({ ...companyForm, ctaButtons: nextButtons })
  }

  const handleRemoveCompanyButton = (index: number) => {
    if (!companyForm) return
    setCompanyForm({
      ...companyForm,
      ctaButtons: (companyForm.ctaButtons || []).filter((_, buttonIndex) => buttonIndex !== index)
    })
  }

  const handleEditSlider = (item: SliderItem) => {
    setSliderForm({
      ...item,
      contentPosition: normalizeContentPosition(item.contentPosition),
      contentSize: item.contentSize || 'lg',
      contentColor: item.contentColor || '#ffffff',
      contentShadow: item.contentShadow !== false,
      contentStrokeColor: item.contentStrokeColor || '#000000',
      contentStrokeWidth: typeof item.contentStrokeWidth === 'number' ? item.contentStrokeWidth : 0
    })
    setEditingSlider(item)
    setShowSliderDialog(true)
  }

  const handleAddService = () => {
    setServiceForm({
      id: `temp-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      title: '',
      description: '',
      icon: 'Wrench',
      link: '',
      order: serviceItems.length,
      isActive: true
    })
    setEditingService(null)
    setShowServiceDialog(true)
  }

  const handleEditServiceItem = (service: ServiceItem) => {
    setServiceForm({ ...service })
    setEditingService(service)
    setShowServiceDialog(true)
  }

  const handleSaveServiceForm = () => {
    if (!serviceForm.title || !serviceForm.title.trim()) {
      toast.error('يرجى إدخال عنوان الخدمة')
      return
    }

    const sanitizedItem: ServiceItem = {
      id: (editingService?.id || serviceForm.id || `temp-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`) as string,
      title: serviceForm.title?.trim() || '',
      description: serviceForm.description?.trim() || '',
      icon: serviceForm.icon || 'Wrench',
      link: serviceForm.link || '',
      order: typeof serviceForm.order === 'number' ? serviceForm.order : serviceItems.length,
      isActive: serviceForm.isActive ?? true
    }

    const nextItems = editingService
      ? serviceItems.map((item) => (item.id === editingService.id ? sanitizedItem : item))
      : [...serviceItems, sanitizedItem]

    setServiceItems(nextItems.map((item, index) => ({ ...item, order: index })))
    setShowServiceDialog(false)
    setEditingService(null)
    setServiceForm({})
  }

  const handleDeleteServiceItem = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return
    const nextItems = serviceItems.filter((item) => item.id !== id).map((item, index) => ({ ...item, order: index }))
    setServiceItems(nextItems)
  }

  const moveServiceItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = serviceItems.findIndex((item) => item.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= serviceItems.length) return

    const updatedItems = [...serviceItems]
    const [movedItem] = updatedItems.splice(currentIndex, 1)
    updatedItems.splice(newIndex, 0, movedItem)

    setServiceItems(updatedItems.map((item, index) => ({ ...item, order: index })))
  }

  const handleSaveSlider = async () => {
    try {
      const payload = {
        ...sliderForm,
        contentPosition: normalizeContentPosition(sliderForm.contentPosition),
        contentSize: sliderForm.contentSize || 'lg',
        contentColor: sliderForm.contentColor || '#ffffff',
        contentShadow: sliderForm.contentShadow !== false,
        contentStrokeColor: sliderForm.contentStrokeColor || '#000000',
        contentStrokeWidth:
          typeof sliderForm.contentStrokeWidth === 'number'
            ? sliderForm.contentStrokeWidth
            : Number(sliderForm.contentStrokeWidth) || 0
      }

      const response = await fetch(editingSlider ? `/api/sliders/${editingSlider.id}` : '/api/sliders', {
        method: editingSlider ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حفظ السلايدر')
      }

      const data = await response.json()
      
      // Refresh the sliders list
      await loadHomepageData()
      
      setShowSliderDialog(false)
      setSliderForm({})
      setEditingSlider(null)
    } catch (error) {
      console.error('Error saving slider:', error)
      alert(error instanceof Error ? error.message : 'فشل في حفظ السلايدر')
    }
  }

  const handleDeleteSlider = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      try {
        const response = await fetch(`/api/sliders/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'فشل في حذف السلايدر')
        }

        // Refresh the sliders list
        await loadHomepageData()
      } catch (error) {
        console.error('Error deleting slider:', error)
        alert(error instanceof Error ? error.message : 'فشل في حذف السلايدر')
      }
    }
  }

  const moveSliderItem = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = sliderItems.findIndex(item => item.id === id)
      if (currentIndex === -1) return

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= sliderItems.length) return

      // Create new order array
      const newOrder = [...sliderItems]
      // Swap items
      [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]]
      
      // Get the IDs in the new order
      const sliderIds = newOrder.map(item => item.id)

      // Call reorder API
      const response = await fetch('/api/sliders/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sliderIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إعادة ترتيب السلايدرات')
      }

      // Refresh the sliders list
      await loadHomepageData()
    } catch (error) {
      console.error('Error moving slider item:', error)
      alert(error instanceof Error ? error.message : 'فشل في إعادة ترتيب السلايدرات')
    }
  }

  const handleSaveCompany = async () => {
    if (!companyForm) {
      toast.error('لا توجد بيانات لحفظها')
      return
    }

    const payload = {
      title: companyForm.title?.trim() || '',
      subtitle: companyForm.subtitle?.trim() || '',
      description: companyForm.description?.trim() || '',
      imageUrl: companyForm.imageUrl?.trim() || '',
      features: (companyForm.features || []).map((feature) => feature.trim()).filter(Boolean),
      ctaButtons: (companyForm.ctaButtons || [])
        .filter((button) => button.text.trim())
        .map((button) => ({
          text: button.text.trim(),
          link: button.link?.trim() || '/',
          variant: button.variant === 'secondary' ? 'secondary' : 'primary'
        }))
    }

    try {
      const response = await fetch('/api/company-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حفظ معلومات الشركة')
      }

      const data = await response.json()
      setCompanyInfo(adaptCompanyInfo(data))
      setShowCompanyDialog(false)
      setCompanyForm(null)
      toast.success('تم حفظ معلومات الشركة بنجاح')
    } catch (error) {
      console.error('Error saving company info:', error)
      alert(error instanceof Error ? error.message : 'فشل في حفظ معلومات الشركة')
    }
  }

  const handleSaveService = async () => {
    try {
      const payload = serviceItems
        .map((item, index) => ({
          title: item.title?.trim() || '',
          description: item.description?.trim() || '',
          icon: item.icon || 'Wrench',
          link: item.link || '',
          order: index,
          isActive: item.isActive ?? true
        }))
        .filter((item) => item.title)

      const response = await fetch('/api/service-items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حفظ الخدمات')
      }

      const data = await response.json()
      setServiceItems(
        (Array.isArray(data) ? data : []).map((item, index) => ({
          id: typeof item?.id === 'string' ? item.id : `service-${index}`,
          title: typeof item?.title === 'string' ? item.title : '',
          description: typeof item?.description === 'string' ? item.description : '',
          icon: typeof item?.icon === 'string' ? item.icon : 'Wrench',
          link: typeof item?.link === 'string' ? item.link : '',
          order: typeof item?.order === 'number' ? item.order : index,
          isActive: Boolean(item?.isActive)
        })).sort((a, b) => a.order - b.order)
      )
      setShowServiceDialog(false)
      setServiceForm({})
      setEditingService(null)
      toast.success('تم حفظ الخدمات بنجاح')
    } catch (error) {
      console.error('Error saving service items:', error)
      alert(error instanceof Error ? error.message : 'فشل في حفظ الخدمات')
    }
  }

  const handleSaveFeatures = async () => {
    try {
      const response = await fetch('/api/about/features', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyFeatures),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حفظ المميزات')
      }

      const data = await response.json()
      setShowFeaturesDialog(false)
      toast.success('تم حفظ المميزات بنجاح')
    } catch (error) {
      console.error('Error saving company features:', error)
      alert(error instanceof Error ? error.message : 'فشل في حفظ المميزات')
    }
  }

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/admin/homepage/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...settings,
          theme: settings.theme.toUpperCase()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حفظ الإعدادات')
      }

      const data = await response.json()
      setSettings({
        showHeroSlider: Boolean(data?.showHeroSlider),
        autoPlaySlider: Boolean(data?.autoPlaySlider),
        sliderInterval: typeof data?.sliderInterval === 'number' ? data.sliderInterval : settings.sliderInterval,
        showFeaturedVehicles: Boolean(data?.showFeaturedVehicles),
        featuredVehiclesCount: typeof data?.featuredVehiclesCount === 'number' ? data.featuredVehiclesCount : settings.featuredVehiclesCount,
        showServices: Boolean(data?.showServices),
        showCompanyInfo: Boolean(data?.showCompanyInfo),
        servicesTitle: typeof data?.servicesTitle === 'string' ? data.servicesTitle : settings.servicesTitle,
        servicesSubtitle: typeof data?.servicesSubtitle === 'string' ? data.servicesSubtitle : settings.servicesSubtitle,
        servicesDescription: typeof data?.servicesDescription === 'string' ? data.servicesDescription : settings.servicesDescription,
        servicesCtaText: typeof data?.servicesCtaText === 'string' ? data.servicesCtaText : settings.servicesCtaText,
        facebookPageUrl: typeof data?.facebookPageUrl === 'string' ? data.facebookPageUrl : settings.facebookPageUrl,
        facebookVideoUrl: typeof data?.facebookVideoUrl === 'string' ? data.facebookVideoUrl : settings.facebookVideoUrl,
        theme: data?.theme === 'DARK' ? 'dark' : data?.theme === 'AUTO' ? 'auto' : 'light'
      })
      setShowSettingsDialog(false)
      toast.success('تم حفظ الإعدادات بنجاح')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في حفظ الإعدادات')
    }
  }

  const badgeColors = [
    { value: 'bg-blue-500', label: 'أزرق' },
    { value: 'bg-green-500', label: 'أخضر' },
    { value: 'bg-red-500', label: 'أحمر' },
    { value: 'bg-blue-600', label: 'أزرق' },
    { value: 'bg-purple-500', label: 'بنفسجي' }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الصفحة الرئيسية</h1>
        <p className="text-gray-600">تحكم في جميع عناصر الصفحة الرئيسية والمحتوى الظاهر للزوار</p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => setShowSettingsDialog(true)}>
            <Settings className="ml-2 h-4 w-4" />
            الإعدادات العامة
          </Button>
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="ml-2 h-4 w-4" />
            معاينة الصفحة
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="slider">السلايدر الرئيسي</TabsTrigger>
          <TabsTrigger value="company">معلومات الشركة</TabsTrigger>
          <TabsTrigger value="services">الخدمات</TabsTrigger>
          <TabsTrigger value="features">مميزاتنا</TabsTrigger>
          <TabsTrigger value="content">المحتوى</TabsTrigger>
        </TabsList>

        {/* Slider Management */}
        <TabsContent value="slider" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>إدارة السلايدر الرئيسي</CardTitle>
                  <CardDescription>
                    تحكم في الشرائح الظاهرة في أعلى الصفحة الرئيسية
                  </CardDescription>
                </div>
                <Button onClick={handleAddSlider}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة شريحة جديدة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sliderItems.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge variant={item.isActive ? 'default' : 'secondary'}>
                            {item.isActive ? 'نشط' : 'معطل'}
                          </Badge>
                          {item.badge && (
                            <Badge className={item.badgeColor}>
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{item.subtitle}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>الترتيب: {item.order + 1}</span>
                          <span>الرابط: {item.ctaLink}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSliderItem(item.id, 'up')}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSliderItem(item.id, 'down')}
                            disabled={index === sliderItems.length - 1}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSlider(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSlider(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Info */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>معلومات الشركة</CardTitle>
                  <CardDescription>
                    تحكم في معلومات الشركة ونبذة تعريفية
                  </CardDescription>
                </div>
                <Button onClick={handleOpenCompanyDialog}>
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل المعلومات
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {companyInfo && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{companyInfo.title}</h3>
                    <p className="text-blue-600 font-medium">{companyInfo.subtitle}</p>
                    <p className="text-gray-600 mt-2">{companyInfo.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">المميزات:</h4>
                    <ul className="space-y-1">
                      {companyInfo.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600">• {feature}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">أزرار الحركة:</h4>
                    <div className="flex gap-2">
                      {companyInfo.ctaButtons.map((button, index) => (
                        <Badge key={index} variant={button.variant === 'primary' ? 'default' : 'secondary'}>
                          {button.text}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>إعدادات قسم الخدمات</CardTitle>
                  <CardDescription>
                    تحكم في النصوص والرابط الخاص بقسم "خدماتنا المتكاملة" على الواجهة الرئيسية وجميع الصفحات المرتبطة به
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={handleSaveSettings}>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="servicesTitle">عنوان القسم</Label>
                  <Input
                    id="servicesTitle"
                    value={settings.servicesTitle}
                    onChange={(e) => setSettings({ ...settings, servicesTitle: e.target.value })}
                    placeholder="خدماتنا المتكاملة"
                  />
                </div>
                <div>
                  <Label htmlFor="servicesSubtitle">وصف مختصر</Label>
                  <Input
                    id="servicesSubtitle"
                    value={settings.servicesSubtitle}
                    onChange={(e) => setSettings({ ...settings, servicesSubtitle: e.target.value })}
                    placeholder="نقدم مجموعة شاملة من الخدمات"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="servicesDescription">تفاصيل إضافية</Label>
                <Textarea
                  id="servicesDescription"
                  value={settings.servicesDescription}
                  onChange={(e) => setSettings({ ...settings, servicesDescription: e.target.value })}
                  placeholder="أضف نصاً تفصيلياً يظهر أسفل العنوان"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="servicesCtaText">نص زر الدعوة لاتخاذ إجراء</Label>
                  <Input
                    id="servicesCtaText"
                    value={settings.servicesCtaText}
                    onChange={(e) => setSettings({ ...settings, servicesCtaText: e.target.value })}
                    placeholder="احجز الآن"
                  />
                </div>
                <div>
                  <Label htmlFor="facebookPageUrl">رابط صفحة فيسبوك لعرض الـ Feed</Label>
                  <Input
                    id="facebookPageUrl"
                    value={settings.facebookPageUrl}
                    onChange={(e) => setSettings({ ...settings, facebookPageUrl: e.target.value })}
                    placeholder="https://www.facebook.com/yourpage"
                  />
                </div>
                <div>
                  <Label htmlFor="facebookVideoUrl">رابط فيديو أو قائمة تشغيل فيسبوك</Label>
                  <Input
                    id="facebookVideoUrl"
                    value={settings.facebookVideoUrl}
                    onChange={(e) => setSettings({ ...settings, facebookVideoUrl: e.target.value })}
                    placeholder="https://www.facebook.com/yourpage/videos/123456789"
                  />
                  <p className="text-xs text-gray-500 mt-1">استخدم رابط فيديو مباشر أو قائمة تشغيل لضمان ظهور الفيديوهات.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>إدارة الخدمات</CardTitle>
                  <CardDescription>
                    تحكم في الخدمات المعروضة في الصفحة الرئيسية
                  </CardDescription>
                </div>
                <Button onClick={handleAddService}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة خدمة جديدة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceItems.map((service, index) => (
                  <Card key={service.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{service.title || 'بدون عنوان'}</h3>
                          <Badge variant={service.isActive ? 'default' : 'secondary'}>
                            {service.isActive ? 'نشط' : 'معطل'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">الأيقونة: {service.icon || 'Wrench'}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveServiceItem(service.id, 'up')}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveServiceItem(service.id, 'down')}
                          disabled={index === serviceItems.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{service.description || 'لا يوجد وصف محدد'}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>الترتيب: {service.order + 1}</span>
                      <span>الرابط: {service.link || '—'}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditServiceItem(service)}>
                        <Edit className="ml-1 h-4 w-4" />
                        تعديل
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteServiceItem(service.id)}>
                        <Trash2 className="ml-1 h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </Card>
                ))}
                {serviceItems.length === 0 && (
                  <Card className="p-6 text-center text-gray-500">
                    لم يتم إضافة خدمات بعد. استخدم زر "إضافة خدمة جديدة" للبدء.
                  </Card>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveService}>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ جميع الخدمات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Management */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>مميزات الشركة</CardTitle>
                  <CardDescription>
                    تحكم في قسم "لماذا تختار الحمد للسيارات"
                  </CardDescription>
                </div>
                <Button onClick={() => setShowFeaturesDialog(true)}>
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل المميزات
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {companyFeatures.map((feature) => (
                  <Card key={feature.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <Badge variant={feature.isActive ? 'default' : 'secondary'}>
                        {feature.isActive ? 'نشط' : 'معطل'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                    <div className="text-xs text-gray-500 mb-2">
                      اللون: {feature.color} • الأيقونة: {feature.icon}
                    </div>
                    <div className="text-xs text-gray-500">
                      الترتيب: {feature.order + 1}
                    </div>
                    {feature.features && feature.features.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">المميزات:</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {feature.features.map((feat, index) => (
                            <li key={index}>• {feat}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Management */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إدارة المحتوى العام</CardTitle>
              <CardDescription>
                تحكم في النصوص والعناوين والألوان العامة للصفحة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <LayoutTemplate className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">قريباً</h3>
                <p className="text-gray-600">
                  نظام إدارة المحتوى العام قيد التطوير
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Company Dialog */}
      <Dialog
        open={showCompanyDialog}
        onOpenChange={(open) => {
          setShowCompanyDialog(open)
          if (!open) {
            setCompanyForm(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل معلومات الشركة</DialogTitle>
            <DialogDescription>
              حدث البيانات التعريفية، الصورة والأزرار الظاهرة في قسم "من نحن"
            </DialogDescription>
          </DialogHeader>

          {companyForm ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-title">العنوان *</Label>
                  <Input
                    id="company-title"
                    value={companyForm.title}
                    onChange={(e) => setCompanyForm({ ...companyForm, title: e.target.value })}
                    placeholder="أدخل عنوان الشركة"
                  />
                </div>
                <div>
                  <Label htmlFor="company-subtitle">العنوان الفرعي *</Label>
                  <Input
                    id="company-subtitle"
                    value={companyForm.subtitle}
                    onChange={(e) => setCompanyForm({ ...companyForm, subtitle: e.target.value })}
                    placeholder="أدخل العنوان الفرعي"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company-description">الوصف *</Label>
                <Textarea
                  id="company-description"
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  rows={4}
                  placeholder="اشرح نشاط الشركة والخدمات المقدمة"
                />
              </div>

              <div>
                <Label htmlFor="company-image">رابط الصورة الرئيسية</Label>
                <Input
                  id="company-image"
                  value={companyForm.imageUrl}
                  onChange={(e) => setCompanyForm({ ...companyForm, imageUrl: e.target.value })}
                  placeholder="/uploads/company.jpg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>المميزات التفصيلية</Label>
                  <Button variant="outline" size="sm" onClick={handleAddCompanyFeature}>
                    <Plus className="ml-1 h-4 w-4" />
                    إضافة ميزة
                  </Button>
                </div>
                <div className="space-y-2">
                  {(companyForm.features || []).map((feature, index) => (
                    <div key={`feature-${index}`} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleUpdateCompanyFeature(index, e.target.value)}
                        placeholder={`الميزة رقم ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCompanyFeature(index)}
                        aria-label="حذف الميزة"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {(!companyForm.features || companyForm.features.length === 0) && (
                    <p className="text-xs text-gray-500">لم يتم إضافة أي مميزات بعد.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>أزرار الدعوة للعمل</Label>
                  <Button variant="outline" size="sm" onClick={handleAddCompanyButton}>
                    <Plus className="ml-1 h-4 w-4" />
                    إضافة زر
                  </Button>
                </div>
                <div className="space-y-3">
                  {(companyForm.ctaButtons || []).map((button, index) => (
                    <div key={`cta-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_140px_auto] gap-2">
                      <Input
                        value={button.text}
                        onChange={(e) => handleUpdateCompanyButton(index, 'text', e.target.value)}
                        placeholder="نص الزر"
                      />
                      <Input
                        value={button.link}
                        onChange={(e) => handleUpdateCompanyButton(index, 'link', e.target.value)}
                        placeholder="/الرابط"
                      />
                      <Select
                        value={button.variant === 'secondary' ? 'secondary' : 'primary'}
                        onValueChange={(value) => handleUpdateCompanyButton(index, 'variant', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="نوع الزر" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">رئيسي</SelectItem>
                          <SelectItem value="secondary">ثانوي</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCompanyButton(index)}
                        aria-label="حذف الزر"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {(!companyForm.ctaButtons || companyForm.ctaButtons.length === 0) && (
                    <p className="text-xs text-gray-500">لم يتم إضافة أزرار بعد.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">جارٍ تحميل بيانات الشركة...</p>
          )}

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCompanyDialog(false)
                setCompanyForm(null)
              }}
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveCompany}>
              <Save className="ml-2 h-4 w-4" />
              حفظ المعلومات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Dialog */}
      <Dialog
        open={showServiceDialog}
        onOpenChange={(open) => {
          setShowServiceDialog(open)
          if (!open) {
            setServiceForm({})
            setEditingService(null)
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingService ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}</DialogTitle>
            <DialogDescription>
              قم بتعبئة تفاصيل الخدمة التي ستظهر في الصفحة الرئيسية
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="service-title">عنوان الخدمة *</Label>
              <Input
                id="service-title"
                value={serviceForm.title || ''}
                onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                placeholder="مثال: صيانة معتمدة"
              />
            </div>

            <div>
              <Label htmlFor="service-description">وصف مختصر</Label>
              <Textarea
                id="service-description"
                value={serviceForm.description || ''}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                rows={3}
                placeholder="صف الخدمة في جملتين"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-icon">الأيقونة</Label>
                <Input
                  id="service-icon"
                  value={serviceForm.icon || ''}
                  onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                  placeholder="مثال: Wrench"
                />
              </div>
              <div>
                <Label htmlFor="service-link">الرابط</Label>
                <Input
                  id="service-link"
                  value={serviceForm.link || ''}
                  onChange={(e) => setServiceForm({ ...serviceForm, link: e.target.value })}
                  placeholder="/service-link"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="service-active"
                checked={serviceForm.isActive ?? true}
                onCheckedChange={(checked) => setServiceForm({ ...serviceForm, isActive: checked })}
              />
              <Label htmlFor="service-active">الخدمة نشطة</Label>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowServiceDialog(false)
                setServiceForm({})
                setEditingService(null)
              }}
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveServiceForm}>
              <Save className="ml-2 h-4 w-4" />
              حفظ الخدمة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slider Dialog */}
      <Dialog open={showSliderDialog} onOpenChange={setShowSliderDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSlider ? 'تعديل شريحة' : 'إضافة شريحة جديدة'}
            </DialogTitle>
            <DialogDescription>
              أدخل بيانات الشريحة الجديدة
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">العنوان الرئيسي *</Label>
              <Input
                id="title"
                value={sliderForm.title || ''}
                onChange={(e) => setSliderForm({...sliderForm, title: e.target.value})}
                placeholder="أدخل العنوان الرئيسي"
              />
            </div>
            
            <div>
              <Label htmlFor="subtitle">العنوان الفرعي *</Label>
              <Input
                id="subtitle"
                value={sliderForm.subtitle || ''}
                onChange={(e) => setSliderForm({...sliderForm, subtitle: e.target.value})}
                placeholder="أدخل العنوان الفرعي"
              />
            </div>
            
            <div>
              <Label htmlFor="description">الوصف *</Label>
              <Textarea
                id="description"
                value={sliderForm.description || ''}
                onChange={(e) => setSliderForm({...sliderForm, description: e.target.value})}
                placeholder="أدخل الوصف"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="ctaText">نص الزر *</Label>
              <Input
                id="ctaText"
                value={sliderForm.ctaText || ''}
                onChange={(e) => setSliderForm({...sliderForm, ctaText: e.target.value})}
                placeholder="نص الزر"
              />
            </div>
            
            <div>
              <Label htmlFor="ctaLink">رابط الزر *</Label>
              <Input
                id="ctaLink"
                value={sliderForm.ctaLink || ''}
                onChange={(e) => setSliderForm({...sliderForm, ctaLink: e.target.value})}
                placeholder="/example-link"
              />
            </div>

            <div>
              <Label htmlFor="contentPosition">موضع المحتوى</Label>
              <Select
                value={normalizeContentPosition(sliderForm.contentPosition)}
                onValueChange={(value) =>
                  setSliderForm({ ...sliderForm, contentPosition: value as SliderItem['contentPosition'] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر موضع المحتوى" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-right">أعلى اليمين</SelectItem>
                <SelectItem value="middle-right">منتصف اليمين</SelectItem>
                <SelectItem value="bottom-right">أسفل اليمين</SelectItem>
                <SelectItem value="top-center">أعلى الوسط</SelectItem>
                <SelectItem value="middle-center">منتصف الوسط</SelectItem>
                <SelectItem value="bottom-center">أسفل الوسط</SelectItem>
                <SelectItem value="top-left">أعلى اليسار</SelectItem>
                <SelectItem value="middle-left">منتصف اليسار</SelectItem>
                <SelectItem value="bottom-left">أسفل اليسار</SelectItem>
              </SelectContent>
            </Select>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contentSize">حجم المحتوى</Label>
                <Select
                  value={sliderForm.contentSize || 'lg'}
                  onValueChange={(value) =>
                    setSliderForm({ ...sliderForm, contentSize: value as SliderItem['contentSize'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حجم النص" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">صغير</SelectItem>
                    <SelectItem value="md">متوسط</SelectItem>
                    <SelectItem value="lg">كبير</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contentColor">لون المحتوى</Label>
                <Input
                  id="contentColor"
                  type="color"
                  value={sliderForm.contentColor || '#ffffff'}
                  onChange={(e) => setSliderForm({ ...sliderForm, contentColor: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">إظهار ظل للنص</p>
                  <p className="text-xs text-muted-foreground">يساعد في وضوح المحتوى على الصور المضيئة</p>
                </div>
                <Switch
                  id="contentShadow"
                  checked={sliderForm.contentShadow !== false}
                  onCheckedChange={(checked) => setSliderForm({ ...sliderForm, contentShadow: checked })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="contentStrokeColor">لون الحدود</Label>
                  <Input
                    id="contentStrokeColor"
                    type="color"
                    value={sliderForm.contentStrokeColor || '#000000'}
                    onChange={(e) => setSliderForm({ ...sliderForm, contentStrokeColor: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contentStrokeWidth">سُمك الحدود (بالبكسل)</Label>
                  <Input
                    id="contentStrokeWidth"
                    type="number"
                    min={0}
                    max={8}
                    step={1}
                    value={sliderForm.contentStrokeWidth ?? 0}
                    onChange={(e) =>
                      setSliderForm({ ...sliderForm, contentStrokeWidth: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="badge">الشارة (اختياري)</Label>
                <Input
                  id="badge"
                  value={sliderForm.badge || ''}
                  onChange={(e) => setSliderForm({...sliderForm, badge: e.target.value})}
                  placeholder="جديد"
                />
              </div>
              
              <div>
                <Label htmlFor="badgeColor">لون الشارة</Label>
                <Select value={sliderForm.badgeColor || 'bg-blue-500'} onValueChange={(value) => setSliderForm({...sliderForm, badgeColor: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {badgeColors.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <SliderImageManager
              currentImage={sliderForm.imageUrl || ''}
              onImageChange={(imageUrl) => setSliderForm({...sliderForm, imageUrl})}
            />
            
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={sliderForm.isActive || false}
                onCheckedChange={(checked) => setSliderForm({...sliderForm, isActive: checked})}
              />
              <Label htmlFor="isActive">نشط</Label>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowSliderDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveSlider}>
              <Save className="ml-2 h-4 w-4" />
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إعدادات الصفحة الرئيسية</DialogTitle>
            <DialogDescription>
              تحكم في الإعدادات العامة للصفحة الرئيسية
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                id="showHeroSlider"
                checked={settings.showHeroSlider}
                onCheckedChange={(checked) => setSettings({...settings, showHeroSlider: checked})}
              />
              <Label htmlFor="showHeroSlider">إظهار السلايدر الرئيسي</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="autoPlaySlider"
                checked={settings.autoPlaySlider}
                onCheckedChange={(checked) => setSettings({...settings, autoPlaySlider: checked})}
              />
              <Label htmlFor="autoPlaySlider">تشغيل تلقائي للسلايدر</Label>
            </div>
            
            <div>
              <Label htmlFor="sliderInterval">الفترة الزمنية للسلايدر (ثانية)</Label>
              <Input
                id="sliderInterval"
                type="number"
                value={settings.sliderInterval / 1000}
                onChange={(e) => setSettings({...settings, sliderInterval: parseInt(e.target.value) * 1000})}
                min="1"
                max="60"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="showFeaturedVehicles"
                checked={settings.showFeaturedVehicles}
                onCheckedChange={(checked) => setSettings({...settings, showFeaturedVehicles: checked})}
              />
              <Label htmlFor="showFeaturedVehicles">إظهار السيارات المميزة</Label>
            </div>
            
            <div>
              <Label htmlFor="featuredVehiclesCount">عدد السيارات المميزة</Label>
              <Input
                id="featuredVehiclesCount"
                type="number"
                value={settings.featuredVehiclesCount}
                onChange={(e) => setSettings({...settings, featuredVehiclesCount: parseInt(e.target.value)})}
                min="1"
                max="12"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="showServices"
                checked={settings.showServices}
                onCheckedChange={(checked) => setSettings({...settings, showServices: checked})}
              />
              <Label htmlFor="showServices">إظهار الخدمات</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="showCompanyInfo"
                checked={settings.showCompanyInfo}
                onCheckedChange={(checked) => setSettings({...settings, showCompanyInfo: checked})}
              />
              <Label htmlFor="showCompanyInfo">إظهار معلومات الشركة</Label>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="ml-2 h-4 w-4" />
              حفظ الإعدادات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Features Dialog */}
      <Dialog open={showFeaturesDialog} onOpenChange={setShowFeaturesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل مميزات الشركة</DialogTitle>
            <DialogDescription>
              تحكم في قسم "لماذا تختار الحمد للسيارات"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {companyFeatures.map((feature, index) => (
              <Card key={feature.id} className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`title-${feature.id}`}>العنوان *</Label>
                      <Input
                        id={`title-${feature.id}`}
                        value={feature.title}
                        onChange={(e) => {
                          const newFeatures = [...companyFeatures]
                          newFeatures[index].title = e.target.value
                          setCompanyFeatures(newFeatures)
                        }}
                        placeholder="أدخل العنوان"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`icon-${feature.id}`}>الأيقونة *</Label>
                      <Select
                        value={feature.icon}
                        onValueChange={(value) => {
                          const newFeatures = [...companyFeatures]
                          newFeatures[index].icon = value
                          setCompanyFeatures(newFeatures)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الأيقونة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Car">سيارة</SelectItem>
                          <SelectItem value="Wrench">مفتاح ربط</SelectItem>
                          <SelectItem value="Star">نجمة</SelectItem>
                          <SelectItem value="Calendar">تقويم</SelectItem>
                          <SelectItem value="Users">مستخدمون</SelectItem>
                          <SelectItem value="Shield">درع</SelectItem>
                          <SelectItem value="Heart">قلب</SelectItem>
                          <SelectItem value="Lightbulb">لمبة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`color-${feature.id}`}>اللون *</Label>
                      <Select
                        value={feature.color}
                        onValueChange={(value) => {
                          const newFeatures = [...companyFeatures]
                          newFeatures[index].color = value
                          setCompanyFeatures(newFeatures)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر اللون" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">أزرق</SelectItem>
                          <SelectItem value="orange">برتقالي</SelectItem>
                          <SelectItem value="green">أخضر</SelectItem>
                          <SelectItem value="red">أحمر</SelectItem>
                          <SelectItem value="purple">بنفسجي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`order-${feature.id}`}>الترتيب</Label>
                      <Input
                        id={`order-${feature.id}`}
                        type="number"
                        value={feature.order}
                        onChange={(e) => {
                          const newFeatures = [...companyFeatures]
                          newFeatures[index].order = parseInt(e.target.value)
                          setCompanyFeatures(newFeatures)
                        }}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`description-${feature.id}`}>الوصف *</Label>
                    <Textarea
                      id={`description-${feature.id}`}
                      value={feature.description}
                      onChange={(e) => {
                        const newFeatures = [...companyFeatures]
                        newFeatures[index].description = e.target.value
                        setCompanyFeatures(newFeatures)
                      }}
                      placeholder="أدخل الوصف"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`features-${feature.id}`}>المميزات التفصيلية</Label>
                    <Textarea
                      id={`features-${feature.id}`}
                      value={feature.features ? feature.features.join('\n') : ''}
                      onChange={(e) => {
                        const newFeatures = [...companyFeatures]
                        newFeatures[index].features = e.target.value.split('\n').filter(f => f.trim())
                        setCompanyFeatures(newFeatures)
                      }}
                      placeholder="أدخل المميزات التفصيلية (سطر لكل ميزة)"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">أدخل كل ميزة في سطر منفصل</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`active-${feature.id}`}
                      checked={feature.isActive}
                      onCheckedChange={(checked) => {
                        const newFeatures = [...companyFeatures]
                        newFeatures[index].isActive = checked
                        setCompanyFeatures(newFeatures)
                      }}
                    />
                    <Label htmlFor={`active-${feature.id}`}>نشط</Label>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowFeaturesDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveFeatures}>
              <Save className="ml-2 h-4 w-4" />
              حفظ المميزات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}