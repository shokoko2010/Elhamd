import { PrismaClient } from '@prisma/client'
import { db } from '../src/lib/db'

interface TataVehicle {
  title: string
  description: string
  category: string
  fuelType: string
  transmission: string
  specifications: Record<string, string>
  highlights: Array<{label: string, value: string}>
  features: string[]
  images: string[]
}

const tataCommercialVehicles: TataVehicle[] = [
  {
    title: 'PRIMA 3328.K',
    description: 'شاحنة Tata Motors Prima 3328.K هي شاحنة قوية صُممت للتعامل مع أصعب المهام، مما يضمن سرعة في الإنجاز وتقليل تكاليف الصيانة. تعمل الشاحنة بمحرك Cummins ISBe مبرد بالماء، بحقن مباشر، مزود بشاحن توربيني ومبرد لاحق، ديزل، يولد قدرة قصوى تبلغ 269 حصان عند 2500 دورة/دقيقة، وعزم دوران أقصى 970 نيوتن.متر.',
    category: 'HEAVY_COMMERCIAL',
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    specifications: {
      "موديل المحرك": "محرك CUMMINS ISBe 270 - ديزل مبرد بالماء، حقن مباشر، مزود بشاحن توربيني ومبرد بعدي.",
      "نوع الجسم": "18 Cum",
      "سعة المحرك": "6700 سم³",
      "قوة المحرك": "266 حصان عند 2500 دورة/دقيقة",
      "أقصى عزم الدوران": "970 نيوتن.متر عند 1500 دورة/دقيقة",
      "أقصى قدرة على الصعود": "21% (الترس الأول)، 32% (زاحف)",
      "علبة التروس": "ZF، عدد 9 أمامي + 1 خلفي",
      "نظام التوجيه": "هيدروليكي",
      "الفرامل": "هواء مزدوج الدائرة بالكامل - نوع S Cam",
      "الإطارات": "12R24 - 18PR",
      "الوزن الإجمالي المسموح به": "28500 كجم",
      "حمولة الصندوق": "21000 كجم",
      "سعة خزان الوقود": "260 لتر",
      "نظام التعليق الأمامي": "نوابض ورقية شبه بيضاوية",
      "نظام التعليق الخلفي": "نوابض شعاعية مع قضبان مطاطية متعددة ونظام عزم دوران & قضيب V"
    },
    highlights: [
      {label: "عزم الدوران", value: "970 نيوتن.متر"},
      {label: "قوة المحرك", value: "270 حصان"},
      {label: "قدرة الصعود", value: "35%"},
      {label: "سعة الوقود", value: "260 لتر"}
    ],
    features: [
      "منحنى عزم دوران ثابت عبر نطاق RPM واسع، وكفاءة عالية في استهلاك الوقود",
      "مكونات موثوقة مثل محرك CUMMINS، علبة تروس ZF، ومحور خلفي TATA RA 109 المجرب والموثوق",
      "كابينة Prima عالمية مريحة بتصميم مريح",
      "توفر قطع الغيار وسهولة في الصيانة",
      "فرامل عادم المحرك وفلتر هواء من مرحلتين",
      "نظام التعليق الخلفي (Bogie) لقدرة أعلى على حمل الأحمال"
    ],
    images: [
      "/uploads/vehicles/PRIMA-3328.K-1.jpg",
      "/uploads/vehicles/prima-3328k-1.jpg",
      "/uploads/vehicles/prima-3328k-2.jpg"
    ]
  },
  {
    title: 'LPT 1618',
    description: 'تم تصميم تاتا LPT 1618 لإعادة تعريف الأداء والموثوقية، ويجسد القوة والدقة. مدعوم بمحرك تاتا كمنز B5.9، 6 أسطوانات يورو II المثبت، يولد هذا المحرك قوة عالية قدرها 179 حصان عند 2500 دورة في الدقيقة وعزم دوران أقصى قدره 650 نيوتن متر.',
    category: 'LIGHT_COMMERCIAL',
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    specifications: {
      "موديل المحرك": "CUMMINS B5.9-180 20",
      "نوع المحرك": "محرك ديزل بالحقن المباشر مبرد بالماء مع مبرد داخلي",
      "سعة المحرك": "5883 سم³",
      "أقصى خرج للمحرك": "132 كيلو واط (176.9 حصان) عند 2500 دورة في الدقيقة",
      "عدد الاسطوانات": "6 مضمنة",
      "السرعة القصوى": "120 كم/ساعة",
      "انبعاث": "يورو 2",
      "أقصى عزم الدوران": "650 نيوتن متر (66.2 ملليغرام) عند 1500 دورة في الدقيقة",
      "أقصى قدرة على الصعود": "27%",
      "علبة التروس": "Tata G600-6/6.58",
      "عدد العتاد": "6 للأمام + 1 للخلف",
      "نظام التوجيه": "طاقة هيدروليكية متكاملة",
      "الفرامل": "مكابح S - Cam هوائية كاملة مزدوجة الدائرة",
      "الإطارات": "11R22.5- 16PR",
      "الوزن الإجمالي": "16200 كجم",
      "الحمولة القصوى": "10325 كجم",
      "سعة خزان الوقود": "350 لتر"
    },
    highlights: [
      {label: "عزم الدوران", value: "650 نيوتن متر"},
      {label: "قوة المحرك", value: "178 حصان"},
      {label: "قدرة الصعود", value: "27%"},
      {label: "سعة الوقود", value: "350لتر"}
    ],
    features: [
      "محرك TATA CUMMINS B5.9 سداسي الأسطوانات لتقليل تكلفة الصيانة",
      "فرامل S - CAM هوائية بالكامل للصيانة المنخفضة والموثوقية",
      "علبة تروس تاتا G600 متينة لتقليل جهد تغيير السرعات",
      "نوابض متعددة شرائحية شبه إهليلجية في الأمام والخلف",
      "مكابح موثوقة وفعّالة لزيادة الأمان"
    ],
    images: [
      "/uploads/vehicles/LPT-1618-1.jpg"
    ]
  },
  {
    title: 'LPT 613',
    description: 'تاتا LPT 613 هي مركبة تجارية قوية ومتعددة الاستخدامات مصممة لإعادة تعريف الأداء والموثوقية في مشهد النقل. مدعومة بمحرك تاتا 697 TCIC مبرد بالماء، حقن مباشر، ذو شاحن توربيني، والذي ينتج قوة قصوى قدرها 130 حصان عند 2400 دورة في الدقيقة وعزم دوران أقصى قدره 416 نيوتن متر.',
    category: 'LIGHT_COMMERCIAL',
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    specifications: {
      "موديل المحرك": "TATA 697 TCIC",
      "نوع المحرك": "محرك ديزل بالحقن المباشر مبرد بالماء مع مبرد داخلي",
      "سعة المحرك": "5675 سم³",
      "أقصى خرج للمحرك": "130 Ps@ 2400rpm",
      "عدد الاسطوانات": "6 مضمنة",
      "السرعة القصوى": "112 كم/ساعة",
      "انبعاث": "يورو 2",
      "أقصى عزم الدوران": "430 نيوتن متر @ 1350-1800 دورة في الدقيقة",
      "أقصى قدرة على الصعود": "36%",
      "عدد العتاد": "5 للأمام + 1 للخلف",
      "علبة التروس": "GBS 40 synchromesh",
      "الفرامل": "مكابح S - Cam هوائية كاملة مزدوجة الدائرة",
      "الإطارات": "7.50R16 14PR طبقة شعاعية",
      "الوزن الإجمالي": "7500 كجم",
      "الوزن الفارغ": "3060 كجم",
      "سعة خزان الوقود": "90 لتر"
    },
    highlights: [
      {label: "عزم الدوران", value: "416 نيوتن متر"},
      {label: "قوة المحرك", value: "130 حصان"},
      {label: "سعة الوقود", value: "120 لتر"},
      {label: "قدرة الصعود", value: "36%"}
    ],
    features: [
      "محرك ديزل TATA 697 TCIC بحقن مباشر ومبرد بالماء مزوّد بمبرّد داخلي",
      "فرامل كاملة الهواء من نوع S-cam للصيانة المنخفضة والموثوقية العالية",
      "نوابض متعددة شبه بيضاوية في الأمام والخلف مع نوابض مساعدة في الخلف فقط",
      "ناقل حركة GBS 40 بتقنية السينكروميش لتقليل جهد تغيير السرعات",
      "قابلية تسلق عالية لسهولة نقل الأحمال على الطرق المنحدرة"
    ],
    images: [
      "/uploads/vehicles/LPT-613-1.jpg",
      "/uploads/vehicles/LP-613-1.jpg",
      "/uploads/vehicles/lp-613-2.jpg"
    ]
  },
  {
    title: 'LPT613 TIPPER',
    description: 'تعد تاتا LPT 613 صندوق القلاب شاحنة تجارية خفيفة استثنائية مصممة لتعزيز قدراتك في النقل. تتميز هذه الشاحنة بمحرك Cummins B5.9 مبرد بالماء، حقن مباشر، ديزل، والذي ينتج قوة قصوى قدرها 130 حصان عند 2400 دورة في الدقيقة وعزم دوران قدره 416 نيوتن متر.',
    category: 'LIGHT_COMMERCIAL',
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    specifications: {
      "موديل المحرك": "CUMMINS B5.9-180 20",
      "نوع المحرك": "ديزل بحقن مباشر وتبريد بالماء مع مبرّد داخلي (Intercooler)",
      "سعة المحرك": "5675 سم³",
      "أقصى خرج للمحرك": "95 كيلوواط عند 2400 دورة/دقيقة",
      "عدد الاسطوانات": "6 أسطوانات متراصة (Inline)",
      "السرعة القصوى": "112 كم/س",
      "انبعاث": "Euro II",
      "أقصى عزم الدوران": "416 نيوتن متر عند 1400–1700 دورة/دقيقة",
      "أقصى قدرة على الصعود": "36%",
      "عدد العتاد": "5 أمامية + 1 خلفية",
      "علبة التروس": "GBS 40 سنكروميش",
      "الفرامل": "مزدوجة الدائرة، فرامل هوائية كاملة من نوع S-cam",
      "الإطارات": "7.50R16 14PR، نوع شعاعي",
      "الوزن الإجمالي": "7500 كجم",
      "سعة خزان الوقود": "90 لتر"
    },
    highlights: [
      {label: "عزم الدوران", value: "416"},
      {label: "قوة المحرك", value: "130 حصان"},
      {label: "قدرة الصعود", value: "36%"},
      {label: "سعة الوقود", value: "90L"}
    ],
    features: [
      "محرك ديزل TATA 697 TCIC، تبريد بالماء، حقن مباشر مزوّد بمبرّد داخلي",
      "فرامل هوائية كاملة من نوع S-cam للصيانة المنخفضة والموثوقية العالية",
      "نوابض نصف بيضاوية متعددة الأوراق في الأمام والخلف، مع نوابض إضافية في الخلف فقط",
      "ناقل حركة GBS 40 سنكروميش للمتانة والموثوقية",
      "القدرة على التسلق لسهولة نقل الحمولات على الطرق المنحدرة"
    ],
    images: [
      "/uploads/vehicles/lpt613-tipper-1.jpg"
    ]
  },
  {
    title: 'ULTRA T.7',
    description: 'وجّه نجاح أعمالك مع Tata Ultra T.7 مدعومة بمحرك NG3.3L CR EIV المجرب، تولد قوة قدرها 155 حصان عند 2600 دورة/دقيقة، وعزم دوران يبلغ 450 نيوتن.متر، ما يضمن أداءً استثنائيًا في عمليات النقل والخدمات اللوجستية.',
    category: 'LIGHT_COMMERCIAL',
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    specifications: {
      "موديل المحرك": "NG3.3L CR EIV",
      "نوع المحرك": "اشتعال الضغط، EURO-4",
      "سعة المحرك": "3300 سي سي",
      "أقصى خرج للمحرك": "155 Ps @ 2600 rpm",
      "عدد الاسطوانات": "4 مضمنة",
      "السرعة القصوى": "105 كم في الساعة",
      "انبعاث": "EuroIV",
      "أقصى عزم الدوران": "450 نيوتن متر عند 2200-1500 دورة في الدقيقة",
      "أقصى قدرة على الصعود": "45%",
      "عدد العتاد": "6 للأمام +1 للخلف",
      "علبة التروس": "Tata G550 متزامن",
      "الفرامل": "فرامل هوائية S-cam كاملة الدائرة مزدوجة + ABS + ESP",
      "الإطارات": "215/75R 17.5",
      "الوزن الإجمالي": "6450 kg",
      "الحمولة القصوى": "3480 kg",
      "سعة خزان الوقود": "90 L"
    },
    highlights: [
      {label: "قوة المحرك", value: "155 حصان"},
      {label: "عزم الدوران", value: "450 نيوتن.متر"},
      {label: "الإطارات", value: "215/75 R17.5"},
      {label: "سعة الوقود", value: "90 لتر"}
    ],
    features: [
      "محرك NG سعة 3.3 لتر، سكة حديد مشتركة، TCIC Euro-IV",
      "عزم دوران عالي يصل إلى 450 نيوتن متر عند 1500-2000 دورة في الدقيقة",
      "فرامل S-cam هوائية كاملة الدائرة مزدوجة مع نظام فرامل مانع للانغلاق + برنامج الثبات الإلكتروني",
      "علبة تروس متزامن Tata G550 (6F+1R) مع آلية نقل الكابل",
      "زنبرك ورقي مكافئ وشبه بيضاوي لتكلفة صيانة منخفضة"
    ],
    images: [
      "/uploads/vehicles/ULTRA-T.7-1.jpg",
      "/uploads/vehicles/ultra-t7-1.jpg"
    ]
  },
  {
    title: 'ULTRA T.9',
    description: 'تخطَّ أصعب المهام مع الاعتمادية العالية لشاحنة Tata Ultra T.9، المصممة لرحلات لا تتوقف وسرعة دوران أعلى. مزوّدة بمحرك 3.3L NG Common Rail TCIC يولّد 155 حصان عند 2600 دورة/دقيقة، مع 450 نيوتن.متر من عزم الدوران لتحقيق أداء عالي في مختلف العمليات.',
    category: 'LIGHT_COMMERCIAL',
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    specifications: {
      "موديل المحرك": "NG3.3L CR EIV",
      "نوع المحرك": "EURO- 4",
      "سعة المحرك": "3300 سي سي",
      "أقصى خرج للمحرك": "155 Ps عند 2600 دورة في الدقيقة",
      "عدد الاسطوانات": "4 مضمنة",
      "السرعة القصوى": "105 كم في الساعة",
      "انبعاث": "EuroIV",
      "أقصى عزم الدوران": "450 نيوتن متر عند 2200-1500 دورة في الدقيقة",
      "أقصى قدرة على الصعود": "37%",
      "عدد العتاد": "6 للأمام +1 للخلف",
      "علبة التروس": "Tata G550 متزامن",
      "الفرامل": "فرامل هوائية S-cam كاملة الدائرة مزدوجة ABS +",
      "الإطارات": "215/75R 17.5",
      "الوزن الإجمالي": "8990 kg",
      "الحمولة القصوى": "5620 kg",
      "سعة خزان الوقود": "120 L"
    },
    highlights: [
      {label: "قوة المحرك", value: "155 حصان"},
      {label: "عزم الدوران", value: "450 نيوتن.متر"},
      {label: "الإطارات", value: "215/75 R17.5"},
      {label: "سعة الوقود", value: "120 لتر"}
    ],
    features: [
      "محرك NG سعة 3.3 لتر، سكة حديد مشتركة، TCIC Euro-IV",
      "High Torque of 450Nm @ 1500-2000 rpm لأفضل عزم دوران في فئته",
      "فرامل S-cam هوائية كاملة الدائرة مزدوجة مع نظام فرامل مانع للانغلاق",
      "صندوق تروس متزامن Tata G550 (6F+1R) مع آلية نقل الكابل",
      "زنبرك ورقي مكافئ وشبه بيضاوي لتكلفة صيانة منخفضة"
    ],
    images: [
      "/uploads/vehicles/ULTRA-T.9-1.jpg",
      "/uploads/vehicles/ultra-t9-1.jpg"
    ]
  },
  {
    title: 'XENON SC',
    description: 'يجمع تاتا زينون X2 SC بين القوة والمتانة، ما يوفّر أداءً معززًا ويساهم في زيادة الأرباح. مدعوم بمحرك تاتا 2.2 لتر DICOR يورو IV، ديزل، حقن مباشر، سكة وقود مشتركة، مزود بشاحن توربيني ومبرد داخلي، يولد 150 حصان عند 4000 دورة/دقيقة وعزم دوران أقصى يبلغ 320 نيوتن.متر.',
    category: 'PICKUP',
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    specifications: {
      "موديل المحرك": "محرك ديزل TATA 2.2L DICOR Euro IV بالحقن المباشر للسكك الحديدية المشتركة بشاحن توربيني",
      "سعة المحرك": "2179",
      "قوة المحرك": "320 نيوتن متر @ 1500-3000 دورة في الدقيقة",
      "أقصى خرج للمحرك": "150 حصان عند 4000 دورة في الدقيقة",
      "عدد الاسطوانات": "4 مضمنة",
      "السرعة القصوى": "160 كم/ساعة",
      "انبعاث": "E4",
      "أقصى عزم الدوران": "320 نيوتن متر @ 1500-3000 دورة في الدقيقة",
      "أقصى قدرة على الصعود": "41%",
      "عدد العتاد": "5 للأمام + 1 للخلف",
      "علبة التروس": "GBS -76-5/4.10 - علبة تروس MK - II مع زيادة السرعة",
      "الفرامل": "مكابح قرصية مهواة مع فرجار بوعاء مزدوج",
      "الإطارات": "235/70 R16 إطارات بدون أنابيب",
      "الوزن الإجمالي": "3100",
      "الوزن الفارغ": "1820",
      "الحمولة القصوى": "1280",
      "سعة خزان الوقود": "70 لتر"
    },
    highlights: [
      {label: "قدرة الصعود", value: "41%"},
      {label: "الحمولة القصوى", value: "1280 كجم"},
      {label: "سعة الوقود", value: "70 لتر"},
      {label: "عزم الدوران", value: "320 نيوتن.متر"}
    ],
    features: [
      "الطاقة والالتقاط بقوة 150 حصان تساعد في السرعة العالية",
      "محرك 2179cc لكفاءة الوقود",
      "قابلية عالية للتصنيف للتنقل السلس من خلال التدرجات",
      "التوجيه بمساعدة الطاقة الكهربائية لراحة القيادة"
    ],
    images: [
      "/uploads/vehicles/XENON-SC-1.jpg",
      "/uploads/vehicles/xenon-sc-2.jpg"
    ]
  }
]

