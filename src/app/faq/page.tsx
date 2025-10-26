import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle, Car, FileText, CreditCard, Wrench, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة | شركة الحمد لاستيراد السيارات',
  description: 'الإجابة على الأسئلة الأكثر شيوعاً حول سياراتنا وخدماتنا',
}

export default function FAQPage() {
  const faqCategories = [
    {
      title: 'عن السيارات',
      icon: Car,
      questions: [
        {
          q: 'هل السيارات جديدة أم مستعملة؟',
          a: 'نحن نستورد سيارات جديدة بالكامل من المصنعين المعتمدين، مع ضمان المصنع الأصلي.'
        },
        {
          q: 'ما هي الدول التي نستورد منها؟',
          a: 'نستورد السيارات من اليابان، كوريا، ألمانيا، والولايات المتحدة الأمريكية من وكلاء معتمدين.'
        },
        {
          q: 'هل يمكن طلب سيارة معينة؟',
          a: 'نعم، يمكنكم طلب أي سيارة مع المواصفات المطلوبة وسنقوم باستيرادها خصيصاً لكم.'
        },
        {
          q: 'كم تستغرق عملية الاستيراد؟',
          a: 'تستغرق عملية الاستيراد من 4 إلى 8 أسابيع حسب بلد المنشأ والإجراءات الجمركية.'
        }
      ]
    },
    {
      title: 'الضمان والصيانة',
      icon: Wrench,
      questions: [
        {
          q: 'ما هو الضمان المقدم على السيارات؟',
          a: 'نقدم ضماناً شاملاً لمدة سنة أو 20,000 كم، مع إمكانية التمديد لفترات أطول.'
        },
        {
          q: 'أين يمكنني صيانة السيارة؟',
          a: 'لدينا مراكز صيانة معتمدة في جميع المحافظات، بالإضافة إلى الوكلاء المعتمدين من الشركة المصنعة.'
        },
        {
          q: 'هل قطع الغيار أصلية؟',
          a: 'نعم، نستخدم فقط قطع الغيار الأصلية من الشركة المصنعة لضمان الجودة والأداء.'
        },
        {
          q: 'ماذا يغطي الضمان؟',
          a: 'يغطي الضمان جميع الأعطال الميكانيكية والكهربائية، مع استثناء التآكل الطبيعي والأضرار الناتجة عن الحوادث.'
        }
      ]
    },
    {
      title: 'التمويل والدفع',
      icon: CreditCard,
      questions: [
        {
          q: 'هل تقدمون تمويلاً للسيارات؟',
          a: 'نعم، نتعاون مع أكبر البنوك وشركات التمويل لتقديم أفضل شروط التمويل.'
        },
        {
          q: 'ما هي المبالغ المقدمة المطلوبة؟',
          a: 'تتراوح المبالغ المقدمة من 20% إلى 30% حسب نوع السيارة وشروط التمويل.'
        },
        {
          q: 'ما هي طرق الدفع المتاحة؟',
          a: 'نقبل الدفع النقدي، الشيكات، البطاقات الائتمانية، والتحويل البنكي.'
        },
        {
          q: 'هل يمكن التقسيط بدون مقدم؟',
          a: 'بعض السيارات المتوسطة تتوفر فيها خطط تقسيط بدون مقدم للعملاء ذوي السجل الائتماني الجيد.'
        }
      ]
    },
    {
      title: 'الإجراءات والتوثيق',
      icon: FileText,
      questions: [
        {
          q: 'ما هي المستندات المطلوبة للشراء؟',
          a: 'بطاقة الرقم القومي سارية، إثبات العنوان، وإيصال مرتب حديث للموظفين.'
        },
        {
          q: 'هل تتعاملون مع الشركات؟',
          a: 'نعم، لدينا قسم خاص للتعامل مع الشركات وتوفير أساطيل السيارات.'
        },
        {
          q: 'هل السيارات مؤمنة؟',
          a: 'نوفر تأميناً شاملاً على جميع السيارات مع أفضل شركات التأمين في مصر.'
        },
        {
          q: 'ما هي رسوم التسجيل؟',
          a: 'رسوم التسجيل والجمارك مضمنة في السعر النهائي للسيارة.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <HelpCircle className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">الأسئلة الشائعة</h1>
            <p className="text-xl text-gray-600">
              الإجابة على الأسئلة الأكثر شيوعاً حول خدماتنا ومنتجاتنا
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-6 w-6 text-blue-600" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {category.questions.map((item, itemIndex) => (
                      <div key={itemIndex} className="border-b border-gray-100 pb-4 last:border-0">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {item.q}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-6 w-6 text-blue-600" />
                هل لم تجد إجابة سؤالك؟
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                إذا لم تجد إجابة لسؤالك هنا، فلا تتردد في التواصل معنا مباشرة
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="tel:+20212345678" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  اتصل بنا
                </a>
                <a 
                  href="/contact" 
                  className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-center"
                >
                  أرسل استفسار
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}