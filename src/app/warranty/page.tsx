import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, CheckCircle, Clock, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'الضمان | شركة الحمد لاستيراد السيارات',
  description: 'معرفة تفاصيل الضمان الشامل الذي نقدمه لجميع سياراتنا المستوردة',
}

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">الضمان الشامل</h1>
            <p className="text-xl text-gray-600">
              نقدم ضماناً شاملاً على جميع سياراتنا المستوردة لراحة بالكم
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  الضمان الأساسي
                </CardTitle>
                <CardDescription>
                  تغطية شاملة للمحرك وناقل الحركة والهيكل
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>المحرك وناقل الحركة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>نظام التوجيه والمكابح</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>نظام التكييف والتدفئة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>النظام الكهربائي</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                  مدة الضمان
                </CardTitle>
                <CardDescription>
                  فترة ضمان تناسب احتياجاتكم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>سنة واحدة أو 20,000 كم</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>سنتان أو 40,000 كم</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>ثلاث سنوات أو 60,000 كم</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>خمس سنوات أو 100,000 كم</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                شروط الضمان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-4">التغطية تشمل:</h3>
                <ul className="list-disc list-inside space-y-2 mb-6">
                  <li>جميع الأعطال الميكانيكية والكهربائية</li>
                  <li>قطع الغيار الأصلية واليدوية</li>
                  <li>أجور العمالة المعتمدة</li>
                  <li>خدمة الطريق على الطريق 24/7</li>
                  <li>سيارة بديلة خلال فترة الصيانة</li>
                </ul>

                <h3 className="text-lg font-semibold mb-4">الاستثناءات:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>التآكل والاستهلاك الطبيعي</li>
                  <li>الأضرار الناتجة عن الحوادث</li>
                  <li>الإهمال في الصيانة الدورية</li>
                  <li>الاستخدام غير السليم للسيارة</li>
                  <li>التعديلات غير المعتمدة</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">للاستفسار عن الضمان</h3>
            <p className="text-gray-600 mb-4">
              تواصل معنا للحصول على تفاصيل كاملة عن برامج الضمان المتاحة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+20212345678" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                اتصل بنا
              </a>
              <a 
                href="/contact" 
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                نموذج التواصل
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}