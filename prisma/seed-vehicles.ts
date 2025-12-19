
import { PrismaClient, VehicleCategory, VehicleSpecCategory, FuelType, TransmissionType, VehicleStatus } from '@prisma/client'

const db = new PrismaClient()

const vehiclesData = [
    {
        "id": "ultra_t7",
        "model_name": "ULTRA T 7",
        "category": "TRUCK",
        "description": "شاحنة خفيفة متعددة الاستخدامات، تتميز بالكفاءة وقدرة التحمل.",
        "engine": {
            "model": "NG 3.3L CR Euro-IV",
            "type": "محرك ديزل تبريد بالمياه، حقن مباشر (Common Rail)، شاحن تيربو بتبريد داخلي",
            "displacement": "3300 سي سي",
            "cylinders": "4",
            "max_power": "155 حصان عند 2600 دورة/دقيقة",
            "max_torque": "450 نيوتن.متر عند 1500-2200 دورة/دقيقة",
            "compression_ratio": "17.5:1",
            "top_speed": "105 كم/ساعة"
        },
        "transmission": {
            "model": "TATA GBS 550 (آلية نقل بالكابل)",
            "type": "يدوي: 6 سرعات أمامية + 1 خلفية",
            "clutch": "قرص أحادي جاف، قطر 330 مم",
            "drive_configuration": "دفع خلفي"
        },
        "dimensions": {
            "wheelbase": "3550 مم",
            "overall_dimensions": "6234 × 2050 × 2457 مم",
            "track_front": "1565 مم",
            "track_rear": "1620 مم",
            "ground_clearance": "187 مم",
            "min_turning_radius": "13 متر"
        },
        "weights": {
            "gross_vehicle_weight": "7490 كجم",
            "permissible_front_axle_weight": "2990 كجم",
            "permissible_rear_axle_weight": "4500 كجم",
            "curb_weight": "2970 كجم",
            "payload": "4520 كجم",
            "tank_capacity": "90 لتر"
        },
        "suspension_and_brakes": {
            "front_suspension": "يايات ورقية مخروطية (Parabolic)، مساعد هيدروليكي مزدوج الفعل",
            "rear_suspension": "يايات ورقية شبه بيضاوية (Semi elliptical)، مساعد هيدروليكي مزدوج الفعل",
            "brakes": "مكابح هوائية (Air Brakes) مع ABS + ESP",
            "tyres": "215/75R 17.5"
        },
        "options": [
            "تكييف هواء (Air Condition)",
            "فاصل كهرباء (Electric cutoff switch)"
        ]
    },
    {
        "id": "xenon_dc",
        "model_name": "Xenon DC",
        "category": "PICKUP",
        "description": "بيك أب (نقل خفيف) قوي وعملي.",
        "engine": {
            "model": "TATA 2.2L DICOR Euro IV",
            "type": "محرك ديزل تبريد بالمياه، حقن مباشر، تيربو بتبريد داخلي مع EGR",
            "displacement": "2179 سي سي",
            "cylinders": "4",
            "max_power": "148 حصان عند 4000 دورة/دقيقة",
            "max_torque": "320 نيوتن.متر عند 1700-2700 دورة/دقيقة",
            "compression_ratio": "17.2:1",
            "top_speed": "160 كم/ساعة"
        },
        "transmission": {
            "model": "GBS-76-5/4.10- MK-II (مع Overdrive)",
            "type": "يدوي: 5 سرعات أمامية + 1 خلفية",
            "clutch": "قرص أحادي جاف، قطر 260 مم",
            "drive_configuration": "دفع خلفي 4x2"
        },
        "dimensions": {
            "wheelbase": "3150 مم",
            "overall_dimensions": "5125 × 1860 × 1765 مم",
            "track_front": "1571 مم",
            "track_rear": "1571 مم", // Assumed same if not split or listed as one
            "ground_clearance": "210 مم",
            "min_turning_radius": "12 متر"
        },
        "weights": {
            "gross_vehicle_weight": "3000 كجم",
            "permissible_front_axle_weight": "1400 كجم",
            "permissible_rear_axle_weight": "1800 كجم",
            "curb_weight": "1950 كجم",
            "payload": "1050 كجم",
            "tank_capacity": "70 لتر"
        },
        "suspension_and_brakes": {
            "front_suspension": "تعليق حر مزدوج (Double Wishbone) مع قضيب التواء وقضيب مانع للانقلاب",
            "rear_suspension": "يايات ورقية مخروطية (Parabolic Leaf Springs)",
            "brakes": "هيدروليكية BOSCH (ديسكات مهواة أمامية 296 مم / طنابير خلفية 282 مم)",
            "tyres": "235/70 R 16"
        },
        "options": [
            "تكييف هواء",
            "سنتر لوك",
            "نظام إنذار و Immobilizer",
            "ريموت كنترول",
            "إضاءة ترحيبية (Follow me Light)",
            "باور ستيرينج",
            "زجاج كهرباء",
            "مرايات كهرباء",
            "تعديل ارتفاع الأنوار كهربائياً",
            "نور شبورة (أمامي وخلفي)",
            "دركسيون جلد متحرك",
            "مسند يد (للسائق والراكب)",
            "شاشة تاتش 7 بوصة",
            "إضاءة تحت الأبواب (Puddle Lamps)",
            "نظام ABS",
            "وسائد هوائية (2)",
            "سلم جانبي",
            "سلم خلفي",
            "جنوط سبور",
            "نظام قياس ضغط الإطارات (TPMS) - اختياري",
            "عدادات ديجيتال - اختياري",
            "مانع انزلاق (ESP) - اختياري",
            "كاميرا خلفية - اختياري"
        ]
    },
    {
        "id": "ultra_t9",
        "model_name": "ULTRA T 9",
        "category": "TRUCK",
        "description": "شاحنة متوسطة للأعمال الشاقة.",
        "engine": {
            "model": "NG 3.3L CR Euro-IV",
            "type": "محرك ديزل تبريد بالمياه، حقن مباشر (Common Rail)، شاحن تيربو بتبريد داخلي",
            "displacement": "3300 سي سي",
            "cylinders": "4",
            "max_power": "155 حصان عند 2600 دورة/دقيقة",
            "max_torque": "450 نيوتن.متر عند 1500-2200 دورة/دقيقة",
            "compression_ratio": "17.5:1",
            "top_speed": "105 كم/ساعة"
        },
        "transmission": {
            "model": "TATA GBS 550 (آلية نقل بالكابل)",
            "type": "يدوي: 6 سرعات أمامية + 1 خلفية",
            "clutch": "قرص أحادي جاف، قطر 330 مم",
            "drive_configuration": "دفع خلفي"
        },
        "dimensions": {
            "wheelbase": "3920 مم",
            "overall_dimensions": "7058 × 2204 × 2469 مم",
            "track_front": "1836 مم",
            "track_rear": "2204 مم",
            "ground_clearance": "185.5 مم",
            "min_turning_radius": "13 متر"
        },
        "weights": {
            "gross_vehicle_weight": "8990 كجم",
            "permissible_front_axle_weight": "3327 كجم",
            "permissible_rear_axle_weight": "5663 كجم",
            "curb_weight": "3370 كجم",
            "payload": "5620 كجم",
            "tank_capacity": "120 لتر"
        },
        "suspension_and_brakes": {
            "front_suspension": "يايات ورقية مخروطية (Parabolic)، مساعد هيدروليكي مزدوج الفعل",
            "rear_suspension": "يايات ورقية شبه بيضاوية (Semi elliptical)، مساعد هيدروليكي مزدوج الفعل",
            "brakes": "مكابح هوائية (Air Brakes) مع ABD + ESP",
            "tyres": "215/75R 17.5"
        },
        "options": [
            "تكييف هواء (Air Condition)",
            "فاصل كهرباء (Electric cutoff switch)"
        ]
    },
    {
        "id": "prima_3428",
        "model_name": "PRIMA 3428",
        "category": "TRUCK",
        "description": "شاحنة ثقيلة (قلاب/تريلا) للأعمال الإنشائية واللوجستية الكبيرة.",
        "engine": {
            "model": "CUMMINS ISBe 270 Euro-III",
            "type": "محرك ديزل تبريد بالمياه",
            "displacement": "6700 سي سي",
            "cylinders": "6",
            "max_power": "280 حصان عند 2500 دورة/دقيقة (+/- 50)",
            "max_torque": "970 نيوتن.متر عند 1500 دورة/دقيقة (+/- 50)",
            "compression_ratio": "",
            "top_speed": "110 كم/ساعة"
        },
        "transmission": {
            "model": "ZF 9S 1110 TO",
            "type": "يدوي",
            "clutch": "قرص أحادي جاف، قطر 430 مم",
            "drive_configuration": "6x4"
        },
        "dimensions": {
            "wheelbase": "5550 مم",
            "overall_dimensions": "10382 × 2585 × 3320 مم",
            "track_front": "", // Not specified
            "track_rear": "", // Not specified
            "ground_clearance": "277 مم (أمامي) / 204 مم (خلفي)",
            "min_turning_radius": ""
        },
        "weights": {
            "gross_vehicle_weight": "34000 كجم",
            "permissible_front_axle_weight": "8000 كجم",
            "permissible_rear_axle_weight": "26000 كجم",
            "curb_weight": "8950 كجم",
            "payload": "25050 كجم",
            "tank_capacity": "365 لتر"
        },
        "suspension_and_brakes": {
            "front_suspension": "يايات ورقية مخروطية (Parabolic Leaf Spring)",
            "rear_suspension": "نظام Bogie (عارضة توازن) مع يايات ورقية شبه بيضاوية متعددة وقضبان عزم",
            "brakes": "فرامل عادم المحرك (Engine exhaust brake) تعمل بالهواء المضغوط + ABS",
            "tyres": "315/80 R 22.5"
        },
        "options": []
    }
]

