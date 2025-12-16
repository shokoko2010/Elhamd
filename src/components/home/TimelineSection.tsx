
import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { normalizeBrandingObject } from '@/lib/branding'
import { getTimeline } from '@/services/home-data'

export async function TimelineSection() {
    const timelineData = await getTimeline()

    let timelineEvents: any[] = []
    if (Array.isArray(timelineData)) {
        const unique = new Map()
        for (const item of timelineData) {
            const key = `${item.year}-${item.title}`
            if (!unique.has(key)) {
                unique.set(key, normalizeBrandingObject(item))
            }
        }
        timelineEvents = Array.from(unique.values())
    }

    if (timelineEvents.length === 0) return null

    return (
        <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <Badge className="bg-[color:var(--brand-primary-50,#EBF1F8)] text-[color:var(--brand-primary,#0A1A3F)] border border-[color:var(--brand-primary-200,#C7D3E2)] shadow-sm mb-6 px-4 py-2 text-base">
                        <Clock className="ml-2 h-4 w-4" />
                        تاريخنا العريق
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[color:var(--brand-primary,#0A1A3F)] tracking-tight">
                        مسيرة النجاح المستمرة
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        محطات مضيئة في تاريخ الحمد للسيارات، نبني المستقبل بخبرة الماضي
                    </p>
                </div>

                <div className="relative">
                    {/* Center Line with Brand Color */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-[color:var(--brand-primary-200,#C7D3E2)] via-[color:var(--brand-secondary,#C1272D)] to-[color:var(--brand-primary-200,#C7D3E2)] hidden md:block opacity-30"></div>

                    <div className="space-y-16 md:space-y-24">
                        {timelineEvents.map((event: any, index: number) => {
                            const isEven = index % 2 === 0
                            return (
                                <div key={index} className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''} gap-8 md:gap-0`}>
                                    {/* Content Side */}
                                    <div className="w-full md:w-1/2 flex justify-center md:block">
                                        <div className={`w-full max-w-lg ${isEven ? 'md:pr-16 lg:pr-24 text-right' : 'md:pl-16 lg:pl-24 text-left'}`}>
                                            <div className="bg-white p-8 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-[color:var(--brand-primary-50,#EBF1F8)] hover:border-[color:var(--brand-secondary-200,#F0B1B3)] transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
                                                {/* Brand Accent */}
                                                <div className={`absolute top-0 ${isEven ? 'right-0' : 'left-0'} w-1.5 h-full bg-gradient-to-b from-[color:var(--brand-primary,#0A1A3F)] to-[color:var(--brand-secondary,#C1272D)]`}></div>

                                                <span className="block text-6xl font-bold text-slate-50 absolute top-2 right-4 z-0 opacity-80 select-none font-outfit">
                                                    {event.year}
                                                </span>

                                                <div className="relative z-10">
                                                    <Badge className="mb-4 bg-[color:var(--brand-primary,#0A1A3F)] text-white hover:bg-[color:var(--brand-primary-800,#050c1f)] border-0">
                                                        {event.year}
                                                    </Badge>
                                                    <h3 className="text-2xl font-bold text-[color:var(--brand-primary,#0A1A3F)] mb-3 leading-snug">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-slate-600 leading-relaxed text-lg">
                                                        {event.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center Dot - Brand Style */}
                                    <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center hidden md:flex">
                                        <div className="relative flex items-center justify-center">
                                            <div className="w-4 h-4 bg-[color:var(--brand-secondary,#C1272D)] rounded-full z-20 shadow-[0_0_0_4px_white,0_0_0_8px_rgba(193,39,45,0.2)]"></div>
                                        </div>
                                    </div>

                                    {/* Empty Side */}
                                    <div className="w-full md:w-1/2 hidden md:block"></div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
