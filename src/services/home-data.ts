
import { db } from '@/lib/db'
import { VehicleCategory } from '@prisma/client'
import { normalizeBrandingObject } from '@/lib/branding'

// --- Sliders ---
export async function getSliders(activeOnly = true) {
    try {
        const sliders = await db.slider.findMany({
            where: activeOnly ? { isActive: true } : {},
            orderBy: { order: 'asc' }
        })

        const uniqueSliders = sliders.reduce((acc, current) => {
            const uniqueKey = `${current.title}-${current.imageUrl}`
            if (!acc[uniqueKey] || current.order < acc[uniqueKey].order) {
                acc[uniqueKey] = current
            }
            return acc
        }, {} as Record<string, typeof sliders[0]>)

        return Object.values(uniqueSliders).sort((a, b) => a.order - b.order)
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
            orderBy: { updatedAt: 'desc' }
        })

        if (!companyInfo) {
            // Default info
            return {
                id: 'default',
                title: 'مرحباً بك في الحمد للسيارات',
                subtitle: 'الموزع المعتمد لسيارات تاتا في مدن القناة',
                description: 'نحن فخورون بخدمة مدن القناة كموزع معتمد لسيارات تاتا، حيث نقدم أحدث الموديلات مع ضمان الجودة الأصلي وخدمات ما بعد البيع المتميزة.',
                imageUrl: '/uploads/showroom-luxury.jpg',
                features: [
                    'أحدث موديلات تاتا 2024',
                    'ضمان المصنع لمدة 3 سنوات',
                    'خدمة صيانة على مدار الساعة',
                    'تمويل سيارات بأفضل الأسعار'
                ],
                ctaButtons: [
                    { text: 'استعرض السيارات', link: '/vehicles', variant: 'primary' },
                    { text: 'قيادة تجريبية', link: '/test-drive', variant: 'secondary' }
                ],
                isActive: true
            }
        }

        return companyInfo;
    } catch (error) {
        console.error('Error fetching company info:', error)
        return null
    }
}

// --- Vehicles ---
export async function getPublicVehicles(limit = 12, status = 'AVAILABLE', category?: string) {
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
            include: {
                images: {
                    orderBy: { order: 'asc' },
                    select: { id: true, imageUrl: true, altText: true, isPrimary: true, order: true }
                }
            },
            orderBy: [{ createdAt: 'desc' }],
            take: limit === 0 ? undefined : limit
        })

        const total = await db.vehicle.count({ where })

        return { vehicles, total }

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
            orderBy: { order: 'asc' }
        })

        if (serviceItems.length === 0) {
            return [
                {
                    id: '1',
                    title: 'بيع سيارات جديدة',
                    description: 'أحدث موديلات تاتا مع ضمان المصنع الكامل',
                    icon: 'Car',
                    link: '/vehicles',
                    order: 0,
                    isActive: true
                },
                {
                    id: '2',
                    title: 'خدمة الصيانة',
                    description: 'صيانة احترافية بأسعار تنافسية',
                    icon: 'Wrench',
                    link: '/maintenance',
                    order: 1,
                    isActive: true
                },
                {
                    id: '3',
                    title: 'قطع غيار أصلية',
                    description: 'قطع غيار تاتا الأصلية مع ضمان الجودة',
                    icon: 'Package',
                    link: '/parts',
                    order: 2,
                    isActive: true
                },
                {
                    id: '4',
                    title: 'تمويل سيارات',
                    description: 'خيارات تمويل متنوعة بأفضل الأسعار',
                    icon: 'CreditCard',
                    link: '/financing',
                    order: 3,
                    isActive: true
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
        const settings = await db.homepageSettings.findFirst()
        return settings || {}
    } catch {
        return {}
    }
}
// --- Stats ---
export async function getStats() {
    try {
        return await db.companyStats.findMany({ orderBy: { order: 'asc' } })
    } catch {
        return []
    }
}

// --- Values ---
export async function getValues() {
    try {
        return await db.companyValue.findMany({ orderBy: { order: 'asc' } })
    } catch {
        return []
    }
}

// --- Features ---
export async function getFeatures() {
    try {
        return await db.companyFeature.findMany({ orderBy: { order: 'asc' } })
    } catch {
        return []
    }
}

// --- Timeline ---
export async function getTimeline() {
    try {
        return await db.timelineEvent.findMany({ orderBy: { year: 'desc' } })
    } catch {
        return []
    }
}

// --- Contact Info ---
export async function getContactInfo() {
    try {
        return await db.contactInfo.findFirst()
    } catch {
        return null
    }
}

// --- Site Settings ---
export async function getSiteSettings() {
    try {
        return await db.siteSettings.findFirst()
    } catch {
        return null
    }
}
