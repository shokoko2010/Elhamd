'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Truck, 
  Phone,
  Mail,
  MapPin,
  Star,
  RefreshCw,
  Plus,
  Eye,
  Package
} from 'lucide-react'
import Link from 'next/link'

interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address?: string
  rating: number
  status: string
  leadTime: number
  minOrderAmount: number
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/inventory/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(Array.isArray(data) ? data : [])
      } else {
        setError('فشل في تحميل الموردين')
        setSuppliers([])
      }
    } catch (error) {
      console.error('Error loading suppliers:', error)
      setError('فشل في تحميل الموردين')
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">الموردون</h1>
          <Button variant="outline" disabled>
            <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
            جاري التحميل...
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">الموردون</h1>
          <Button variant="outline" onClick={loadSuppliers}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AdminRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">الموردون</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSuppliers}>
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
            <Link href="/admin/inventory">
              <Button variant="outline">
                <Package className="ml-2 h-4 w-4" />
                الذهاب إلى المخزون
              </Button>
            </Link>
          </div>
        </div>

        {suppliers.length === 0 ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-8 text-center">
              <Truck className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-blue-900 mb-2">
                لا يوجد موردون
              </h2>
              <p className="text-blue-700 mb-6">
                لا توجد موردون في النظام حالياً. يمكن إضافة موردين من خلال قسم المخزون.
              </p>
              <Link href="/admin/inventory">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Package className="ml-2 h-4 w-4" />
                  الذهاب إلى المخزون
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                      {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {supplier.contact}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{supplier.phone}</span>
                  </div>
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{supplier.address}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      {getRatingStars(supplier.rating)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {supplier.leadTime} يوم
                    </div>
                  </div>
                  {supplier.minOrderAmount > 0 && (
                    <div className="text-sm text-gray-600">
                      الحد الأدنى للطلب: {supplier.minOrderAmount.toLocaleString()} ريال
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminRoute>
  )
}