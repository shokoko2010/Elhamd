import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Shield, CheckCircle, AlertCircle, Users, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'الشروط والأحكام | شركة الحمد للسيارات',
  description: 'الشروط والأحكام الخاصة بخدمات شركة الحمد للسيارات',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-sm">
            <FileText className="w-4 h-4 ml-2" />
            الشروط القانونية
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            الشروط والأحكام
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
           欢迎使用Elhamd Imports汽车进口管理系统。请仔细阅读以下条款和条件。
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                مقدمة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <p className="text-slate-700 leading-relaxed">
                أهلاً بك في شركة الحمد للسيارات. باستخدامك لموقعنا الإلكتروني وخدماتنا، فإنك توافق على الالتزام بالشروط والأحكام المذكورة أدناه. يرجى قراءة هذه الشروط بعناية قبل استخدام أي من خدماتنا.
              </p>
              <p className="text-slate-700 leading-relaxed">
                تمثل هذه الشروط والأحكام اتفاقية قانونية بينك وبين شركة الحمد للسيارات. باستخدامك لموقعنا، فإنك تقر بأنك قرأت وفهمت ووافقت على الالتزام بهذه الشروط.
              </p>
            </CardContent>
          </Card>

          {/* Services Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                شروط الخدمات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">خدمات استيراد السيارات</h3>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>نلتزم بتوفير سيارات عالية الجودة وموثوقة</li>
                  <li>جميع السيارات تخضع لفحص شامل قبل التسليم</li>
                  <li>تتوفر ضمانات على السيارات المستوردة</li>
                  <li>نقدم خدمات التخليص الجمركي والتسجيل</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">خدمات الصيانة</h3>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>نستخدم قطع غيار أصلية ومعتمدة</li>
                  <li>يتمتع الفنيون بخبرة عالية في صيانة السيارات</li>
                  <li>نقدم ضمان على خدمات الصيانة المقدمة</li>
                  <li>متوفر خدمة السيارات المتنقلة للصيانة المنزلية</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                شروط الدفع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">طرق الدفع المقبولة</h3>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>الدفع النقدي في فروعنا</li>
                  <li>بطاقات الائتمان والخصم المباشر</li>
                  <li>التحويل البنكي</li>
                  <li>خطط التمويل المعتمدة</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">شروط السداد</h3>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>يجب إتمام عملية الدفع خلال الفترة المحددة</li>
                  <li>تطبق رسوم تأخير في حالة التأخير في السداد</li>
                  <li>يتم تأكيد الحجز بعد إتمام الدفع</li>
                  <li>يمكن إلغاء الطلب مع استرداد وفق سياسة الإلغاء</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                مسؤوليات المستخدم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-slate-700 list-disc list-inside">
                <li>تقديم معلومات دقيقة وحقيقية</li>
                <li>الحفاظ على سرية حسابك وبياناتك</li>
                <li>عدم استخدام الموقع لأغراض غير قانونية</li>
                <li>الالتزام بالقوانين المحلية والدولية المعمول بها</li>
                <li>عدم محاولة اختراق أو إتلاف الموقع</li>
                <li>احترام الموظفين والعملاء الآخرين</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                تحديد المسؤولية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                لا تتحمل شركة الحمد للسيارات مسؤولية أي أضرار مباشرة أو غير مباشرة تنشأ عن استخدام موقعنا أو خدماتنا. يتم توفير الموقع والخدمات "كما هي" دون أي ضمانات صريحة أو ضمنية.
              </p>
              <p className="text-slate-700 leading-relaxed">
                في أقصى حد يسمح به القانون، تكون مسؤوليتنا الإجمالية عن أي مطالبة محدودة إلى المبلغ الذي دفعته للخدمة المعنية.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                تعديلات الشروط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة وتصبح سارية المفعول فور نشرها. يرجى مراجعة هذه الصفحة بانتظام للبقاء على اطلاع بأي تغييرات.
              </p>
              <p className="text-slate-700 leading-relaxed">
                استمرارك في استخدام موقعنا بعد إجراء أي تغييرات يعتبر قبولاً لهذه التغييرات.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                معلومات الاتصال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                إذا كان لديك أي أسئلة أو استفسارات حول هذه الشروط والأحكام، فلا تتردد في الاتصال بنا:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>البريد الإلكتروني:</strong> info@elhamdimports.com</p>
                <p><strong>الهاتف:</strong> +966 50 123 4567</p>
                <p><strong>العنوان:</strong> الرياض، المملكة العربية السعودية</p>
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className="text-center text-sm text-slate-500 mt-8">
            <p>آخر تحديث: {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}