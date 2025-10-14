import { PrismaClient, VehicleCategory, VehicleStatus, FuelType, TransmissionType } from '@prisma/client'

const prisma = new PrismaClient()

async function seedVehicles() {
  console.log('🚗 Seeding vehicles...')
  
  try {
    const vehicles = [
      {
        make: 'Tata Motors',
        model: 'PRIMA 3328.K',
        year: 2024,
        price: 2850000,
        stockNumber: 'TM-PRIMA-3328K-001',
        category: VehicleCategory.COMMERCIAL,
        fuelType: FuelType.DIESEL,
        transmission: TransmissionType.MANUAL,
        status: VehicleStatus.AVAILABLE,
        featured: true,
        description: 'شاحنة Tata Motors Prima 3328.K بقوة 269 حصان وعزم دوران 970 نيوتن.متر، مصممة لأصعب المهام',
        specifications: {
          create: [
            { name: "موديل المحرك", value: "محرك CUMMINS ISBe 270 - ديزل مبرد بالماء، حقن مباشر، مزود بشاحن توربيني ومبرد بعدي." },
            { name: "نوع الجسم", value: "18 Cum" },
            { name: "سعة المحرك", value: "السعة اللترية للمحرك: 6700" },
            { name: "قوة المحرك", value: "قوة المحرك: 266 حصان عند 2500 دورة/دقيقة" },
            { name: "السرعة القصوى", value: "رمز الفرامل: 109" },
            { name: "أقصى عزم الدوران", value: "عزم الدوران: 970 نيوتن.متر عند 1500 دورة/دقيقة" },
            { name: "أقصى قدرة على الصعود", value: "القدرة على التسلق: 21% (الترس الأول)، 32% (زاحف)" },
            { name: "علبة التروس", value: "علبة التروس: ZF، عدد 9 أمامي + 1 خلفي" },
            { name: "نوع قابض المحرك", value: "القابض: 430 ملم" },
            { name: "المقود", value: "نظام التوجيه: هيدروليكي" },
            { name: "الفرامل", value: "الفرامل: هواء مزدوج الدائرة بالكامل - نوع S Cam" },
            { name: "التعليق الأمامي", value: "نظام التعليق الأمامي: نوابض ورقية شبه بيضاوية (Parabolic leaf spring)" },
            { name: "التعليق الخلفي", value: "نظام التعليق الخلفي: نوابض شعاعية مع قضبان مطاطية متعددة ونظام عزم دوران & قضيب V" },
            { name: "الإطارات", value: "مقاس الإطارات: 12R24 - 18PR" },
            { name: "الطول", value: "الوزن الإجمالي للمركبة: 8038 كجم" },
            { name: "العرض", value: "عرض الكابينة: 2590 ملم" },
            { name: "الارتفاع (مم)", value: "طول الصندوق: 3219 ملم" },
            { name: "قاعدة العجلات", value: "الطول الإجمالي: 4570 ملم" },
            { name: "الخلوص الأرضي", value: "ارتفاع الصندوق: 353 ملم" },
            { name: "الحد الأدنى TCR (مم)", value: "الوزن الإجمالي على المحور الخلفي: 9175 كجم" },
            { name: "إجمالي وزن السيارة", value: "الوزن الإجمالي المسموح به: 28500 كجم" },
            { name: "الوزن الفارغ", value: "الوزن على المحور الأمامي: 9570 كجم" },
            { name: "الحد الأقصى المسموح به FAW", value: "الوزن على المحور الخلفي: 7500 كجم" },
            { name: "الحد الأقصى المسموح به RAW", value: "حمولة الصندوق: 21000 كجم" },
            { name: "سعة خزان الوقود", value: "قاعدة العجلات: 365 سم" },
            { name: "تهوية المقصورة", value: "مكيف هواء (AC)" },
            { name: "خيار الجسم", value: "سعة الصندوق: 18 متر مكعب" },
            { name: "قيادة السيارة", value: "6X4" }
          ]
        },
        highlights: [
          { label: "970 نيوتن.متر", value: "" },
          { label: "270 حصان", value: "" },
          { label: "35%", value: "" },
          { label: "260 لتر", value: "" }
        ],
        features: [
          "منحنى عزم دوران ثابت",
          "مكونات موثوقة مثل محرك CUMMINS، علبة تروس ZF، ومحور خلفي TATA RA 109 المجرب والموثوق",
          "كابينة Prima عالمية مريحة بتصميم مريح",
          "توفر قطع الغيار",
          "فرامل عادم المحرك فلتر هواء من مرحلتين",
          "نظام التعليق الخلفي (Bogie)"
        ]
      },
      {
        make: 'Tata Motors',
        model: 'LP 613',
        year: 2024,
        price: 1850000,
        stockNumber: 'TM-LP-613-001',
        category: VehicleCategory.COMMERCIAL,
        fuelType: FuelType.DIESEL,
        transmission: TransmissionType.MANUAL,
        status: VehicleStatus.AVAILABLE,
        featured: true,
        description: 'حافلة تاتا LP 613 بمحرك 130 حصان، مثالية لتنقلات الموظفين والمدارس والرحلات',
        specifications: JSON.stringify({
          "موديل المحرك": "Tata 697 TCIC E3",
          "نوع المحرك": "‏ديزل",
          "نوع الجسم": "‏هيكل حافلة",
          "سعة المحرك": "‏5675 سم³",
          "قوة المحرك": "‏130 حصان عند 2400 دورة/دقيقة",
          "أقصى خرج للمحرك": "‏130 حصان عند 2400 دورة/دقيقة",
          "عدد الاسطوانات": "‏6 أسطوانات",
          "اسطوانات / الإزاحة": "‏6 / 5675 سم³",
          "السرعة القصوى": "‏112 كم/ساعة",
          "انبعاث": "‏يورو 3",
          "أقصى عزم الدوران": "‏430 نيوتن.متر عند 1400-1800 دورة/دقيقة",
          "أقصى قدرة على الصعود": "25%",
          "نوع النقل": "‏Tata GBS40 سنكرومش",
          "عدد العتاد": "‏5 أمامي + 1 خلفي",
          "علبة التروس": "‏Tata GBS40، يدوي",
          "نوع قابض المحرك": "‏نوع جاف، صفيحة واحدة",
          "القطر الخارجي لبطانة القابض": "‏قطر 310 مم",
          "المقود": "‏نظام توجيه هيدروليكي متكامل",
          "الفرامل": "‏فرامل هوائية مزدوجة الدائرة مع ABS",
          "الفرامل الأمامية": "‏طبلة",
          "الفرامل الخلفية": "‏طبلة",
          "قطر طبلة الفرامل": "‏325 مم",
          "تعليق": "‏نوابض صفائحية شبه بيضاوية أمامية وخلفية مع عمود مقاوم للانقلاب"
        }),
        highlights: JSON.stringify([
          { label: "130 حصان", value: "" },
          { label: "430 نيوتن.متر", value: "" },
          { label: "215/75 R17.5", value: "" },
          { label: "120 لتر", value: "" }
        ]),
        features: JSON.stringify([
          "عزم دوران عالي يبلغ 430 نيوتن.متر ضمن نطاق واسع بين 1400–1800 دورة في الدقيقة",
          "نوابض ورقية شبه بيضاوية أمامية وخلفية",
          "شريط مقاومة الانقلاب (Anti roll bar) أمامي وخلفي",
          "محرك Euro 3 بدون نظام DEF (سائل العادم)",
          "قدرة تسلق تبلغ 25%",
          "توفر قطع الغيار"
        ])
      },
      {
        make: 'Tata Motors',
        model: 'ULTRA T.9',
        year: 2024,
        price: 1250000,
        stockNumber: 'TM-ULTRA-T9-001',
        category: VehicleCategory.COMMERCIAL,
        fuelType: FuelType.DIESEL,
        transmission: TransmissionType.MANUAL,
        status: VehicleStatus.AVAILABLE,
        featured: true,
        description: 'شاحنة Tata Ultra T.9 بمحرك 155 حصان وتقنية متقدمة للنقل والخدمات اللوجستية',
        specifications: JSON.stringify({
          "موديل المحرك": "NG3.3L CR EIV",
          "نوع المحرك": "اشتعال الضغط، EURO-4",
          "نوع الجسم": "مقصورة وهيكل قاعدي",
          "سعة المحرك": "3300 سي سي",
          "أقصى خرج للمحرك": "155 Ps @ 2600 rpm",
          "عدد الاسطوانات": "4 مضمنة",
          "اسطوانات / الإزاحة": "4 سلندر، 3300 سي سي",
          "السرعة القصوى": "105 كم في الساعة",
          "انبعاث": "EuroIV",
          "أقصى عزم الدوران": "450 نيوتن متر عند 2200-1500 دورة في الدقيقة",
          "أقصى قدرة على الصعود": "37%",
          "إمكانية إعادة تشغيل الدرجة": "31.31%",
          "نوع النقل": "يدوي",
          "عدد العتاد": "6 للأمام +1 للخلف",
          "علبة التروس": "Tata G550 متزامن",
          "FGR": "6.9",
          "نوع قابض المحرك": "لوحة واحدة من نوع الاحتكاك الجاف، مساعدة بتعزيز",
          "القطر الخارجي لبطانة القابض": "330 ملم",
          "المقود": "Integrated Hydraulic Power",
          "الفرامل": "فرامل هوائية S-cam كاملة الدائرة مزدوجة ABS +",
          "الفرامل الأمامية": "طبل 325X120 ملم",
          "الفرامل الخلفية": "طبل 325X120 ملم",
          "قطر طبلة الفرامل": "325 ملم",
          "تعليق": "زنبرك أوراق مكافئ وشبه إهليلجي"
        }),
        highlights: JSON.stringify([
          { label: "155 حصان", value: "" },
          { label: "450 نيوتن.متر", value: "" },
          { label: "215/75 R17.5", value: "" },
          { label: "120 لتر", value: "" }
        ]),
        features: JSON.stringify([
          "محرك NG سعة 3.3 لتر، سكة حديد مشتركة، TCIC Euro-IV",
          "High Torque of 450Nm @ 1500-2000 rpm",
          "فرامل S-cam هوائية كاملة الدائرة مزدوجة مع نظام فرامل مانع للانغلاق",
          "صندوق تروس متزامن Tata G550 (6F+1R) مع آلية نقل الكابلال",
          "زنبرك ورقي مكافئ وشبه بيضاوي"
        ])
      },
      {
        make: 'Tata Motors',
        model: 'XENON SC',
        year: 2024,
        price: 650000,
        stockNumber: 'TM-XENON-SC-001',
        category: VehicleCategory.TRUCK,
        fuelType: FuelType.DIESEL,
        transmission: TransmissionType.MANUAL,
        status: VehicleStatus.AVAILABLE,
        featured: true,
        description: 'تاتا زينون X2 SC بمحرك 150 حصان، تجمع بين القوة والمتانة للأعمال التجارية',
        specifications: JSON.stringify({
          "موديل المحرك": "محرك ديزل TATA 2.2L DICOR Euro IV بالحقن المباشر للسكك الحديدية المشتركة بشاحن توربيني",
          "سعة المحرك": "2179",
          "قوة المحرك": "320 نيوتن متر @ 1500-3000 دورة في الدقيقة",
          "أقصى خرج للمحرك": "150 حصان عند 4000 دورة في الدقيقة",
          "عدد الاسطوانات": "4 مضمنة",
          "السرعة القصوى": "160 كم/ساعة",
          "انبعاث": "E4",
          "أقصى عزم الدوران": "320 نيوتن متر @ 1500-3000 دورة في الدقيقة",
          "أقصى قدرة على الصعود": "41%",
          "إمكانية إعادة تشغيل الدرجة": "21%",
          "عدد العتاد": "5 للأمام + 1 للخلف",
          "علبة التروس": "GBS -76-5/4.10 - علبة تروس MK - II مع زيادة السرعة",
          "نوع قابض المحرك": "560 سم مربع",
          "القطر الخارجي لبطانة القابض": "260 ملم",
          "المقود": "توجيه الجريدة المسننة والترس الصغير بمساعدة الطاقة (هيدروليكي)",
          "الفرامل": "مكابح قرصية مهواة مع فرجار بوعاء مزدوج",
          "الفرامل الأمامية": "مكابح قرصية",
          "الفرامل الخلفية": "فرامل الأسطوانة",
          "قطر طبلة الفرامل": "282 ملم",
          "تعليق": "نوع عظم الترقوة الأمامي المزدوج مع نابض لفائف فوق ممتص الصدمات."
        }),
        highlights: JSON.stringify([
          { label: "41%", value: "" },
          { label: "1280 كجم", value: "" },
          { label: "70 لتر", value: "" },
          { label: "320 نيوتن.متر", value: "" }
        ]),
        features: JSON.stringify([
          "الطاقة والالتقاط",
          "محرك 2179cc",
          "قابلية عالية للتصنيف",
          "التوجيه بمساعدة الطاقة الكهربائية"
        ])
      }
    ]

    for (const vehicle of vehicles) {
      const createdVehicle = await prisma.vehicle.create({
        data: {
          ...vehicle,
          images: {
            create: [
              {
                imageUrl: `/uploads/vehicles/${vehicle.model.replace(/\s+/g, '-')}-1.jpg`,
                isPrimary: true,
                altText: `${vehicle.make} ${vehicle.model} - Image 1`,
                order: 0
              }
            ]
          }
        }
      })
      console.log(`✅ Created vehicle: ${createdVehicle.make} ${createdVehicle.model}`)
    }

    console.log('✅ Vehicles seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding vehicles:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedVehicles()