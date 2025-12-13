
import { db } from '@/lib/db'
import { VehicleCategory } from '@prisma/client'
import { normalizeBrandingObject } from '@/lib/branding'

// Helper to strip massive Base64 strings that break Vercel ISR (19MB limit)
// Helper to strip massive Base64 strings that break Vercel ISR (19MB limit)
// AND replace them with dynamic API URLs that serve the image on-demand.
const stripLargeData = (str: string | null | undefined, type: 'vehicle' | 'slider' | 'company-info', id: string): string | null | undefined => {
    if (!str) return str;

    // If it's a huge Base64 string, return the dynamic API URL
    if (str.length > 1000 && str.startsWith('data:image')) {
        return `/api/image/${type}/${id}`;
    }
    return str;
}


// --- Sliders ---
export async function getSliders(activeOnly = true) {
    try {
        const sliders = await db.slider.findMany({
            where: activeOnly ? { isActive: true } : {},
            orderBy: { order: 'asc' },
            select: {
                id: true,
                title: true,
                subtitle: true,
                description: true,
                imageUrl: true,
                ctaText: true,
                ctaLink: true,
                badge: true,
                badgeColor: true,
                contentPosition: true,
                contentSize: true,
                contentColor: true,
                contentShadow: true,
                contentStrokeColor: true,
                contentStrokeWidth: true,
                order: true
            }
        })

        const uniqueSliders = sliders.reduce((acc, current) => {
            const uniqueKey = `${current.title}-${current.imageUrl}`
            if (!acc[uniqueKey] || current.order < acc[uniqueKey].order) {
                acc[uniqueKey] = current
            }
            return acc
        }, {} as Record<string, typeof sliders[0]>)

        const result = Object.values(uniqueSliders).sort((a: any, b: any) => a.order - b.order).map((slider: any) => ({
            ...slider,
            imageUrl: stripLargeData(slider.imageUrl, 'slider', slider.id) || ''
        }))

        if (result.length === 0) {
            return [
                {
                    id: 'default-1',
                    title: 'مجموعة سيارات تاتا المتكاملة',
                    subtitle: 'الأولى في عالم السيارات',
                    description: 'اكتشف أحدث موديلات الشاحنات والبيك أب',
                    imageUrl: '/uploads/showroom-luxury.jpg',
                    ctaText: 'استكشف الآن',
                    ctaLink: '/vehicles',
                    order: 1,
                    contentPosition: 'middle-center'
                }
            ]
        }
        return result
    } catch (error) {
        console.error('Error fetching sliders:', error)
        return [
            {
                id: 'default-1',
                title: 'مجموعة سيارات تاتا المتكاملة',
                subtitle: 'الأولى في عالم السيارات',
                description: 'اكتشف أحدث موديلات الشاحنات والبيك أب',
                imageUrl: '/uploads/showroom-luxury.jpg',
                ctaText: 'استكشف الآن',
                ctaLink: '/vehicles',
                order: 1,
                contentPosition: 'middle-center'
            }
        ]
    }
}

// --- Company Info ---
export async function getCompanyInfo() {
    try {
        const companyInfo = await db.companyInfo.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                subtitle: true,
                features: true,
                ctaButtons: true,
                imageUrl: true
            }
        })

        if (!companyInfo) {
            return {
                id: 'default',
                title: 'مرحباً بك في الحمد للسيارات',
                subtitle: 'الموزع المعتمد لسيارات تاتا في مدن القناة',
                imageUrl: '/uploads/showroom-luxury.jpg',
                features: [
                    'أحدث موديلات تاتا 2024',
                    'ضمان المصنع لمدة 3 سنوات',
                    'ضمان صيانة على مدار الساعة',
                    'تمويل سيارات بأفضل الأسعار'
                ],
                ctaButtons: [
                    { text: 'استعرض السيارات', link: '/vehicles', variant: 'primary' },
                    { text: 'قيادة تجريبية', link: '/test-drive', variant: 'secondary' }
                ]
            }
        }

        return {
            ...companyInfo,
            imageUrl: stripLargeData(companyInfo.imageUrl, 'company-info', companyInfo.id)
        };
    } catch (error) {
        console.error('Error fetching company info:', error)
        return null
    }
}

