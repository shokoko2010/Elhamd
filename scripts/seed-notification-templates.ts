import { PrismaClient, EmailTemplateType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding notification templates...')

  const templates = [
    {
      name: 'تأكيد حجز اختبار القيادة',
      subject: 'تأكيد حجز اختبار القيادة - {{dealershipName}}',
      content: `
عزيزي/عزيزتي {{customerName}},

نشكرك على حجز اختبار القيادة مع {{dealershipName}}.

تفاصيل الحجز:
- التاريخ: {{bookingDate}}
- الوقت: {{bookingTime}}
- المركبة: {{vehicleMake}} {{vehicleModel}} {{vehicleYear}}
- الفرع: {{branchName}}

يرجى الوصول قبل 15 دقيقة من الموعد المحدد.

إذا كنت بحاجة إلى تغيير أو إلغاء الحجز، يرجى الاتصال بنا على {{phoneNumber}}.

مع أطيب التحيات،
فريق {{dealershipName}}
      `.trim(),
      type: EmailTemplateType.BOOKING_CONFIRMATION
    },
    {
      name: 'تذكير باختبار القيادة',
      subject: 'تذكير باختبار القيادة غداً - {{dealershipName}}',
      content: `
عزيزي/عزيزتي {{customerName}},

هذا تذكير باختبار القيادة المقرر غداً.

تفاصيل الحجز:
- التاريخ: {{bookingDate}}
- الوقت: {{bookingTime}}
- المركبة: {{vehicleMake}} {{vehicleModel}} {{vehicleYear}}
- العنوان: {{branchAddress}}

يرجى إحضار رخصة القيادة الخاصة بك.

نتطلع لرؤيتك!
فريق {{dealershipName}}
      `.trim(),
      type: EmailTemplateType.BOOKING_REMINDER
    },
    {
      name: 'شكراً بعد اختبار القيادة',
      subject: 'شكراً لاختبار القيادة - {{dealershipName}}',
      content: `
عزيزي/عزيزتي {{customerName}},

نشكرك على اختيار {{dealershipName}} لاختبار القيادة.

نأمل أن تكون تجربتك ممتعة مع {{vehicleMake}} {{vehicleModel}} {{vehicleYear}}.

إذا كان لديك أي أسئلة أو كنت مهتماً بمعرفة المزيد عن سياراتنا، فلا تتردد في الاتصال بنا.

يمكنك أيضاً زيارة موقعنا الإلكتروني: {{websiteUrl}}

مع أطيب التحيات،
فريق المبيعات
{{dealershipName}}
      `.trim(),
      type: EmailTemplateType.WELCOME
    },
    {
      name: 'تأكيد حجز خدمة الصيانة',
      subject: 'تأكيد حجز خدمة الصيانة - {{dealershipName}}',
      content: `
عزيزي/عزيزتي {{customerName}},

تم تأكيد حجز خدمة الصيانة الخاصة بك.

تفاصيل الحجز:
- التاريخ: {{serviceDate}}
- الوقت: {{serviceTime}}
- نوع الخدمة: {{serviceType}}
- المركبة: {{vehicleMake}} {{vehicleModel}} {{vehicleYear}}
- رقم اللوحة: {{licensePlate}}
- الفرع: {{branchName}}

يرجى إحضار المركبة في الوقت المحدد.

إذا كنت بحاجة إلى تغيير أو إلغاء الحجز، يرجى الاتصال بخدمة العملاء على {{servicePhone}}.

مع أطيب التحيات،
فريق خدمة العملاء
{{dealershipName}}
      `.trim(),
      type: EmailTemplateType.BOOKING_CONFIRMATION
    },
    {
      name: 'تذكير بخدمة الصيانة',
      subject: 'تذكير بموعد الصيانة - {{dealershipName}}',
      content: `
عزيزي/عزيزتي {{customerName}},

هذا تذكير بموعد صيانة مركبتك.

تفاصيل الموعد:
- التاريخ: {{serviceDate}}
- الوقت: {{serviceTime}}
- نوع الخدمة: {{serviceType}}
- المركبة: {{vehicleMake}} {{vehicleModel}} {{vehicleYear}}
- رقم اللوحة: {{licensePlate}}

الصيانة الدورية تساعد في الحفاظ على أداء مركبتك وسلامتها.

نراك قريباً!
فريق خدمة العملاء
{{dealershipName}}
      `.trim(),
      type: EmailTemplateType.BOOKING_REMINDER
    },
    {
      name: 'اكتمال خدمة الصيانة',
      subject: 'اكتملت خدمة الصيانة - {{dealershipName}}',
      content: `
عزيزي/عزيزتي {{customerName}},

نود إعلامك بأن خدمة الصيانة لمركبتك قد اكتملت.

تفاصيل الخدمة:
- تاريخ الخدمة: {{serviceDate}}
- نوع الخدمة: {{serviceType}}
- المركبة: {{vehicleMake}} {{vehicleModel}} {{vehicleYear}}
- رقم اللوحة: {{licensePlate}}
- التكلفة: {{serviceCost}}
- ملاحظات: {{serviceNotes}}

مركبتك جاهزة للاستلام. يمكنك استلامها من فرع {{branchName}} خلال ساعات العمل.

إذا كان لديك أي استفسارات، يرجى الاتصال بنا على {{servicePhone}}.

شكراً لثقتك بـ {{dealershipName}}.
فريق خدمة العملاء
      `.trim(),
      type: EmailTemplateType.WELCOME
    },
    {
      name: 'عرض خاص جديد',
      subject: 'عرض خاص على {{vehicleMake}} {{vehicleModel}} - {{dealershipName}}',
      content: `
عزيزي/عزيزتي {{customerName}},

يسرنا أن نقدم لك عرضاً خاصاً على {{vehicleMake}} {{vehicleModel}} {{vehicleYear}}.

تفاصيل العرض:
- المركبة: {{vehicleMake}} {{vehicleModel}} {{vehicleYear}}
- السعر الأصلي: {{originalPrice}}
- السعر الخاص: {{specialPrice}}
- الوفر: {{savingsAmount}}
- مدة العرض: حتى {{offerExpiryDate}}

هذا العرض محدود وينتهي في {{offerExpiryDate}}.

لا تفوت هذه الفرصة الرائعة! قم بزيارتنا اليوم أو احجز موعداً لاختبار القيادة.

للمزيد من المعلومات أو لحجز موعد، اتصل بنا على {{salesPhone}} أو زر موقعنا: {{websiteUrl}}

مع أطيب التحيات،
فريق المبيعات
{{dealershipName}}
      `.trim(),
      type: EmailTemplateType.PROMOTION
    },
    {
      name: 'تحديث حالة الطلب',
      subject: 'تحديث حالة طلبك - {{dealershipName}}',
      content: `
عزيزي/عزيزتي {{customerName}},

نود إعلامك بتحديث حالة طلبك.

تفاصيل الطلب:
- رقم الطلب: {{orderNumber}}
- المركبة: {{vehicleMake}} {{vehicleModel}} {{vehicleYear}}
- الحالة الحالية: {{orderStatus}}
- تاريخ التحديث: {{updateDate}}

تهانينا! تمت الموافقة على طلبك. سيتواصل معك فريق المبيعات قريباً لاستكمال الإجراءات.

إذا كان لديك أي استفسارات، يرجى الاتصال بنا على {{salesPhone}}.

مع أطيب التحيات،
فريق المبيعات
{{dealershipName}}
      `.trim(),
      type: EmailTemplateType.WELCOME
    },
    {
      name: 'مراجعة الخدمة',
      subject: 'كيف كانت تجربتك مع خدمتنا - {{dealershipName}}',
      content: `
عزيزي/عزيزتي {{customerName}},

نأمل أن تكون تجربتك مع خدمة الصيانة في {{dealershipName}} قد كانت مرضية.

تفاصيل الخدمة:
- تاريخ الخدمة: {{serviceDate}}
- نوع الخدمة: {{serviceType}}
- المركبة: {{vehicleMake}} {{vehicleModel}} {{vehicleYear}}
- الفرع: {{branchName}}

رأيك مهم جداً لنا! يساعدنا على تحسين خدماتنا وتقديم تجربة أفضل لك.

يرجى تخصيص بضع دقائق لمشاركة تجربتك من خلال الرابط التالي:
{{reviewLink}}

إذا كان لديك أي ملاحظات أو اقتراحات، فلا تتردد في مشاركتها معنا.

شكراً لاختيارك {{dealershipName}}.
فريق خدمة العملاء
      `.trim(),
      type: EmailTemplateType.WELCOME
    },
    {
      name: 'تذكير تجديد التأمين',
      subject: 'تذكير بتجديد تأمين مركبتك - {{dealershipName}}',
      content: `
عزيزي/عزيزتي {{customerName}},

هذا تذكير بتجديد تأمين مركبتك الذي سينتهي قريباً.

تفاصيل التأمين:
- المركبة: {{vehicleMake}} {{vehicleModel}} {{vehicleYear}}
- رقم اللوحة: {{licensePlate}}
- تاريخ انتهاء التأمين الحالي: {{currentExpiryDate}}
- شركة التأمين الحالية: {{currentInsuranceCompany}}

التأمين الساري مطلوب قانوناً ويحميك من المخاطر.

يمكنك تجديد التأمين من خلال:
1. زيارة فرع {{branchName}}
2. الاتصال بنا على {{insurancePhone}}
3. زيارة موقعنا: {{websiteUrl}}

لمساعدتك في تجديد التأمين أو الحصول على عروض من شركات تأمين مختلفة، يرجى التواصل معنا.

مع أطيب التحيات،
فريق التأمين
{{dealershipName}}
      `.trim(),
      type: EmailTemplateType.BOOKING_REMINDER
    }
  ]

  for (const template of templates) {
    try {
      await prisma.emailTemplate.upsert({
        where: { name: template.name },
        update: template,
        create: template
      })
      console.log(`Created/updated template: ${template.name}`)
    } catch (error) {
      console.error(`Error creating template ${template.name}:`, error instanceof Error ? error.message : error)
    }
  }

  console.log('Notification templates seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })