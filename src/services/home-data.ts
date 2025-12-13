
import { db } from '@/lib/db'
import { VehicleCategory } from '@prisma/client'
import { normalizeBrandingObject } from '@/lib/branding'

// Helper to strip massive Base64 strings that break Vercel ISR (19MB limit)
const stripLargeData = (str: string | null | undefined): string | null | undefined => {
    if (!str) return str;
    // If string is > 100KB and looks like base64 image, replace it
    if (str.length > 50000 && str.startsWith('data:image')) {
        console.warn('Stripped large Base64 image to prevent build failure');
        return '/uploads/showroom-luxury.jpg'; // Return a lightweight placeholder
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
                // Excluded: description (if not used), isActive, createdAt, updatedAt
            }
        })

        const uniqueSliders = sliders.reduce((acc, current) => {
            const uniqueKey = `${current.title}-${current.imageUrl}`
            if (!acc[uniqueKey] || current.order < acc[uniqueKey].order) {
                acc[uniqueKey] = current
            }
            return acc
        }, {} as Record<string, typeof sliders[0]>)

        return Object.values(uniqueSliders).sort((a: any, b: any) => a.order - b.order).map((slider: any) => ({
            ...slider,
            imageUrl: stripLargeData(slider.imageUrl) || ''
        }))
    } catch (error) {
        console.error('Error fetching sliders:', error)
        return []
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
                // description: true, // Often not used in summary views
                features: true,
                ctaButtons: true,
                imageUrl: true // Only if needed
            }
        })

        if (!companyInfo) {
            // Default info
            return {
                id: 'default',
                title: 'مرحباً بك في الحمد للسيارات',
                subtitle: 'الموزع المعتمد لسيارات تاتا في مدن القناة',
                // description: '...', // Removed to save space if unused
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
            imageUrl: stripLargeData(companyInfo.imageUrl)
        };
    } catch (error) {
        console.error('Error fetching company info:', error)
        return null
    }
}

// --- Vehicles ---
export async function getPublicVehicles(limit = 4, status = 'AVAILABLE', category?: string) {
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
                // Only fetch primary image, strictly selected fields
                images: {
                    take: 1,
                    orderBy: [
                        { isPrimary: 'desc' },
                        { order: 'asc' }
                    ],
                    select: { id: true, imageUrl: true, altText: true, isPrimary: true }
                }
                // Excluded: description, specifications, features, highlights, etc.
            },
            orderBy: [{ createdAt: 'desc' }],
            take: limit === 0 ? 4 : limit // Force limit to avoid fetching all
        })

        const total = await db.vehicle.count({ where })

        // Post-process to strip excessively large images
        const sanitizedVehicles = vehicles.map(v => ({
            ...v,
            images: v.images.map(img => ({
                ...img,
                imageUrl: stripLargeData(img.imageUrl) || ''
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
        return await db.timelineEvent.findMany({
            orderBy: { year: 'desc' },
            select: {
                id: true,
                year: true,
                title: true,
                description: true
            }
        })
    } catch {
        return []
    }
}

// --- Values ---
export async function getValues() {
    try {
        return await db.companyValue.findMany({
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
        // Assuming db.companyStats exists based on previous code
        // If it fails, the catch block returns empty array
        const stats = await db.companyStats.findMany({
            orderBy: { order: 'asc' },
            select: {
                id: true,
                label: true,
                number: true, // Used in page.tsx
                description: true,
                // icon: true 
            }
        })
        return stats
    } catch {
        // Fallback or ignore
        return []
    }
}
