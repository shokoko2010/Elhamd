
import { normalizeBrandingObject } from '@/lib/branding'
import { getValues } from '@/services/home-data'

export async function ValuesSection() {
    const valuesData = await getValues()

    let companyValues: any[] = []
    if (Array.isArray(valuesData)) {
        const unique = new Map()
        for (const item of valuesData) {
            if (!unique.has(item.title)) {
                unique.set(item.title, normalizeBrandingObject(item))
            }
        }
        companyValues = Array.from(unique.values())
    }

    if (companyValues.length === 0) return null

    return (
        <section className="py-16 md:py-24 bg-gradient-to-br from-[color:rgba(var(--brand-primary-50-rgb,238_241_246),1)] to-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">قيمنا ومبادئنا</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {companyValues.map((value: any, index: number) => (
                        <div key={index} className="text-center p-6 bg-white rounded-xl shadow">
                            <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                            <p className="text-gray-600">{value.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
