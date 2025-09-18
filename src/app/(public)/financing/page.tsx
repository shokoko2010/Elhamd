'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  Car, 
  DollarSign, 
  Percent, 
  Clock, 
  CheckCircle, 
  FileText, 
  Phone,
  Mail,
  Users,
  Shield,
  TrendingUp,
  ArrowLeft,
  Info
} from 'lucide-react'
import Link from 'next/link'

interface LoanCalculator {
  vehiclePrice: number
  downPayment: number
  loanTerm: number
  interestRate: number
  monthlyPayment: number
  totalInterest: number
  totalAmount: number
}

interface FinancingOption {
  id: string
  name: string
  interestRate: number
  maxTerm: number
  minDownPayment: number
  description: string
  features: string[]
  requirements: string[]
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  category: string
}

export default function FinancingPage() {
  const [calculator, setCalculator] = useState<LoanCalculator>({
    vehiclePrice: 850000,
    downPayment: 170000,
    loanTerm: 5,
    interestRate: 8.5,
    monthlyPayment: 0,
    totalInterest: 0,
    totalAmount: 0
  })
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [financingOptions, setFinancingOptions] = useState<FinancingOption[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('calculator')

  useEffect(() => {
    // Mock vehicles data
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        make: 'Tata',
        model: 'Nexon',
        year: 2024,
        price: 850000,
        category: 'SUV'
      },
      {
        id: '2',
        make: 'Tata',
        model: 'Punch',
        year: 2024,
        price: 650000,
        category: 'SUV'
      },
      {
        id: '3',
        make: 'Tata',
        model: 'Tiago',
        year: 2024,
        price: 550000,
        category: 'HATCHBACK'
      },
      {
        id: '4',
        make: 'Tata',
        model: 'Tigor',
        year: 2024,
        price: 600000,
        category: 'SEDAN'
      }
    ]
    setVehicles(mockVehicles)
    setSelectedVehicle(mockVehicles[0])

    // Mock financing options
    const mockFinancingOptions: FinancingOption[] = [
      {
        id: '1',
        name: 'التمويل الشخصي المباشر',
        interestRate: 8.5,
        maxTerm: 7,
        minDownPayment: 20,
        description: 'تمويل شخصي مباشر بشروط مرنة وأسعار تنافسية',
        features: [
          'فترة سداد تصل إلى 7 سنوات',
          'دفعات شهرية ثابتة',
          'بدون ضامن',
          'موافقة سريعة'
        ],
        requirements: [
          'دخل شهري ثابت',
          'بطاقة هوية وطنية سارية',
          'فواتير خدمات حديثة',
          'تقرير الائتمان'
        ]
      },
      {
        id: '2',
        name: 'تمويل السيارات الجديد',
        interestRate: 7.5,
        maxTerm: 5,
        minDownPayment: 15,
        description: 'تمويل مخصص للسيارات الجديدة بأفضل الأسعار',
        features: [
          'أسعار فائدة مخفضة',
          'فترة سداد تصل إلى 5 سنوات',
          'تأمين شامل على السيارة',
          'خدمة صيانة مجانية لمدة عام'
        ],
        requirements: [
          'دخل شهري 5000 جنيه فأكثر',
          'مصدر دخل موثق',
          'تاريخ ائتماني جيد',
          'عقد عمل ساري'
        ]
      },
      {
        id: '3',
        name: 'التمويل الإسلامي',
        interestRate: 6.5,
        maxTerm: 6,
        minDownPayment: 25,
        description: 'تمويل متوافق مع الشريعة الإسلامية',
        features: [
          'بدون فوائد ربوية',
          'تمويل شراء وبيع',
          'شروط عادلة ومنصفة',
          'شفافية في المعاملات'
        ],
        requirements: [
          'شهادة راتب حديثة',
          'حساب بنكي نشط',
          'إثبات عنوان السكن',
          'مصدر دخل حلال'
        ]
      },
      {
        id: '4',
        name: 'تمويل الموظفين',
        interestRate: 6.0,
        maxTerm: 6,
        minDownPayment: 10,
        description: 'تمويل مخصص للموظفين بشروط خاصة',
        features: [
          'أسعار فائدة مميزة',
          'معالجة سريعة للطلب',
          'مدفوعات شهرية مخفضة',
          'تأمين صحي مجاني'
        ],
        requirements: [
          'خطاب موافقة من جهة العمل',
          'بيان الراتب لآخر 6 أشهر',
          'بطاقة الخدمة',
          'إثبات العنوان'
        ]
      }
    ]
    setFinancingOptions(mockFinancingOptions)
    setLoading(false)
  }, [])

  useEffect(() => {
    calculateLoan()
  }, [calculator.vehiclePrice, calculator.downPayment, calculator.loanTerm, calculator.interestRate])

  const calculateLoan = () => {
    const loanAmount = calculator.vehiclePrice - calculator.downPayment
    const monthlyRate = calculator.interestRate / 100 / 12
    const numberOfPayments = calculator.loanTerm * 12
    
    if (monthlyRate === 0) {
      const monthlyPayment = loanAmount / numberOfPayments
      setCalculator(prev => ({
        ...prev,
        monthlyPayment,
        totalInterest: 0,
        totalAmount: loanAmount
      }))
    } else {
      const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      const totalAmount = monthlyPayment * numberOfPayments
      const totalInterest = totalAmount - loanAmount
      
      setCalculator(prev => ({
        ...prev,
        monthlyPayment,
        totalInterest,
        totalAmount
      }))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    if (vehicle) {
      setSelectedVehicle(vehicle)
      setCalculator(prev => ({
        ...prev,
        vehiclePrice: vehicle.price,
        downPayment: vehicle.price * 0.2
      }))
    }
  }

  const handleInputChange = (field: keyof LoanCalculator, value: string) => {
    const numValue = parseFloat(value) || 0
    setCalculator(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة للرئيسية
            </Link>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                خيارات التمويل
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                احصل على سيارتك المفضلة بخطط تمويل مرنة تناسب ميزانيتك
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                حاسبة القسط
              </TabsTrigger>
              <TabsTrigger value="options" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                خيارات التمويل
              </TabsTrigger>
              <TabsTrigger value="requirements" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                المستندات المطلوبة
              </TabsTrigger>
            </TabsList>

            {/* Calculator Tab */}
            <TabsContent value="calculator" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calculator Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      حاسبة الأقساط الشهرية
                    </CardTitle>
                    <CardDescription>
                      احسب قسطك الشهري بناءًا على سعر السيارة وشروط التمويل
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Vehicle Selection */}
                    <div>
                      <Label htmlFor="vehicle">اختر السيارة</Label>
                      <Select value={selectedVehicle?.id || ''} onValueChange={handleVehicleSelect}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="اختر السيارة" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.make} {vehicle.model} {vehicle.year} - {formatPrice(vehicle.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Vehicle Price */}
                    <div>
                      <Label htmlFor="price">سعر السيارة</Label>
                      <Input
                        id="price"
                        type="number"
                        value={calculator.vehiclePrice}
                        onChange={(e) => handleInputChange('vehiclePrice', e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    {/* Down Payment */}
                    <div>
                      <Label htmlFor="downPayment">الدفعة المقدمة ({formatPercentage((calculator.downPayment / calculator.vehiclePrice) * 100)})</Label>
                      <Input
                        id="downPayment"
                        type="number"
                        value={calculator.downPayment}
                        onChange={(e) => handleInputChange('downPayment', e.target.value)}
                        className="mt-2"
                      />
                      <div className="mt-2">
                        <input
                          type="range"
                          min="0"
                          max={calculator.vehiclePrice * 0.5}
                          step={10000}
                          value={calculator.downPayment}
                          onChange={(e) => handleInputChange('downPayment', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Loan Term */}
                    <div>
                      <Label htmlFor="loanTerm">مدة القرض ({calculator.loanTerm} سنوات)</Label>
                      <Select value={calculator.loanTerm.toString()} onValueChange={(value) => handleInputChange('loanTerm', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 سنة</SelectItem>
                          <SelectItem value="2">2 سنوات</SelectItem>
                          <SelectItem value="3">3 سنوات</SelectItem>
                          <SelectItem value="4">4 سنوات</SelectItem>
                          <SelectItem value="5">5 سنوات</SelectItem>
                          <SelectItem value="6">6 سنوات</SelectItem>
                          <SelectItem value="7">7 سنوات</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Interest Rate */}
                    <div>
                      <Label htmlFor="interestRate">معدل الفائدة ({formatPercentage(calculator.interestRate)})</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.1"
                        value={calculator.interestRate}
                        onChange={(e) => handleInputChange('interestRate', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-900">نتيجة الحساب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">القسط الشهري</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatPrice(calculator.monthlyPayment)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">إجمالي الفائدة</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatPrice(calculator.totalInterest)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">مبلغ القرض</p>
                          <p className="text-xl font-semibold text-gray-800">
                            {formatPrice(calculator.vehiclePrice - calculator.downPayment)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">الإجمالي المدفوع</p>
                          <p className="text-xl font-semibold text-gray-800">
                            {formatPrice(calculator.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        مميزات التمويل مع الحمد للسيارات
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">أسعار فائدة تنافسية</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">مدد سداد مرنة</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">معالجة سريعة</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">بدون رسوم خفية</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">تأمين شامل</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">دعم فني متواصل</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Link href="/contact">
                      <Button size="lg" className="flex-1">
                        <Phone className="ml-2 h-4 w-4" />
                        تواصل معنا
                      </Button>
                    </Link>
                    <Link href="/test-drive">
                      <Button size="lg" variant="outline" className="flex-1">
                        <Car className="ml-2 h-4 w-4" />
                        قيادة تجريبية
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Financing Options Tab */}
            <TabsContent value="options" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">اختر خطة التمويل المناسبة لك</h2>
                <p className="text-gray-600">
                  نقدم多种 خيارات تمويلية لتلبية مختلف الاحتياجات والميزانيات
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {financingOptions.map((option) => (
                  <Card key={option.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{option.name}</CardTitle>
                        <Badge className="bg-blue-100 text-blue-800">
                          {formatPercentage(option.interestRate)}
                        </Badge>
                      </div>
                      <CardDescription>{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>حتى {option.maxTerm} سنوات</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-gray-400" />
                          <span>دفعة مقدمة {option.minDownPayment}%</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">المميزات:</h4>
                        <ul className="space-y-1">
                          {option.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">المتطلبات:</h4>
                        <ul className="space-y-1">
                          {option.requirements.map((requirement, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <Info className="h-3 w-3 text-blue-500" />
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button className="w-full" onClick={() => setActiveTab('calculator')}>
                        احسب الأقساط
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Requirements Tab */}
            <TabsContent value="requirements" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">المستندات المطلوبة للتمويل</h2>
                <p className="text-gray-600">
                  لتسهيل عملية التمويل، يرجى تجهيز المستندات التالية
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      المستندات الشخصية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        بطاقة الرقم القومي سارية
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        شهادة الميلاد
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        إثبات العنوان (فاتورة خدمات)
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        4 صور شخصية حديثة
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      مستندات الدخل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        شهادة الراتب لآخر 6 أشهر
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        خطاب موافقة من جهة العمل
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        كشف حساب بنكي لآخر 6 أشهر
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        إقرار الدخل الشهري
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      مستندات إضافية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        تقرير الائتمان (إن وجد)
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        عقد الإيجار (إن وجد)
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        مستندات الملكية (عقار/سيارة)
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        ضمان بنكي (إن وجد)
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    نصائح لزيادة فرص الموافقة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">حافظ على تاريخ ائتماني جيد</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">جهز جميع المستندات المطلوبة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">اختر دفعة مقدرة مناسبة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">اختر مدة سداد مناسبة لدخلك</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Link href="/contact">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Phone className="ml-2 h-4 w-4" />
                    استشر خبير التمويل
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}