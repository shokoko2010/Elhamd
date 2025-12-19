'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Car,
  Calendar,
  Phone,
  Fuel,
  Settings,
  Gauge,
  Shield,
  Heart,
  Share2,
  MapPin,
  DollarSign,
  Wrench,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { VEHICLE_SPEC_TEMPLATE } from '@/lib/vehicle-specs'
import { cn } from '@/lib/utils'

interface VehicleImage {
  id: string
  imageUrl: string
  altText?: string | null
  isPrimary: boolean
  order?: number | null
}

interface VehicleSpecification {
  id: string
  key: string
  label: string
  value: string
  category: string
}

interface VehiclePricing {
  basePrice: number
  totalPrice: number
  discountPrice: number | null
  discountPercentage: number | null
  taxes: number
  fees: number
  currency: string
  hasDiscount: boolean
  discountExpires: string | null
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  stockNumber: string
  vin?: string | null
  category: string
  fuelType: string
  transmission: string
  mileage?: number | null
  color?: string | null
  description?: string | null
  status: string
  featured: boolean
  images: VehicleImage[]
  specifications?: VehicleSpecification[]
  pricing?: VehiclePricing | null
  features?: string[]
  highlights?: string[]
}

const FALLBACK_IMAGE: VehicleImage = {
  id: 'placeholder',
  imageUrl: '/placeholder-car.jpg',
  altText: 'صورة مركبة غير متوفرة',
  isPrimary: true,
  order: 0
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700 border-green-200',
  RESERVED: 'bg-amber-100 text-amber-700 border-amber-200',
  SOLD: 'bg-red-100 text-red-700 border-red-200',
  MAINTENANCE: 'bg-blue-100 text-blue-700 border-blue-200'
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'متاحة للبيع',
  RESERVED: 'محجوزة',
  SOLD: 'تم البيع',
  MAINTENANCE: 'في الصيانة'
}