async function main() {
    console.log('Start seeding vehicles...')

    for (const v of vehiclesData) {
        const stockNumber = `STOCK-${v.id.toUpperCase()}-${Date.now().toString().slice(-4)}`

        // Create Specs array
        const specs = [
            { key: "engine_model", label: "الموديل", value: v.engine.model, category: VehicleSpecCategory.ENGINE },
            { key: "engine_type", label: "النوع", value: v.engine.type, category: VehicleSpecCategory.ENGINE },
            { key: "engine_capacity", label: "السعة اللترية", value: v.engine.displacement, category: VehicleSpecCategory.ENGINE },
            { key: "engine_cylinders", label: "عدد السلندرات", value: String(v.engine.cylinders), category: VehicleSpecCategory.ENGINE },
            { key: "engine_max_power", label: "القوة القصوى", value: v.engine.max_power, category: VehicleSpecCategory.ENGINE },
            { key: "engine_max_torque", label: "العزم الأقصى", value: v.engine.max_torque, category: VehicleSpecCategory.ENGINE },
            { key: "engine_operating_systems", label: "أنظمة التشغيل", value: "", category: VehicleSpecCategory.ENGINE }, // Not strictly provided, empty
            { key: "engine_max_speed", label: "السرعة القصوى", value: v.engine.top_speed, category: VehicleSpecCategory.ENGINE },

            { key: "trans_model", label: "الموديل", value: v.transmission.model, category: VehicleSpecCategory.TRANSMISSION },
            { key: "trans_type", label: "النوع", value: v.transmission.type, category: VehicleSpecCategory.TRANSMISSION },
            { key: "trans_clutch", label: "الدبرياج", value: v.transmission.clutch, category: VehicleSpecCategory.TRANSMISSION },
            { key: "trans_drive_system", label: "نظام الدفع", value: v.transmission.drive_configuration, category: VehicleSpecCategory.TRANSMISSION },

            { key: "dim_wheelbase", label: "قاعدة العجلات", value: v.dimensions.wheelbase, category: VehicleSpecCategory.DIMENSIONS },
            { key: "dim_overall", label: "الأبعاد الكلية", value: v.dimensions.overall_dimensions, category: VehicleSpecCategory.DIMENSIONS },
            { key: "dim_axle", label: "محور العجلات (أمامي / خلفي)", value: `${v.dimensions.track_front} / ${v.dimensions.track_rear}`, category: VehicleSpecCategory.DIMENSIONS },
            { key: "dim_ground_clearance", label: "الارتفاع عن الأرض", value: v.dimensions.ground_clearance, category: VehicleSpecCategory.DIMENSIONS },
            { key: "dim_turn_radius", label: "نصف قطر الدوران", value: v.dimensions.min_turning_radius || "", category: VehicleSpecCategory.DIMENSIONS },

            { key: "weight_gvw", label: "الوزن الإجمالي", value: v.weights.gross_vehicle_weight, category: VehicleSpecCategory.WEIGHTS },
            { key: "weight_front_axle", label: "الوزن المسموح (أمامي)", value: v.weights.permissible_front_axle_weight, category: VehicleSpecCategory.WEIGHTS },
            { key: "weight_rear_axle", label: "الوزن المسموح (خلفي)", value: v.weights.permissible_rear_axle_weight, category: VehicleSpecCategory.WEIGHTS },
            { key: "weight_curb", label: "وزن المركبة فارغة", value: v.weights.curb_weight, category: VehicleSpecCategory.WEIGHTS },
            { key: "weight_payload", label: "الحمولة المقدرة", value: v.weights.payload, category: VehicleSpecCategory.WEIGHTS },
            { key: "weight_fuel_tank", label: "سعة خزان الوقود", value: v.weights.tank_capacity, category: VehicleSpecCategory.WEIGHTS },

            { key: "suspension_front", label: "التعليق الأمامي", value: v.suspension_and_brakes.front_suspension, category: VehicleSpecCategory.CHASSIS },
            { key: "suspension_rear", label: "التعليق الخلفي", value: v.suspension_and_brakes.rear_suspension, category: VehicleSpecCategory.CHASSIS },
            { key: "brakes_system", label: "نظام المكابح", value: v.suspension_and_brakes.brakes, category: VehicleSpecCategory.CHASSIS },
            { key: "tyres_size", label: "مقاس الإطارات", value: v.suspension_and_brakes.tyres, category: VehicleSpecCategory.CHASSIS },
        ].filter(s => s.value && s.value !== "undefined" && s.value !== " / " && s.value !== " / ")

        // Add Options as Features specs
        v.options.forEach((opt, i) => {
            specs.push({
                key: `feature_${v.id}_${i}`,
                label: 'ميزة',
                value: opt,
                category: VehicleSpecCategory.TECHNOLOGY
            })
        })

        if (v.engine.compression_ratio) {
            specs.push({ key: "engine_compression_ratio", label: "نسبة الانضغاط", value: v.engine.compression_ratio, category: VehicleSpecCategory.ENGINE })
        }

        console.log(`Upserting ${v.model_name}...`)

        const existing = await db.vehicle.findFirst({
            where: { model: v.model_name }
        })

        if (existing) {
            // Update existing
            await db.vehicle.update({
                where: { id: existing.id },
                data: {
                    description: v.description,
                    category: v.category as VehicleCategory,
                    specifications: {
                        deleteMany: {},
                        create: specs
                    }
                    // Not updating price/stock/etc as JSON doesn't provide it
                }
            })
        } else {
            // Create new
            await db.vehicle.create({
                data: {
                    make: "Tata Motors",
                    model: v.model_name,
                    year: new Date().getFullYear(),
                    price: 0, // Default
                    stockNumber: stockNumber,
                    stockQuantity: 1,
                    description: v.description,
                    category: v.category as VehicleCategory,
                    fuelType: FuelType.DIESEL,
                    transmission: TransmissionType.MANUAL,
                    status: VehicleStatus.AVAILABLE,
                    specifications: {
                        create: specs
                    },
                    pricing: {
                        create: {
                            basePrice: 0,
                            totalPrice: 0
                        }
                    }
                }
            })
        }
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
