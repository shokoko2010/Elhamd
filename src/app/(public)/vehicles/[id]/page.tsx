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
  AlertCircle
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { VEHICLE_SPEC_TEMPLATE } from '@/lib/vehicle-specs'

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
  AVAILABLE: 'bg-green-500',
  RESERVED: 'bg-yellow-500',
  SOLD: 'bg-red-500'
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'متاحة',
  RESERVED: 'محجوزة',
  SOLD: 'مباعة'
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
            setError('المركبة المطلوبة غير متاحة حالياً. يرجى استعراض المركبات المتاحة أو التواصل مع فريق المبيعات.')
          } else {
            setError('فشل في تحميل بيانات المركبة. حاول مرة أخرى لاحقاً أو قم بتحديث الصفحة.')
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
        if ((err as Error).name === 'AbortError') {
          return
        }

        console.error('Error loading vehicle details:', err)
        setError('حدث خطأ غير متوقع أثناء تحميل بيانات المركبة. يرجى المحاولة مرة أخرى لاحقاً.')
        setVehicle(null)
      } finally {
        setLoading(false)
      }
    }

    if (vehicleIdentifier) {
      loadVehicleDetails(vehicleIdentifier)
    } else {
      setLoading(false)
      setVehicle(null)
      setError('لم يتم تحديد المركبة المطلوبة.')
    }

    return () => controller.abort()
  }, [vehicleIdentifier])

  const featureList = useMemo(() => {
    if (!vehicle) {
      return [] as string[]
    }

    if (vehicle.features && vehicle.features.length > 0) {
      return vehicle.features
    }

    if (vehicle.specifications && vehicle.specifications.length > 0) {
      return vehicle.specifications.slice(0, 6).map((spec) => `${spec.label}: ${spec.value}`)
    }

    return [] as string[]
  }, [vehicle])

  const specificationList = vehicle?.specifications ?? []
  const priceToDisplay = vehicle?.pricing?.totalPrice ?? vehicle?.price ?? 0
  const currencyToDisplay = vehicle?.pricing?.currency ?? 'EGP'
  const statusClass = vehicle ? STATUS_BADGE_CLASSES[vehicle.status] ?? 'bg-blue-600' : 'bg-blue-600'
  const statusLabel = vehicle ? STATUS_LABELS[vehicle.status] ?? vehicle.status : ''
  const imageCount = vehicle?.images?.length ?? 0
  const safeImageIndex = imageCount > 0 ? Math.min(selectedImageIndex, imageCount - 1) : 0
  const currentImage = vehicle && imageCount > 0 ? vehicle.images[safeImageIndex] : FALLBACK_IMAGE

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المركبة...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تعذر تحميل بيانات المركبة</h1>
          <p className="text-gray-600 leading-relaxed">{error}</p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button onClick={() => router.back()}>العودة</Button>
            <Button variant="outline" onClick={() => router.push('/vehicles')}>
              استعرض جميع المركبات
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">المركبة غير متاحة</h1>
          <p className="text-gray-600 mb-4">المركبة التي تبحث عنها غير موجودة أو تم إزالتها.</p>
          <Button onClick={() => router.push('/vehicles')}>عودة إلى قائمة المركبات</Button>
        </div>
      </div>
    )
  }

  const seatingInfo = specificationList.find((spec) => /مقعد|seat/i.test(spec.label))?.value
  const engineInfo = specificationList.find((spec) => /المحرك|engine/i.test(spec.label))?.value
  const safetyInfo = specificationList.find((spec) => /أمان|safety/i.test(spec.label))?.value

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 space-x-reverse text-sm">
            <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-800">
              الرئيسية
            </button>
            <span className="text-gray-400">/</span>
            <button onClick={() => router.push('/vehicles')} className="text-blue-600 hover:text-blue-800">
              المركبات
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">
              {vehicle.make} {vehicle.model} {vehicle.year}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                <Image
                  key={currentImage.id}
                  src={currentImage.imageUrl}
                  alt={currentImage.altText || `${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <Badge className={`absolute top-4 left-4 z-10 ${statusClass}`}>{statusLabel}</Badge>
              </div>

              {vehicle.images.length > 1 && (
                <div className="p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {vehicle.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-video bg-gray-100 rounded overflow-hidden border-2 transition-colors relative ${selectedImageIndex === index ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                          }`}
                      >
                        <Image
                          src={image.imageUrl}
                          alt={image.altText || `${vehicle.make} ${vehicle.model} - صورة ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 20vw, 10vw"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="text-lg text-gray-600">موديل {vehicle.year}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant="outline">{vehicle.category}</Badge>
                    <Badge variant="secondary">{vehicle.fuelType}</Badge>
                    <Badge variant="secondary">{vehicle.transmission}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900">
                    {formatPrice(priceToDisplay, currencyToDisplay)}
                  </div>
                  <div className="text-sm text-gray-600">رقم المخزون: {vehicle.stockNumber}</div>
                  {vehicle.pricing?.discountPrice && vehicle.pricing.discountPrice < priceToDisplay && (
                    <div className="text-sm text-green-600 mt-1">
                      سعر بعد الخصم: {formatPrice(vehicle.pricing.discountPrice, currencyToDisplay)}
                    </div>
                  )}
                </div>
              </div>

              {vehicle.description && (
                <p className="text-gray-700 leading-relaxed mt-6 mb-6">{vehicle.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">نوع الوقود</div>
                    <div className="font-medium">{vehicle.fuelType}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">ناقل الحركة</div>
                    <div className="font-medium">{vehicle.transmission}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">العداد</div>
                    <div className="font-medium">{vehicle.mileage ?? 0} كم</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">اللون</div>
                    <div className="font-medium">{vehicle.color ?? 'غير محدد'}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/test-drive?vehicle=${vehicle.id}`}>
                  <Button size="lg" className="flex-1 min-w-[160px]">
                    <Calendar className="ml-2 h-5 w-5" />
                    حجز تجربة قيادة
                  </Button>
                </Link>
                <Link href="/maintenance">
                  <Button size="lg" variant="outline" className="flex-1 min-w-[160px]">
                    <Wrench className="ml-2 h-5 w-5" />
                    مركز الخدمة
                  </Button>
                </Link>
                <Link href="/financing">
                  <Button size="lg" variant="outline" className="flex-1 min-w-[160px]">
                    <DollarSign className="ml-2 h-5 w-5" />
                    خيارات التمويل
                  </Button>
                </Link>

                <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="flex-1 min-w-[160px]">
                      <Phone className="ml-2 h-5 w-5" />
                      تواصل مع المبيعات
                    </Button>
                  </DialogTrigger>
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

                <Button size="lg" variant="outline" className="min-w-[56px]">
                  <Heart className="h-5 w-5" />
                </Button>

                <Button size="lg" variant="outline" className="min-w-[56px]">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="specifications">المواصفات الفنية</TabsTrigger>
              <TabsTrigger value="features">المزايا</TabsTrigger>
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="mt-6">
              <div className="space-y-6">
                {VEHICLE_SPEC_TEMPLATE.map((group, index) => {
                  const groupSpecs = group.items.map(item => {
                    const val = specificationList.find(s => s.key === item.key)?.value;
                    return val ? { label: item.label, value: val } : null;
                  }).filter(Boolean);

                  if (groupSpecs.length === 0) return null;

                  return (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{group.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          {groupSpecs.map((spec, i) => (
                            <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                              <span className="font-medium text-gray-700">{spec!.label}</span>
                              <span className="text-gray-900 font-semibold text-left" dir="ltr">{spec!.value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Catch-all for specs not in the template */}
                {specificationList.some(s => !VEHICLE_SPEC_TEMPLATE.some(g => g.items.some(i => i.key === s.key))) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">مواصفات أخرى</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {specificationList.filter(s => !VEHICLE_SPEC_TEMPLATE.some(g => g.items.some(i => i.key === s.key))).map((spec, i) => (
                          <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                            <span className="font-medium text-gray-700">{spec.label}</span>
                            <span className="text-gray-900 font-semibold text-left">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {specificationList.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-gray-500 text-center">لا تتوفر مواصفات تفصيلية لهذه المركبة حالياً.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>المزايا والتجهيزات</CardTitle>
                  <CardDescription>أبرز ما يميز هذه المركبة عن غيرها</CardDescription>
                </CardHeader>
                <CardContent>
                  {featureList.length === 0 ? (
                    <p className="text-gray-500">سيتم تحديث المزايا قريباً. يرجى التواصل مع المبيعات لمعرفة التفاصيل.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {featureList.map((feature, index) => (
                        <div key={`${feature}-${index}`} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>نظرة شاملة</CardTitle>
                  <CardDescription>ملخص سريع لأبرز مميزات المركبة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none text-right">
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      تجمع {vehicle.make} {vehicle.model} {vehicle.year} بين الأداء القوي والتقنيات الحديثة والتصميم العملي الذي يناسب
                      طرق وشوارع مصر. صُممت هذه المركبة لتقدم تجربة قيادة مريحة وآمنة مع تكاليف تشغيل اقتصادية.
                    </p>
                    <p className="text-gray-700 mb-4">أهم النقاط:</p>
                    <ul className="list-disc space-y-2 pr-6 text-gray-700">
                      <li>{engineInfo || 'محرك موثوق يوفر توازناً مثالياً بين القوة والكفاءة.'}</li>
                      <li>{safetyInfo || 'أنظمة أمان متطورة تضمن رحلة مطمئنة لجميع الركاب.'}</li>
                      <li>{seatingInfo || 'مقصورة رحبة ومريحة تلبي احتياجات العائلة والعمل.'}</li>
                      <li>خدمة ما بعد البيع متميزة ودعم فني معتمد من تاتا موتورز.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
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
      <div>
        <Label htmlFor="name">الاسم الكامل</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
          placeholder="أدخل اسمك"
        />
      </div>
      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
          placeholder="name@example.com"
        />
      </div>
      <div>
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          required
          placeholder="مثال: 01012345678"
        />
      </div>
      <div>
        <Label htmlFor="message">الرسالة</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          placeholder={`أرغب في معرفة المزيد عن ${vehicle.make} ${vehicle.model}...`}
          required
          className="min-h-[120px]"
        />
      </div>
      <Button type="submit" className="w-full">
        إرسال الرسالة
      </Button>
    </form>
  )
}
