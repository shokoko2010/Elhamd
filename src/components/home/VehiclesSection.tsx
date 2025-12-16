
import Link from 'next/link'
import { Car, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TouchButton } from '@/components/ui/enhanced-mobile-optimization'
import { ModernVehicleCarousel } from '@/components/home/ModernVehicleCarousel'
import { normalizeBrandingObject, normalizeBrandingText, DISTRIBUTOR_BRANDING } from '@/lib/branding'
import { getCompanyInfo, getPublicVehicles } from '@/services/home-data'
import { PublicVehicle } from '@/types/public-vehicle'

const uniqueVehicles = (vehicles: PublicVehicle[]) => {
    const seen = new Set<string>()
    return vehicles.filter((vehicle) => {
        if (!vehicle?.id) return false
        if (seen.has(vehicle.id)) return false
        seen.add(vehicle.id)
        return true
    })
}

export async function VehiclesSection() {
    const [companyInfoData, vehiclesDataResponse] = await Promise.all([
        getCompanyInfo(),
        getPublicVehicles(6, 'AVAILABLE', undefined)
    ])

    const companyInfo = normalizeBrandingObject(companyInfoData || {})

    let featuredVehicles: PublicVehicle[] = []
    let totalVehiclesCount = 0
    const vehiclesRaw = vehiclesDataResponse?.vehicles;
    if (Array.isArray(vehiclesRaw)) {
        // @ts-ignore
        featuredVehicles = uniqueVehicles(vehiclesRaw.map((v: any) => normalizeBrandingObject(v)))
        totalVehiclesCount = vehiclesDataResponse?.total || 0
    }

    const brandTextGradient = 'linear-gradient(90deg, var(--brand-neutral-dark, #1F1F1F) 0%, var(--brand-primary-500, #0A1A3F) 55%, var(--brand-secondary-500, #C1272D) 100%)'

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative w-full">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-30 blur-3xl bg-[color:rgba(var(--brand-primary-100-rgb,225_230_239),1)]"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-30 blur-3xl bg-[color:rgba(var(--brand-secondary-100-rgb,247_216_217),1)]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                        <Car className="ml-2 h-4 w-4" />
                        {companyInfo?.features?.[0] || 'سياراتنا'}
                    </Badge>
                    <h2
                        className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent"
                        style={{ backgroundImage: brandTextGradient }}
                    >
                        {companyInfo?.title || 'استعرض سيارات تاتا'}
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        {normalizeBrandingText(companyInfo?.subtitle || DISTRIBUTOR_BRANDING)}
                    </p>
                </div>

                <ModernVehicleCarousel
                    vehicles={featuredVehicles}
                    loading={false}
                    totalVehiclesCount={totalVehiclesCount}
                />
            </div>
        </section>
    )
}
