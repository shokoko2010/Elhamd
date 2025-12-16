
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TouchButton } from '@/components/ui/enhanced-mobile-optimization'
import { normalizeBrandingObject } from '@/lib/branding'
import { getServiceItems, getHomepageSettings } from '@/services/home-data'
import { resolveServiceIcon } from '@/lib/icons'

// Normalize data helper (same as original page)
const normalizeServices = (data: any[]) => {
    if (!Array.isArray(data)) return []
    const unique = new Map()
    for (const item of data) {
        if (!unique.has(item.title)) {
            unique.set(item.title, normalizeBrandingObject(item))
        }
    }
    return Array.from(unique.values())
}

const resolveServiceLink = (rawLink?: string): string => {
    if (!rawLink) return '/service-booking'
    const trimmed = rawLink.trim()
    if (!trimmed) return '/service-booking'
    if (/^(https?:\/\/|mailto:|tel:|whatsapp:)/i.test(trimmed)) return trimmed
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export async function ServicesSection() {
    const [homepageSettingsData, serviceItemsData] = await Promise.all([
        getHomepageSettings(),
        getServiceItems()
    ])

    const homepageSettings = {
        showServices: Boolean(homepageSettingsData?.showServices),
        servicesTitle: homepageSettingsData?.servicesTitle || 'خدماتنا المتكاملة',
        servicesSubtitle: homepageSettingsData?.servicesSubtitle || 'نقدم مجموعة شاملة من الخدمات لضمان أفضل تجربة لعملائنا',
        servicesDescription: homepageSettingsData?.servicesDescription || 'اكتشف حلولنا المتكاملة في البيع، الصيانة، التمويل، وقطع الغيار مع فريق دعم متخصص.',
        servicesCtaText: homepageSettingsData?.servicesCtaText || 'احجز الآن',
    }

    if (!homepageSettings.showServices) return null

    // @ts-ignore
    const serviceItems = normalizeServices(serviceItemsData)
    if (serviceItems.length === 0) return null

    const WrenchIcon = resolveServiceIcon('Wrench')

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <Badge
                        className="mb-4 border border-[color:rgba(var(--brand-primary-200-rgb,199_209_224),1)] bg-[color:rgba(var(--brand-primary-50-rgb,238_241_246),1)] text-[color:var(--brand-primary,#0A1A3F)]"
                    >
                        <WrenchIcon className="ml-2 h-4 w-4" />
                        خدماتنا
                    </Badge>
                    <h2
                        className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent"
                        style={{ backgroundImage: 'linear-gradient(120deg, var(--brand-primary,#0A1A3F), var(--brand-secondary,#C1272D))' }}
                    >
                        {homepageSettings.servicesTitle}
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        {homepageSettings.servicesSubtitle}
                    </p>
                    {homepageSettings.servicesDescription && (
                        <p className="text-base text-gray-500 max-w-3xl mx-auto leading-relaxed mt-3">
                            {homepageSettings.servicesDescription}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {serviceItems.map((service: any, index: number) => {
                        const IconComponent = resolveServiceIcon(service.icon)
                        const href = resolveServiceLink(service.link)

                        return (
                            <Card
                                key={service?.id ?? `service-${index}`}
                                className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
                            >
                                <CardHeader className="text-center pb-4">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                                        style={{ background: 'linear-gradient(135deg, var(--brand-primary-700,#061028), var(--brand-secondary,#C1272D))' }}
                                    >
                                        <IconComponent className="h-8 w-8 text-white" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-[color:var(--brand-secondary,#C1272D)] transition-colors">
                                        {service.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-center">
                                    {service.description && (
                                        <p className="text-gray-600 mb-6 leading-relaxed">
                                            {service.description}
                                        </p>
                                    )}
                                    <Link href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                                        <TouchButton
                                            variant="outline"
                                            className="w-full border-[color:rgba(var(--brand-primary-200-rgb,199_209_224),1)] text-[color:var(--brand-primary,#0A1A3F)] hover:bg-[color:rgba(var(--brand-primary-50-rgb,238_241_246),1)] hover:border-[color:rgba(var(--brand-secondary-300-rgb,228_117_122),1)]"
                                        >
                                            {service.ctaText?.trim() || homepageSettings.servicesCtaText}
                                        </TouchButton>
                                    </Link>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
