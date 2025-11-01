'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-react'

export default function AdminVehiclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المركبات</h1>
          <p className="text-gray-600 mt-2">إضافة وتعديل وحذف المركبات في النظام</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            إضافة مركبة جديدة
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المركبات</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              +12% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المركبات المتاحة</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189</div>
            <p className="text-xs text-muted-foreground">
              77% من إجمالي المركبات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المركبات المباعة</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5M ر.س</div>
            <p className="text-xs text-muted-foreground">
              إجمالي القيمة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث عن مركبة..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>جميع الفئات</option>
              <option>سيدان</option>
              <option>SUV</option>
              <option>هاتشباك</option>
              <option>شاحنة</option>
            </select>
            <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>جميع الحالات</option>
              <option>متاح</option>
              <option>مباع</option>
              <option>محجوز</option>
              <option>صيانة</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المركبات</CardTitle>
          <CardDescription>عرض جميع المركبات في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: 1,
                make: 'تاتا',
                model: 'نكسون EV',
                year: 2024,
                price: 85000,
                stockNumber: 'TAT-001',
                status: 'متاح',
                category: 'SUV',
                fuelType: 'كهربائي',
                color: 'أبيض',
                image: '/uploads/vehicles/nxz2024001/nexon-ev-front.jpg'
              },
              {
                id: 2,
                make: 'تاتا',
                model: 'بانش',
                year: 2024,
                price: 65000,
                stockNumber: 'TAT-002',
                status: 'متاح',
                category: 'هاتشباك',
                fuelType: 'بنزين',
                color: 'أحمر',
                image: '/uploads/vehicles/2/punch-front.jpg'
              },
              {
                id: 3,
                make: 'تاتا',
                model: 'هارير',
                year: 2024,
                price: 110000,
                stockNumber: 'TAT-003',
                status: 'محجوز',
                category: 'SUV',
                fuelType: 'ديزل',
                color: 'أسود',
                image: '/uploads/vehicles/1/nexon-front.jpg'
              },
              {
                id: 4,
                make: 'تاتا',
                model: 'ألتروز',
                year: 2024,
                price: 72000,
                stockNumber: 'TAT-004',
                status: 'متاح',
                category: 'هاتشباك',
                fuelType: 'بنزين',
                color: 'أزرق',
                image: '/uploads/vehicles/3/tiago-front.jpg'
              },
              {
                id: 5,
                make: 'تاتا',
                model: 'سفاري',
                year: 2024,
                price: 125000,
                stockNumber: 'TAT-005',
                status: 'مباع',
                category: 'SUV',
                fuelType: 'ديزل',
                color: 'رمادي',
                image: '/uploads/vehicles/5/harrier-front.jpg'
              }
            ].map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={vehicle.image} 
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/vehicle'
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {vehicle.make} {vehicle.model} {vehicle.year}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {vehicle.category} • {vehicle.fuelType} • {vehicle.color}
                    </p>
                    <p className="text-xs text-gray-500">
                      الرقم: {vehicle.stockNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {vehicle.price.toLocaleString('ar-EG')} ر.س
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      vehicle.status === 'متاح' ? 'bg-green-100 text-green-800' :
                      vehicle.status === 'محجوز' ? 'bg-yellow-100 text-yellow-800' :
                      vehicle.status === 'مباع' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}