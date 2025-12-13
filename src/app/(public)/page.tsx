import { db } from '@/lib/db'
import HomeClient from './HomeClient'
import { normalizeBrandingObject, DISTRIBUTOR_BRANDING } from '@/lib/branding'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Replicate the normalization logic from the API
const normalizeContentPosition = (position?: string) => {
    switch (position) {
        case 'top-right':
        case 'bottom-right':
        case 'top-center':
        case 'bottom-center':
        case 'top-left':
        case 'bottom-left':
        case 'middle-left':
        case 'middle-center':
        case 'middle-right':
        case 'left': return 'middle-left'
        case 'center': return 'middle-center'
        case 'right': return 'middle-right'
        case 'top': return 'top-center'
        case 'bottom': return 'bottom-center'
        default: return 'top-right'
    }
}

// Data fetching helper functions
async function getHomepageSettings() {
    try {
        const settings = await db.homepageSettings.findFirst()
        if (!settings) return null
        return {
            showHeroSlider: Boolean(settings.showHeroSlider),
            autoPlaySlider: Boolean(settings.autoPlaySlider),
            sliderInterval: settings.sliderInterval || 5000,
            showServices: Boolean(settings.showServices),
            servicesTitle: settings.servicesTitle || 'خدماتنا المتكاملة',
            servicesSubtitle: settings.servicesSubtitle || 'نقدم مجموعة شاملة من الخدمات لضمان أفضل تجربة لعملائنا',
            servicesDescription: settings.servicesDescription || 'اكتشف حلولنا المتكاملة في البيع، الصيانة، التمويل، وقطع الغيار مع فريق دعم متخصص.',
            servicesCtaText: settings.servicesCtaText || 'احجز الآن',
            facebookPageUrl: settings.facebookPageUrl || 'https://www.facebook.com/elhamdimport',
            facebookVideoUrl: settings.facebookVideoUrl || 'https://www.facebook.com/elhamdimport/videos'
        }
    } catch (e) {
        console.error('Error fetching homepage settings:', e)
        return null
    }
}

async function getCompanyInfo() {
    try {
        const info = await db.companyInfo.findFirst()
        return info ? normalizeBrandingObject(info) : null
    } catch (e) {
        console.error('Error fetching company info:', e)
        return null
    }
}

async function getSliders(activeOnly = true) {
    try {
        const sliders = await db.slider.findMany({
            where: activeOnly ? { isActive: true } : {},
            orderBy: { order: 'asc' }
        })

        // Deduplication logic (simplified)
        const uniqueSliders = sliders.reduce((acc: any, current) => {
            const uniqueKey = `${current.title}-${current.imageUrl}`
            if (!acc[uniqueKey] || current.order < acc[uniqueKey].order) {
                acc[uniqueKey] = current
            }
            return acc
        }, {})

        return Object.values(uniqueSliders)
            .sort((a: any, b: any) => a.order - b.order)
            .map((item: any) => ({
                ...normalizeBrandingObject(item),
                contentPosition: normalizeContentPosition(item?.contentPosition),
                contentSize: item?.contentSize || 'lg',
                contentColor: item?.contentColor || '#ffffff',
                contentShadow: item?.contentShadow !== false,
                contentStrokeColor: item?.contentStrokeColor || '#000000',
                contentStrokeWidth: item?.contentStrokeWidth || 0,
            }))
    } catch (e) {
        console.error('Error fetching sliders:', e)
        return []
    }
}

async function getVehicles() {
    try {
        // simplified fetch for public vehicles
        const vehicles = await db.vehicle.findMany({
            where: {
                status: { in: ['AVAILABLE', 'SOLD', 'RESERVED', 'COMING_SOON'] }
            },
            include: {
                images: true,
                brand: true,
                model: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit initial fetch
        })

        return vehicles.map(v => normalizeBrandingObject({
            id: v.id,
            make: v.brand?.name || v.make || 'Unknown',
            model: v.model?.name || v.model || 'Unknown',
            year: v.year,
            price: v.price,
            category: v.category,
            fuelType: v.fuelType,
            transmission: v.transmission,
            mileage: v.mileage,
            images: v.images.map((img: any) => ({
                imageUrl: img.url,
                isPrimary: img.isPrimary
            }))
        }))
    } catch (e) {
        console.error('Error fetching vehicles:', e)
        return []
    }
}

async function getServiceItems() {
    try {
        const items = await db.serviceItem.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        })
        return items.map(item => normalizeBrandingObject(item))
    } catch {
        return []
    }
}

async function getCompanyStats() {
    try {
        const stats = await db.companyStat.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        })
        return stats.map(is => normalizeBrandingObject(is))
    } catch {
        return []
    }
}

async function getContactInfo() {
    try {
        const contact = await db.contactInfo.findFirst()
        // Note: The client component has complex normalization logic for contact info.
        // We will pass the raw object and let the client normalize it, or replicate it.
        // For simplicity, passing normalized basic object.
        return contact ? normalizeBrandingObject(contact) : null
    } catch { return null }
}

export default async function Page() {
    // Parallel fetch for improved performance
    const [
        homepageSettings,
        companyInfo,
        sliders,
        vehicles,
        serviceItems,
        companyStats,
        contactInfo
    ] = await Promise.all([
        getHomepageSettings(),
        getCompanyInfo(),
        getSliders(),
        getVehicles(),
        getServiceItems(),
        getCompanyStats(),
        getContactInfo()
    ])

    // Construct initial data object
    const initialData = {
        homepageSettings,
        companyInfo,
        sliders,
        vehicles,
        serviceItems,
        companyStats,
        contactInfo,
        // Add other entities if needed
    }

    return <HomeClient initialData={initialData} />
}