export default function VehicleDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showContactDialog, setShowContactDialog] = useState(false)

  const vehicleIdentifier = params?.id

  useEffect(() => {
    const controller = new AbortController()

    async function loadVehicleDetails(identifier: string) {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/public/vehicles/${encodeURIComponent(identifier)}`, {
          signal: controller.signal
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('المركبة المطلوبة غير متاحة حالياً.')
          } else {
            setError('فشل في تحميل بيانات المركبة.')
          }
          setVehicle(null)
          return
        }

        const data = await response.json()
        const received: Vehicle | null = data?.vehicle ?? null

        if (!received) {
          setError('المركبة المطلوبة غير متاحة حالياً.')
          setVehicle(null)
          return
        }

        const normalizedImages = received.images && received.images.length > 0 ? received.images : [FALLBACK_IMAGE]
        const combinedFeatures = [
          ...(received.features ?? []),
          ...(received.highlights ?? [])
        ].filter(Boolean)

        setVehicle({
          ...received,
          images: normalizedImages,
          features: combinedFeatures.length > 0 ? Array.from(new Set(combinedFeatures)) : undefined
        })
        setSelectedImageIndex(0)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        console.error('Error loading vehicle details:', err)
        setError('حدث خطأ غير متوقع أثناء تحميل بيانات المركبة.')
      } finally {
        setLoading(false)
      }
    }

    if (vehicleIdentifier) {
      loadVehicleDetails(vehicleIdentifier)
    } else {
      setLoading(false)
    }

    return () => controller.abort()
  }, [vehicleIdentifier])

  const featureList = useMemo(() => {
    if (!vehicle) return [] as string[]

    const features = [...(vehicle.features || [])]

    // Add non-standard specs to features list
    if (vehicle.specifications && vehicle.specifications.length > 0) {
      // Get all keys defined in the template
      const templateKeys = new Set(VEHICLE_SPEC_TEMPLATE.flatMap(g => g.items.map(i => i.key)))

      // Find specs that are NOT in the template
      const otherSpecs = vehicle.specifications.filter(s => !templateKeys.has(s.key))

      otherSpecs.forEach(spec => {
        features.push(`${spec.label}: ${spec.value}`)
      })
    }

    return Array.from(new Set(features))
  }, [vehicle])

  const specificationList = vehicle?.specifications ?? []
  const priceToDisplay = vehicle?.pricing?.totalPrice ?? vehicle?.price ?? 0
  const currencyToDisplay = vehicle?.pricing?.currency ?? 'EGP'
  const statusClass = vehicle ? STATUS_BADGE_CLASSES[vehicle.status] ?? 'bg-gray-100 text-gray-800' : ''
  const statusLabel = vehicle ? STATUS_LABELS[vehicle.status] ?? vehicle.status : ''
  const imageCount = vehicle?.images?.length ?? 0
  const currentImage = vehicle && imageCount > 0 ? vehicle.images[selectedImageIndex] : FALLBACK_IMAGE

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-500 animate-pulse">جاري تحميل تفاصيل المركبة...</p>
        </div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-red-50 p-6 rounded-full mb-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">عذراً، حدث خطأ</h1>
        <p className="text-gray-600 mb-6 max-w-md">{error || 'المركبة غير موجودة'}</p>
        <Button onClick={() => router.push('/vehicles')} variant="default" size="lg">
          تصفح جميع المركبات
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12 pt-16 md:pt-20">
      {/* Breadcrumb & Navigation */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90 supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-sm text-gray-500 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            <Link href="/vehicles" className="hover:text-primary transition-colors">المركبات</Link>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            <span className="font-medium text-gray-900 truncate">
              {vehicle.make} {vehicle.model}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex" title="مشاركة">
              <Share2 className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex" title="حفظ في المفضلة">
              <Heart className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* MAIN CONTENT COLUMN */}
          <div className="lg:col-span-8 space-y-8">

            {/* HERRO GALLERY */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="relative aspect-[16/9] bg-gray-100 group">
                <Image
                  src={currentImage.imageUrl}
                  alt={currentImage.altText || `${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className={cn("px-3 py-1 text-sm font-medium border", statusClass)}>
                    {statusLabel}
                  </Badge>
                  {vehicle.featured && (
                    <Badge className="bg-amber-400 text-amber-900 border-amber-300 font-bold px-3 py-1 shadow-sm">
                      مميزة
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {vehicle.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto pb-4 scrollbar-hide">
                  {vehicle.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        "relative w-20 h-14 md:w-24 md:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                        selectedImageIndex === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={img.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK STATS & DESCRIPTION */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0A1A3F] to-[#2563eb] leading-tight">
                    {vehicle.make} {vehicle.model} <span className="text-gray-400 font-light">{vehicle.year}</span>
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                      {vehicle.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                      {vehicle.stockNumber}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Gauge} label="المسافة" value={vehicle.mileage ? `${(vehicle.mileage / 1000).toFixed(0)}k كم` : 'جديد'} />
                <StatCard icon={Fuel} label="الوقود" value={vehicle.fuelType} />
                <StatCard icon={Settings} label="ناقل الحركة" value={vehicle.transmission} />
                <StatCard icon={MapPin} label="اللون" value={vehicle.color || 'غير محدد'} />
              </div>

              {/* Description */}
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  عن المركبة
                </h3>
                {vehicle.description ? (
                  <p>{vehicle.description}</p>
                ) : (
                  <p className="text-gray-400 italic">لا يوجد وصف متاح لهذه المركبة.</p>
                )}
              </div>
            </div>

            {/* TABS: SPECS & FEATURES */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden min-h-[400px]">
              <Tabs defaultValue="specs" className="w-full">
                <div className="border-b bg-gray-50/50 px-6 pt-4">
                  <TabsList className="bg-transparent space-x-reverse space-x-6 h-auto p-0">
                    <StyledTabTrigger value="specs">المواصفات الفنية</StyledTabTrigger>
                    <StyledTabTrigger value="features">المزايا والتجهيزات</StyledTabTrigger>
                  </TabsList>
                </div>

                <div className="p-6 md:p-8">
                  <TabsContent value="specs" className="mt-0 space-y-8 animate-in fade-in-50 duration-300">
                    {specificationList.length === 0 ? (
                      <EmptyState message="لا توجد مواصفات فنية مسجلة لهذه المركبة." />
                    ) : (
                      <SpecsDisplay specs={specificationList} />
                    )}
                  </TabsContent>

                  <TabsContent value="features" className="mt-0 animate-in fade-in-50 duration-300">
                    {featureList.length === 0 ? (
                      <EmptyState message="لا توجد مزايا اضافية مسجلة." />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {featureList.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 transition-colors">
                            <div className="mt-0.5 bg-white p-1.5 rounded-full shadow-sm text-[#0A1A3F]">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <span className="text-gray-700 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>

          </div>

          {/* SIDEBAR COLUMN (Sticky) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Price & Action Card */}
            <Card className="border-0 shadow-lg ring-1 ring-gray-200 overflow-hidden">
              <div className="bg-primary/5 p-6 text-center border-b border-primary/10">
                <p className="text-gray-500 text-sm mb-1 font-medium">السعر المطلوب</p>
                <div className="text-4xl font-extrabold text-[#0A1A3F] tracking-tight">
                  {formatPrice(priceToDisplay, currencyToDisplay)}
                </div>
                {vehicle.pricing?.hasDiscount && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                    خصم {vehicle.pricing.discountPercentage}% لفترة محدودة
                  </div>
                )}
              </div>

              <CardContent className="p-6 space-y-4">
                <Button size="lg" className="w-full text-lg h-12 shadow-md hover:shadow-xl transition-all duration-300 bg-[#C1272D] hover:bg-[#a41f25] text-white" onClick={() => setShowContactDialog(true)}>
                  <Phone className="h-5 w-5 ml-2" />
                  تواصل معنا الآن
                </Button>
                <Link href={`/test-drive?vehicle=${vehicle.id}`} className="block">
                  <Button size="lg" variant="outline" className="w-full h-12 border-2 border-[#0A1A3F] text-[#0A1A3F] hover:bg-[#0A1A3F] hover:text-white transition-all duration-300">
                    <Calendar className="h-5 w-5 ml-2" />
                    حجز تجربة قيادة
                  </Button>
                </Link>

                <div className="pt-4 mt-2 border-t space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>ضمان شامل لمدة 3 سنوات</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    <span>خدمة صيانة مجانية (أول 10,000 كم)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent/Branch Info Placeholder (Optional) */}
            <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">معرض الحمد للسيارات</p>
                <p className="text-xs text-gray-500">الموزع المعتمد لسيارات تاتا</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>طلب معلومات عن المركبة</DialogTitle>
            <DialogDescription>
              أرسل لنا استفسارك بخصوص {vehicle.make} {vehicle.model}
            </DialogDescription>
          </DialogHeader>
          <ContactForm vehicle={vehicle} onSuccess={() => setShowContactDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center text-center gap-2 hover:bg-blue-50 hover:border-blue-100 transition-colors group">
      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="font-bold text-gray-900 line-clamp-1">{value}</p>
      </div>
    </div>
  )
}

function StyledTabTrigger({ value, children }: { value: string, children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-4 pb-3 pt-2 font-bold text-gray-500 hover:text-gray-800 transition-all text-base"
    >
      {children}
    </TabsTrigger>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg dashed border-2 border-gray-200">
      <div className="bg-gray-100 p-3 rounded-full mb-3">
        <Info className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  )
}

function SpecsDisplay({ specs }: { specs: VehicleSpecification[] }) {
  // Use Template to grouping
  const grouped = useMemo(() => {
    const groups: { title: string, items: VehicleSpecification[] }[] = []

    // 1. Template Groups
    VEHICLE_SPEC_TEMPLATE.forEach(templateGroup => {
      const matched = specs.filter(s => templateGroup.items.some(ti => ti.key === s.key))
      if (matched.length > 0) {
        groups.push({ title: templateGroup.category, items: matched })
      }
    })

    return groups
  }, [specs])

  return (
    <div className="space-y-8">
      {grouped.map((group, idx) => (
        <div key={idx} className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            {group.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {group.items.map((spec, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100/50 last:border-0 hover:bg-gray-100/50 px-2 rounded-lg transition-colors">
                <span className="text-gray-500 font-medium">{spec.label}</span>
                <span className="text-gray-900 font-bold text-left" dir="ltr">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ContactForm({ vehicle, onSuccess }: { vehicle: Vehicle; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form submission:', formData, 'for vehicle:', vehicle.id)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-right">
      <div className="space-y-1">
        <Label htmlFor="name">الاسم الكامل</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
          placeholder="أدخل اسمك"
          className="bg-gray-50"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
          placeholder="name@example.com"
          className="bg-gray-50"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          required
          placeholder="مثال: 01012345678"
          className="bg-gray-50"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="message">الرسالة</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          placeholder={`أرغب في معرفة المزيد عن ${vehicle.make} ${vehicle.model}...`}
          required
          className="min-h-[120px] bg-gray-50"
        />
      </div>
      <Button type="submit" className="w-full text-lg h-12">
        إرسال الطلب
      </Button>
    </form>
  )
}
