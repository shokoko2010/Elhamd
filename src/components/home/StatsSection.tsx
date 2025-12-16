
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { normalizeBrandingObject } from '@/lib/branding'
import { getStats } from '@/services/home-data'

export async function StatsSection() {
    const statsData = await getStats()

    let companyStats: any[] = []
    if (Array.isArray(statsData) && statsData.length > 0) {
        const unique = new Map()
        for (const item of statsData) {
            // @ts-ignore
            if (item && item.label && !unique.has(item.label)) {
                // @ts-ignore
                unique.set(item.label, normalizeBrandingObject(item))
            }
        }
        companyStats = Array.from(unique.values())
    }

    if (companyStats.length === 0) return null

    return (
        <section className="py-16 md:py-20 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[color:rgba(var(--brand-primary-50-rgb,238_241_246),1)] to-[color:rgba(var(--brand-secondary-50-rgb,251_236_236),1)] opacity-50"></div>
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                        <Users className="ml-2 h-4 w-4" />
                        إنجازاتنا
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                        أرقام تتحدث عنا
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        نحن فخورون بما حققناه على مدار سنوات من الخبرة والتميز
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
                    {companyStats.map((stat, index) => (
                        <div key={index} className="text-center group">
                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-blue-200">
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                                    {stat.number}
                                </div>
                                <div className="text-sm md:text-base text-gray-600 font-medium">
                                    {stat.label}
                                </div>
                                {stat.description && (
                                    <div className="text-xs text-gray-500 mt-2">
                                        {stat.description}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