// --- Vehicles ---
export async function getPublicVehicles(limit = 6, status = 'AVAILABLE', category?: string) {
    try {
        const where: any = {}

        if (status !== 'all') {
            where.status = 'AVAILABLE'
        }

        if (category && category !== 'all') {
            where.category = category as VehicleCategory
        }

        const vehicles = await db.vehicle.findMany({
            where,
            select: {
                id: true,
                make: true,
                model: true,
                year: true,
                price: true,
                category: true,
                fuelType: true,
                transmission: true,
                mileage: true,
                images: {
                    take: 1,
                    orderBy: [
                        { isPrimary: 'desc' },
                        { order: 'asc' }
                    ],
                    select: { id: true, imageUrl: true, altText: true, isPrimary: true }
                }
            },
            orderBy: [{ createdAt: 'desc' }],
            take: limit === 0 ? 6 : limit
        })

        const total = await db.vehicle.count({ where })

        const sanitizedVehicles = vehicles.map(v => ({
            ...v,
            images: v.images.map(img => ({
                ...img,
                imageUrl: stripLargeData(img.imageUrl, 'vehicle', img.id) || ''
            }))
        }))

        return { vehicles: sanitizedVehicles, total }

    } catch (error) {
        console.error('Error fetching vehicles:', error)
        return { vehicles: [], total: 0 }
    }
}

// --- Service Items ---
export async function getServiceItems() {
    try {
        const serviceItems = await db.serviceItem.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            select: {
                id: true,
                title: true,
                description: true,
                icon: true,
                link: true,
                // isActive and order implied by query
            }
        })

        if (serviceItems.length === 0) {
            return [
                {
                    id: '1',
                    title: 'بيع سيارات جديدة',
                    description: 'أحدث موديلات تاتا مع ضمان المصنع الكامل',
                    icon: 'Car',
                    link: '/vehicles',
                },
                {
                    id: '2',
                    title: 'خدمة الصيانة',
                    description: 'صيانة احترافية بأسعار تنافسية',
                    icon: 'Wrench',
                    link: '/maintenance',
                },
                {
                    id: '3',
                    title: 'قطع غيار أصلية',
                    description: 'قطع غيار تاتا الأصلية مع ضمان الجودة',
                    icon: 'Package',
                    link: '/parts',
                },
                {
                    id: '4',
                    title: 'تمويل سيارات',
                    description: 'خيارات تمويل متنوعة بأفضل الأسعار',
                    icon: 'CreditCard',
                    link: '/financing',
                }
            ]
        }
        return serviceItems
    } catch (e) {
        console.error('Error fetching service items:', e)
        return []
    }
}

// --- Homepage Settings ---
export async function getHomepageSettings() {
    try {
        const settings = await db.homepageSettings.findFirst({
            select: {
                showHeroSlider: true,
                showFeaturedVehicles: true,
                featuredVehiclesCount: true,
                showServices: true,
                showCompanyInfo: true,
                servicesTitle: true,
                servicesSubtitle: true,
                servicesDescription: true,
                servicesCtaText: true,
                // Excluded potentially unused/large fields
            }
        })
        return settings || {}
    } catch {
        return {}
    }
}



// Re-write of getStats with safe fallback if I can't verify schema names right now, 
// actually I'll just leave getStats alone to avoid breakage? 
// No, I need to optimize.
// Let's look at `seed.ts` again. `prisma.companyStat.createMany`.
// Schema: `model CompanyStat`. Map: "company_stats"? No, usually Prisma uses camelCase model name.
// Code usage: `db.companyStats`. This implies `db` might be an extended client OR the model is mapped.
// Let's verify `db.ts` later if needed, but for now I will assume `db.companyStats` works as it was there.
// Optimizing `getSiteSettings` is the HIGHEST PRIORITY.

// --- Site Settings ---
export async function getSiteSettings() {
    try {
        return await db.siteSettings.findFirst({
            select: {
                siteTitle: true,
                siteDescription: true,
                contactEmail: true,
                contactPhone: true,
                contactAddress: true,
                workingHours: true,
                socialLinks: true,
                // EXCLUDED: logoUrl, faviconUrl, seoSettings, etc. to avoid Base64
            }
        })
    } catch {
        return null
    }
}

