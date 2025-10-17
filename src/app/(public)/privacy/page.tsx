'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  UserCheck,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">سياسة الخصوصية</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              نلتزم بحماية خصوصيتك وبياناتك الشخصية
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              مقدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              في شركة الهامد للسيارات، نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدامك لموقعنا الإلكتروني وخدماتنا.
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              البيانات التي نجمعها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">المعلومات الشخصية:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>الاسم الكامل وعنوان البريد الإلكتروني</li>
                  <li>رقم الهاتف وعنوان السكن</li>
                  <li>معلومات الاتصال الأخرى</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">معلومات السيارة:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>نوع وموديل السيارة</li>
                  <li>رقم الهيكل والمحرك</li>
                  <li>سنة الصنع واللون</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">معلومات الاستخدام:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>سجل الخدمات والصيانة</li>
                  <li>تفضيلات العملاء</li>
                  <li>التواصل مع خدمة العملاء</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              كيف نستخدم بياناتك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">تقديم الخدمات</h4>
                  <p className="text-gray-600">لتقديم خدمات الصيانة والإصلاح والبيع</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">التواصل مع العملاء</h4>
                  <p className="text-gray-600">لإرسال الإشعارات والعروض الخاصة</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">تحسين الخدمات</h4>
                  <p className="text-gray-600">لتحليل وتحسين جودة خدماتنا</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">الأغراض القانونية</h4>
                  <p className="text-gray-600">للامتثال للمتطلبات القانونية والضريبية</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              حماية البيانات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">التدابير الأمنية:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>تشفير البيانات الحساسة</li>
                  <li>الوصول المحدود للمعلومات</li>
                  <li>النسخ الاحتياطي المنتظم</li>
                  <li>تحديثات أمنية مستمرة</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">التخزين:</h3>
                <p className="text-gray-700">
                  يتم تخزين بياناتك على خوادم آمنة داخل مصر، مع الالتزام بالقوانين المحلية والدولية لحماية البيانات.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              حقوقك كعميل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">الوصول إلى بياناتك</h4>
                  <p className="text-gray-600">يمكنك طلب نسخة من بياناتك الشخصية</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">تصحيح البيانات</h4>
                  <p className="text-gray-600">يمكنك طلب تصحيح أي معلومات غير دقيقة</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">حذف البيانات</h4>
                  <p className="text-gray-600">يمكنك طلب حذف بياناتك الشخصية</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">إلغاء الاشتراك</h4>
                  <p className="text-gray-600">يمكنك إلغاء اشتراكك في أي وقت</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              ملفات تعريف الارتباط (Cookies)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. تشمل:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>ملفات تعريف الارتباط الأساسية لتشغيل الموقع</li>
              <li>ملفات تعريف الارتباط التحليلية لفهم استخدام الموقع</li>
              <li>ملفات تعريف الارتباط التسويقية للعروض المخصصة</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              للتواصل بخصوص الخصوصية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              إذا كان لديك أي أسئلة أو استفسارات بخصوص سياسة الخصوصية، يمكنك التواصل معنا:
            </p>
            <div className="space-y-2">
              <p><strong>البريد الإلكتروني:</strong> privacy@elhamdimport.com</p>
              <p><strong>الهاتف:</strong> +20 2 1234 5678</p>
              <p><strong>العنوان:</strong> القاهرة، مصر</p>
            </div>
          </CardContent>
        </Card>

        {/* Update Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">تحديث السياسة</h3>
              <p className="text-gray-700 mb-4">
                قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم إعلامك بأي تغييرات مهمة عبر البريد الإلكتروني أو من خلال الموقع.
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