async function seedTataCommercialVehicles() {
  console.log('🚛 Starting seed of Tata Commercial Vehicles...')
  
  try {
    // Create or update vehicles
    for (const vehicleData of tataCommercialVehicles) {
      console.log(`📝 Processing vehicle: ${vehicleData.title}`)
      
      // Generate unique stock number
      const stockNumber = `TATA-${vehicleData.title.replace(/\s+/g, '-')}-${Date.now()}`
      
      // Create or update vehicle
      const vehicle = await db.vehicle.upsert({
        where: { 
          stockNumber: stockNumber 
        },
        update: {
          make: 'Tata Motors',
          model: vehicleData.title,
          year: 2024,
          price: Math.floor(Math.random() * 500000) + 200000, // Random price between 200k-700k
          description: vehicleData.description,
          category: vehicleData.category as any,
          fuelType: vehicleData.fuelType as any,
          transmission: vehicleData.transmission as any,
          status: 'AVAILABLE',
          featured: true,
          updatedAt: new Date()
        },
        create: {
          make: 'Tata Motors',
          model: vehicleData.title,
          year: 2024,
          price: Math.floor(Math.random() * 500000) + 200000,
          stockNumber: stockNumber,
          description: vehicleData.description,
          category: vehicleData.category as any,
          fuelType: vehicleData.fuelType as any,
          transmission: vehicleData.transmission as any,
          status: 'AVAILABLE',
          featured: true
        }
      })
      
      console.log(`✅ Vehicle created/updated: ${vehicle.id} - ${vehicle.model}`)
      
      // Add specifications
      for (const [key, value] of Object.entries(vehicleData.specifications)) {
        await db.vehicleSpecification.upsert({
          where: {
            vehicleId_key: {
              vehicleId: vehicle.id,
              key: key
            }
          },
          update: {
            label: key,
            value: value,
            category: 'ENGINE',
            updatedAt: new Date()
          },
          create: {
            vehicleId: vehicle.id,
            key: key,
            label: key,
            value: value,
            category: 'ENGINE'
          }
        })
      }
      
      // Add highlights as specifications with different category
      for (const highlight of vehicleData.highlights) {
        await db.vehicleSpecification.upsert({
          where: {
            vehicleId_key: {
              vehicleId: vehicle.id,
              key: `highlight_${highlight.label}`
            }
          },
          update: {
            label: highlight.label,
            value: highlight.value,
            category: 'TECHNOLOGY',
            updatedAt: new Date()
          },
          create: {
            vehicleId: vehicle.id,
            key: `highlight_${highlight.label}`,
            label: highlight.label,
            value: highlight.value,
            category: 'TECHNOLOGY'
          }
        })
      }
      
      // Add features as specifications
      for (let i = 0; i < vehicleData.features.length; i++) {
        const feature = vehicleData.features[i]
        await db.vehicleSpecification.upsert({
          where: {
            vehicleId_key: {
              vehicleId: vehicle.id,
              key: `feature_${i}`
            }
          },
          update: {
            label: 'مميزات',
            value: feature,
            category: 'SAFETY',
            updatedAt: new Date()
          },
          create: {
            vehicleId: vehicle.id,
            key: `feature_${i}`,
            label: 'مميزات',
            value: feature,
            category: 'SAFETY'
          }
        })
      }
      
      // Add images
      for (let i = 0; i < vehicleData.images.length; i++) {
        const imageUrl = vehicleData.images[i]
        await db.vehicleImage.upsert({
          where: {
            vehicleId_order: {
              vehicleId: vehicle.id,
              order: i
            }
          },
          update: {
            imageUrl: imageUrl,
            altText: `${vehicleData.title} - Image ${i + 1}`,
            isPrimary: i === 0,
            updatedAt: new Date()
          },
          create: {
            vehicleId: vehicle.id,
            imageUrl: imageUrl,
            altText: `${vehicleData.title} - Image ${i + 1}`,
            isPrimary: i === 0,
            order: i
          }
        })
      }
      
      // Create pricing
      await db.vehiclePricing.upsert({
        where: {
          vehicleId: vehicle.id
        },
        update: {
          basePrice: vehicle.price || 300000,
          totalPrice: vehicle.price || 300000,
          currency: 'EGP',
          updatedAt: new Date()
        },
        create: {
          vehicleId: vehicle.id,
          basePrice: vehicle.price || 300000,
          totalPrice: vehicle.price || 300000,
          currency: 'EGP'
        }
      })
      
      console.log(`📋 Added specifications, features, images, and pricing for ${vehicle.model}`)
    }
    
    console.log('🎉 Tata Commercial Vehicles seed completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding Tata Commercial Vehicles:', error)
    throw error
  }
}

// Run seed function if called directly
if (require.main === module) {
  seedTataCommercialVehicles()
    .then(() => {
      console.log('✅ Seed completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error)
      process.exit(1)
    })
}

export { seedTataCommercialVehicles }