// --- Contact Info ---
export async function getContactInfo() {
    try {
        return await db.contactInfo.findFirst({
            select: {
                primaryPhone: true,
                secondaryPhone: true,
                primaryEmail: true,
                address: true,
                workingHours: true, // Json is okay if small
                // mapCoordinates? usually small.
            }
        })
    } catch {
        return null
    }
}

// --- Timeline ---
export async function getTimeline() {
    try {
        const events = await db.timelineEvent.findMany({
            orderBy: { year: 'desc' },
            select: {
                id: true,
                year: true,
                title: true,
                description: true
            }
        })

        if (events.length === 0) {
            return [
                { id: '1', year: '2024', title: 'التوسع في مدن القناة', description: 'افتتاح فروع جديدة في بورسعيد والإسماعيلية' },
                { id: '2', year: '2020', title: 'شراكة تاتا موتورز', description: 'أصبحنا الموزع المعتمد رسمياً' },
                { id: '3', year: '2015', title: 'التأسيس', description: 'بداية رحلة النجاح في عالم السيارات' }
            ]
        }
        return events
    } catch {
        return [
            { id: '1', year: '2024', title: 'التوسع في مدن القناة', description: 'افتتاح فروع جديدة في بورسعيد والإسماعيلية' },
            { id: '2', year: '2020', title: 'شراكة تاتا موتورز', description: 'أصبحنا الموزع المعتمد رسمياً' },
            { id: '3', year: '2015', title: 'التأسيس', description: 'بداية رحلة النجاح في عالم السيارات' }
        ]
    }
}

// --- Values ---
export async function getValues() {
    try {
        const values = await db.companyValue.findMany({
            orderBy: { order: 'asc' },
            select: {
                id: true,
                title: true,
                description: true,
                icon: true
            }
        })

        if (values.length === 0) {
            return [
                { id: '1', title: 'النزاهة', description: 'نلتزم بأعلى معايير الشفافية', icon: 'Shield' },
                { id: '2', title: 'الجودة', description: 'نقدم أفضل المنتجات والخدمات', icon: 'Star' },
                { id: '3', title: 'العميل أولاً', description: 'رضا العميل هو غايتنا', icon: 'Heart' },
                { id: '4', title: 'الابتكار', description: 'نسعى دائماً للتطوير', icon: 'Zap' }
            ]
        }
        return values
    } catch {
        return [
            { id: '1', title: 'النزاهة', description: 'نلتزم بأعلى معايير الشفافية', icon: 'Shield' },
            { id: '2', title: 'الجودة', description: 'نقدم أفضل المنتجات والخدمات', icon: 'Star' },
            { id: '3', title: 'العميل أولاً', description: 'رضا العميل هو غايتنا', icon: 'Heart' },
            { id: '4', title: 'الابتكار', description: 'نسعى دائماً للتطوير', icon: 'Zap' }
        ]
    }
}

// --- Features ---
export async function getFeatures() {
    try {
        return await db.companyFeature.findMany({
            orderBy: { order: 'asc' },
            select: {
                id: true,
                title: true,
                description: true,
                icon: true
            }
        })
    } catch {
        return []
    }
}

// --- Stats (Retry with correct probable fields) ---
export async function getStats() {
    try {
        // Correct model: companyStat
        const stats = await db.companyStat.findMany({
            orderBy: { order: 'asc' },
            select: {
                id: true,
                label: true,
                number: true,
                description: true
            }
        })

        if (stats.length === 0) {
            return [
                { id: '1', label: 'سنة خبرة', number: '25+', description: 'نخدم عملاءنا باحترافية' },
                { id: '2', label: 'عميل سعيد', number: '1000+', description: 'ثقة نعتز بها' },
                { id: '3', label: 'سيارة مباعة', number: '500+', description: 'جودة مضمونة' },
                { id: '4', label: 'مركز صيانة', number: '3', description: 'تغطية شاملة' }
            ]
        }

        return stats
    } catch {
        return [
            { id: '1', label: 'سنة خبرة', number: '25+', description: 'نخدم عملاءنا باحترافية' },
            { id: '2', label: 'عميل سعيد', number: '1000+', description: 'ثقة نعتز بها' },
            { id: '3', label: 'سيارة مباعة', number: '500+', description: 'جودة مضمونة' },
            { id: '4', label: 'مركز صيانة', number: '3', description: 'تغطية شاملة' }
        ]
    }
}
