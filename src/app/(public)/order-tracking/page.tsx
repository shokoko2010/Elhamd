'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone,
  Mail,
  CreditCard,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface OrderTrackingData {
  order: {
    id: string
    orderNumber: string
    status: string
    paymentStatus: string
    subtotal: number
    taxAmount: number
    shippingAmount: number
    total: number
    createdAt: string
    updatedAt: string
    customer: {
      name: string
      email: string
      phone: string
    }
    items: Array<{
      id: string
      productName: string
      quantity: number
      price: number
      totalPrice: number
      images: string[]
    }>
    payment: any
    promotions: Array<{
      id: string
      title: string
      code: string
      discount: number
    }>
    shippingAddress: any
    billingAddress: any
    notes: string
  }
  timeline: Array<{
    status: string
    label: string
    description: string
    timestamp: string
    completed: boolean
  }>
  deliveryEstimates: {
    processing: string | null
    shipping: string | null
    delivery: string | null
  }
}

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        orderNumber,
        ...(email && { email }),
        ...(phone && { phone })
      })

      const response = await fetch(`/api/commerce/orders/track?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل في تتبع الطلب')
      }

      setTrackingData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'CONFIRMED': return 'bg-blue-500'
      case 'PROCESSING': return 'bg-purple-500'
      case 'SHIPPED': return 'bg-indigo-500'
      case 'DELIVERED': return 'bg-green-500'
      case 'CANCELLED': return 'bg-red-500'
      case 'COMPLETED': return 'bg-green-500'
      case 'FAILED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-5 w-5" />
      case 'CONFIRMED': return <CheckCircle className="h-5 w-5" />
      case 'PROCESSING': return <Package className="h-5 w-5" />
      case 'SHIPPED': return <Truck className="h-5 w-5" />
      case 'DELIVERED': return <CheckCircle className="h-5 w-5" />
      case 'CANCELLED': return <AlertCircle className="h-5 w-5" />
      default: return <Package className="h-5 w-5" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">تتبع طلبك</h1>
            <p className="text-xl text-blue-100">
              تابع حالة طلبك خطوة بخطوة
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!trackingData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  البحث عن طلب
                </CardTitle>
                <CardDescription>
                  أدخل رقم الطلب والبريد الإلكتروني أو رقم الهاتف لتتبع طلبك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrackOrder} className="space-y-4">
                  <div>
                    <Label htmlFor="orderNumber">رقم الطلب *</Label>
                    <Input
                      id="orderNumber"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="مثال: ORD-1234567890"
                      required
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="أدخل البريد الإلكتروني المستخدم في الطلب"
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="أدخل رقم الهاتف المستخدم في الطلب"
                      className="text-lg"
                    />
                  </div>

                  <p className="text-sm text-gray-600">
                    يجب إدخال البريد الإلكتروني أو رقم الهاتف المستخدم عند إنشاء الطلب
                  </p>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700">{error}</span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="w-full text-lg py-3">
                    {loading ? 'جاري البحث...' : 'تتبع الطلب'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">طلب #{trackingData.order.orderNumber}</CardTitle>
                      <CardDescription>
                        تم إنشاء الطلب في {format(new Date(trackingData.order.createdAt), 'PPP', { locale: ar })}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(trackingData.order.status)} text-white self-start sm:self-auto`}>
                      {trackingData.order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">الإجمالي</p>
                      <p className="text-lg sm:text-xl font-bold">{formatCurrency(trackingData.order.total)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">حالة الدفع</p>
                      <Badge className={`${getStatusColor(trackingData.order.paymentStatus)} text-white text-xs`}>
                        {trackingData.order.paymentStatus}
                      </Badge>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">عدد المنتجات</p>
                      <p className="text-lg sm:text-xl font-bold">{trackingData.order.items.length}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600">العميل</p>
                      <p className="text-sm font-medium">{trackingData.order.customer.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>مسار الطلب</CardTitle>
                  <CardDescription>
                    تابع حالة طلبك خطوة بخطوة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingData.timeline.map((step, index) => (
                      <div key={step.status} className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {getStatusIcon(step.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${step.completed ? 'text-green-600' : 'text-gray-600'}`}>
                              {step.label}
                            </h3>
                            {step.completed && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{step.description}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(step.timestamp), 'PPP p', { locale: ar })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Estimates */}
              {trackingData.order.status !== 'CANCELLED' && (
                <Card>
                  <CardHeader>
                    <CardTitle>مواعيد التسليم المتوقعة</CardTitle>
                    <CardDescription>
                      المواعيد التقديرية لتسليم طلبك
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {trackingData.deliveryEstimates.processing && (
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="font-medium">المعالجة</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(trackingData.deliveryEstimates.processing), 'PPP', { locale: ar })}
                          </p>
                        </div>
                      )}
                      {trackingData.deliveryEstimates.shipping && (
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <Truck className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                          <p className="font-medium">الشحن</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(trackingData.deliveryEstimates.shipping), 'PPP', { locale: ar })}
                          </p>
                        </div>
                      )}
                      {trackingData.deliveryEstimates.delivery && (
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="font-medium">التسليم</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(trackingData.deliveryEstimates.delivery), 'PPP', { locale: ar })}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل الطلب</CardTitle>
                  <CardDescription>
                    المنتجات المطلوبة في طلبك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingData.order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg">
                          {item.images.length > 0 && (
                            <img
                              src={item.images[0]}
                              alt={item.productName}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.productName}</h3>
                          <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.price)}</p>
                          <p className="text-sm text-gray-600">
                            الإجمالي: {formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>معلومات العميل</CardTitle>
                  <CardDescription>
                    معلومات الاتصال والعنوان
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">معلومات الاتصال</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{trackingData.order.customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{trackingData.order.customer.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-3">عنوان الشحن</h3>
                      {trackingData.order.shippingAddress && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {trackingData.order.shippingAddress.address1}
                            </span>
                          </div>
                          {trackingData.order.shippingAddress.address2 && (
                            <p className="text-sm text-gray-600">
                              {trackingData.order.shippingAddress.address2}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            {trackingData.order.shippingAddress.city}, {trackingData.order.shippingAddress.country}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Track Another Order Button */}
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setTrackingData(null)
                    setOrderNumber('')
                    setEmail('')
                    setPhone('')
                    setError('')
                  }}
                >
                  تتبع طلب آخر
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}