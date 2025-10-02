import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Eye, Lock, Database, UserCheck, AlertTriangle, Settings } from 'lucide-react'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | شركة الحمد للسيارات',
  description: 'سياسة الخصوصية وحماية البيانات الشخصية في شركة الحمد للسيارات',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-sm">
            <Shield className="w-4 h-4 ml-2" />
            خصوصية وأمان
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            سياسة الخصوصية
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            نحن ملتزمون بحماية خصوصيتك وأمان بياناتك الشخصية. تعرف على كيفية جمع واستخدام和保护您的信息。
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                مقدمة عن الخصوصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <p className="text-slate-700 leading-relaxed">
                في شركة الحمد للسيارات، نحن نقدر ثقتك ونلتزم بحماية خصوصيتك. توضح هذه السياسة كيفية جمعنا واستخدامنا ومشاركتنا لمعلوماتك الشخصية عند استخدامك لموقعنا الإلكتروني وخدماتنا.
              </p>
              <p className="text-slate-700 leading-relaxed">
                نحن نتبع أعلى معايير حماية البيانات ونلتزم بالامتثال للوائح الخصوصية المعمول بها في المملكة العربية السعودية.
              </p>
            </CardContent>
          </Card>

          {/* Information Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                المعلومات التي نجمعها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">المعلومات الشخصية</h3>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>الاسم الكامل ومعلومات الاتصال</li>
                  <li>البريد الإلكتروني ورقم الهاتف</li>
                  <li>العنوان ومعلومات السكن</li>
                  <li>معلومات الهوية الوطنية</li>
                  <li>معلومات الترخيص والقيادة</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">معلومات السيارة</h3>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>نوع وموديل السيارة</li>
                  <li>رقم الهيكل (VIN)</li>
                  <li>معلومات التسجيل</li>
                  <li>تاريخ الصيانة والإصلاحات</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">المعلومات التقنية</h3>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>عنوان IP ونوع المتصفح</li>
                  <li>معلومات الجهاز ونظام التشغيل</li>
                  <li>ملفات تعريف الارتباط (Cookies)</li>
                  <li>بيانات الاستخدام والتفاعل</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                كيف نستخدم معلوماتك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">تقديم الخدمات</h3>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>معالجة طلبات استيراد السيارات</li>
                  <li>حجز مواعيد الصيانة والخدمة</li>
                  <li>توفير عروض أسعار مخصصة</li>
                  <li>إدارة عمليات الدفع والتمويل</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">تحسين الخدمات</h3>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>تحليل استخدام الموقع لتحسين التجربة</li>
                  <li>تطوير خدمات جديدة بناءً على احتياجاتك</li>
                  <li>تخصيص المحتوى والعروض</li>
                  <li>قياس رضا العملاء</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">التواصل معك</h3>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>إرسال تحديثات حول طلباتك</li>
                  <li>توفير معلومات عن الخدمات الجديدة</li>
                  <li>الرد على استفساراتك ومساعدتك</li>
                  <li>إرسال عروض ترويجية ذات صلة</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                حماية البيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">تدابير الأمان</h3>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>تشفير البيانات أثناء النقل والتخزين</li>
                  <li>استخدام جدران الحماية وأنظمة الكشف عن التسلل</li>
                  <li>تقييد الوصول إلى البيانات للموظفين المصرح لهم</li>
                  <li>النسخ الاحتياطي المنتظم للبيانات</li>
                  <li>مراجعات أمنية دورية</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">الاحتفاظ بالبيانات</h3>
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li>نحتفظ بمعلوماتك فقط طالما كانت ضرورية</li>
                  <li>نحذف البيانات الشخصية عند طلبك</li>
                  <li>نلتزم بالفترات القانونية للاحتفاظ بالسجلات</li>
                  <li>نجهز البيانات بشكل آمن عند عدم الحاجة إليها</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                حقوقك كعميل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">حق الوصول</h3>
                <p className="text-slate-700">
                  لديك الحق في معرفة المعلومات الشخصية التي نحتفظ بها عنك وطلب نسخة منها.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">حق التصحيح</h3>
                <p className="text-slate-700">
                  يمكنك طلب تصحيح أي معلومات غير دقيقة أو غير مكتملة.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">حق الحذف</h3>
                <p className="text-slate-700">
                  يمكنك طلب حذف بياناتك الشخصية عند عدم وجود سبب قانوني للاحتفاظ بها.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">حق تقييد المعالجة</h3>
                <p className="text-slate-700">
                  يمكنك طلب تقييد معالجة بياناتك في ظروف معينة.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                مشاركة البيانات مع أطراف ثالثة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                نحن لا نبيع بياناتك الشخصية لأطراف ثالثة. نشارك معلوماتك فقط في الحالات التالية:
              </p>
              <ul className="space-y-2 text-slate-700 list-disc list-inside">
                <li>مع شركاء الخدمة المعتمدين لتنفيذ طلباتك</li>
                <li>مع الجهات الحكومية عند الطلب القانوني</li>
                <li>مع مزودي الدفع لمعالجة المعاملات المالية</li>
                <li>مع شركات الشحن والتأمين عند الضرورة</li>
                <li>مع مزودي الخدمات التقنية لتشغيل الموقع</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                نضمن أن جميع الأطراف الثالثة تلتزم بمعايير الخصوصية والأمان نفسها التي نلتزم بها.
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                ملفات تعريف الارتباط (Cookies)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا:
              </p>
              <ul className="space-y-2 text-slate-700 list-disc list-inside">
                <li>ملفات تعريف الارتباط الأساسية: ضرورية لتشغيل الموقع</li>
                <li>ملفات تعريف الارتباط التحليلية: لفهم كيفية استخدام الموقع</li>
                <li>ملفات تعريف الارتباط الوظيفية: لتذكر تفضيلاتك</li>
                <li>ملفات تعريف الارتباط الترويجية: لتقديم عروض مخصصة</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                معلومات الاتصال للخصوصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية أو تريد ممارسة حقوقك، فلا تتردد في الاتصال بنا:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>مسؤول الخصوصية:</strong> privacy@elhamdimports.com</p>
                <p><strong>الهاتف:</strong> +966 50 123 4567</p>
                <p><strong>العنوان:</strong> الرياض، المملكة العربية السعودية</p>
              </div>
              <p className="text-slate-700 leading-relaxed">
                سنرد على استفساراتك خلال 30 يوماً من استلامها.
              </p>
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