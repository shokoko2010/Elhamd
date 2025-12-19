export interface SpecItem {
    key: string
    label: string
}

export interface SpecCategory {
    category: string
    items: SpecItem[]
}

export const VEHICLE_SPEC_TEMPLATE: SpecCategory[] = [
    {
        category: "المحرك (Engine)",
        items: [
            { key: "engine_model", label: "الموديل" },
            { key: "engine_type", label: "النوع" },
            { key: "engine_capacity", label: "السعة اللترية" },
            { key: "engine_cylinders", label: "عدد السلندرات" },
            { key: "engine_max_power", label: "القوة القصوى" },
            { key: "engine_max_torque", label: "العزم الأقصى" },
            { key: "engine_compression_ratio", label: "نسبة الانضغاط" },
            { key: "engine_operating_systems", label: "أنظمة التشغيل" },
            { key: "engine_max_speed", label: "السرعة القصوى" },
        ]
    },
    {
        category: "ناقل الحركة (Transmission)",
        items: [
            { key: "trans_model", label: "الموديل" },
            { key: "trans_type", label: "النوع" },
            { key: "trans_clutch", label: "الدبرياج" },
            { key: "trans_cylinder_diameter", label: "قطر الأسطوانة" },
            { key: "trans_drive_system", label: "نظام الدفع" },
        ]
    },
    {
        category: "التعليق والمكابح والعجلات (Suspension, Brakes & Tyres)",
        items: [
            { key: "suspension_front", label: "التعليق الأمامي" },
            { key: "suspension_rear", label: "التعليق الخلفي" },
            { key: "brakes_system", label: "نظام المكابح" },
            { key: "brakes_abs", label: "نظام منع الانغلاق" },
            { key: "tyres_size", label: "مقاس الإطارات" },
        ]
    },
    {
        category: "الأبعاد والمقاسات (Dimensions)",
        items: [
            { key: "dim_wheelbase", label: "قاعدة العجلات" },
            { key: "dim_overall", label: "الأبعاد الكلية (طول×عرض×ارتفاع)" },
            { key: "dim_axle", label: "محور العجلات (أمامي / خلفي)" },
            { key: "dim_ground_clearance", label: "الارتفاع عن الأرض (Ground Clearance)" },
            { key: "dim_turn_radius", label: "نصف قطر الدوران" },
        ]
    },
    {
        category: "الأوزان (Weights)",
        items: [
            { key: "weight_gvw", label: "الوزن الإجمالي للمركبة (GVW)" },
            { key: "weight_front_axle", label: "الوزن المسموح للمحور الأمامي" },
            { key: "weight_rear_axle", label: "الوزن المسموح للمحور الخلفي" },
            { key: "weight_curb", label: "وزن المركبة فارغة (Curb Weight)" },
            { key: "weight_payload", label: "الحمولة المقدرة (Payload)" },
            { key: "weight_fuel_tank", label: "سعة خزان الوقود" },
        ]
    }
]
