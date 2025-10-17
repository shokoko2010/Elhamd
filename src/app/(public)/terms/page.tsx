'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Gavel, 
  Users,
  Shield,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">الشروط والأحكام</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              الشروط والأحكام governing استخدام موقع وخدمات الهامد للسيارات
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Acceptance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              القبول بالشروط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              باستخدامك لموقع الهامد للسيارات وخدماتنا، فإنك تقر بأنك قرأت وفهمت ووافقت على هذه الشروط والأحكام. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام موقعنا أو خدماتنا.
            </p>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              الخدمات المقدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">خدمات السيارات:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>بيع وشراء السيارات الجديدة والمستعملة</li>
                  <li>خدمات الصيانة والإصلاح</li>
                  <li>بيع قطع الغيار الأصلية</li>
                  <li>خدمات التمويل والتقسيط</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">الخدمات الإلكترونية:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>حجز المواعيد عبر الإنترنت</li>
                  <li>استعراض السيارات المتوفرة</li>
                  <li>طلب قطع الغيار</li>
                  <li>التواصل مع خدمة العملاء</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              مسؤوليات المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">دقة المعلومات</h4>
                  <p className="text-gray-600">يجب تقديم معلومات دقيقة وحديثة</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">الاستخدام القانوني</h4>
                  <p className="text-gray-600">استخدام الموقع للأغراض القانونية فقط</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">حماية الحساب</h4>
                  <p className="text-gray-600">الحفاظ على سرية معلومات الدخول</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">الاحترام المتبادل</h4>
                  <p className="text-gray-600">التعامل باحترام مع الموظفين والعملاء الآخرين</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing and Payment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
                الأسعار والدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">الأسعار:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>جميع الأسعار معروضة بالجنيه المصري</li>
                  <li>الأسعار قابلة للتغيير دون إشعار مسبق</li>
                  <li>تشمل الضريبة المضافة حسب القانون</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">طرق الدفع:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>الدفع النقدي</li>
                  <li>البطاقات الائتمانية والخصم المباشر</li>
                  <li>التقسيط عبر الشركات المتعاقد معها</li>
                  <li>التحويل البنكي</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warranty */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              الضمان والكفالة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">ضمان الشركة المصنعة</h4>
                  <p className="text-gray-600">تطبق شروط ضمان الشركة المصنعة</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">ضمان الهامد</h4>
                  <p className="text-gray-600">ضمان إضافي على الخدمات المقدمة</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">شروط الضمان</h4>
                  <p className="text-gray-600">يخضع الضمان للشروط والأحكام المحددة</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limitations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              تحديد المسؤولية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">لا نتحمل مسؤولية:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>الأضرار غير المباشرة أو التبعية</li>
                  <li>فقدان البيانات أو الأرباح</li>
                  <li>انقطاع الخدمة لأسباب خارجة عن إرادتنا</li>
                  <li>استخدام الموقع بشكل غير صحيح</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">حدود المسؤولية:</h3>
                <p className="text-gray-700">
                  تقتصر مسؤوليتنا على قيمة الخدمة المقدمة، ولا تتعدى في أي حال من الأحوال الحد الأقصى المسموح به قانوناً.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              الملكية الفكرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              جميع المحتويات الموجودة على هذا الموقع، بما في ذلك但不限于 النصوص، الصور، الرسوم البيانية، الشعارات، والأصوات، هي ملكية لشركة الهامد للسيارات أو licensors محميين بموجب قوانين حقوق النشر والعلامات التجارية.
            </p>
            <p className="text-gray-700">
              يُحظر نسخ أو توزيع أو نقل أو تعديل أو إعادة استخدام أي جزء من هذا الموقع دون الحصول على موافقة كتابية مسبقة منا.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              إنهاء الخدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              نحتفظ بالحق في إنهاء أو تعليق وصولك إلى الموقع فوراً، دون إشعار مسبق أو مسؤولية، لأي سبب من الأسباب، بما في ذلك但不限于:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>انتهاك هذه الشروط والأحكام</li>
              <li>الاستخدام غير القانوني للموقع</li>
              <li>الإضرار بسمعة الشركة</li>
              <li>الأسباب الأمنية أو التقنية</li>
            </ul>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              القانون الحاكم والاختصاص القضائي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              تخضع هذه الشروط والأحكام ويتم تفسيرها وفقاً لقوانين جمهورية مصر العربية. أي نزاع ينشأ عن استخدام الموقع سيتم حله بواسطة المحاكم المصرية.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              للتواصل بخصوص الشروط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              إذا كان لديك أي أسئلة بخصوص هذه الشروط والأحكام، يمكنك التواصل معنا:
            </p>
            <div className="space-y-2">
              <p><strong>البريد الإلكتروني:</strong> legal@elhamdimport.com</p>
              <p><strong>الهاتف:</strong> +20 2 1234 5678</p>
              <p><strong>العنوان:</strong> القاهرة، مصر</p>
            </div>
          </CardContent>
        </Card>

        {/* Update Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">تحديث الشروط</h3>
              <p className="text-gray-700 mb-4">
                قد نقوم بتحديث هذه الشروط والأحكام من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة ودخولها حيز التنفيذ فور نشرها.
              </p>
              <p className="text-sm text-gray-600">
                آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link href="/contact">
            <Button size="lg">
              تواصل معنا للاستفسارات
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}