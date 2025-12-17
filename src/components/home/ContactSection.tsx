import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import CompanyMap from '@/components/ui/CompanyMap'
import { getCompanyInfo, getContactInfo, getSiteSettings } from '@/services/home-data'
import { normalizeBrandingObject } from '@/lib/branding'

// Helper Logic moved from page.tsx
const arabicDayLabels: Record<string, string> = {
    Saturday: 'السبت',
    Sunday: 'الأحد',
    Monday: 'الإثنين',
    Tuesday: 'الثلاثاء',
    Wednesday: 'الأربعاء',
    Thursday: 'الخميس',
    Friday: 'الجمعة'
}

const normalizeContactInfo = (data: any) => {
    if (!data) return null
    const workingHoursRaw = data.workingHours ?? {}
    const workingHoursObject = Array.isArray(workingHoursRaw)
        ? workingHoursRaw.reduce((acc: Record<string, string>, entry: any) => {
            if (entry?.day && entry?.hours) acc[entry.day] = entry.hours
            return acc
        }, {})
        : typeof workingHoursRaw === 'object' && workingHoursRaw !== null
            ? workingHoursRaw
            : {}

    const resolveValue = (key: string) => {
        const direct = workingHoursObject[key]
        if (typeof direct === 'string' && direct.trim()) return direct
        const capitalized = key.charAt(0).toUpperCase() + key.slice(1)
        const fallback = workingHoursObject[capitalized]
        if (typeof fallback === 'string' && fallback.trim()) return fallback
        return undefined
    }

    const weekdayKeys = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
    const weekdaySegments = weekdayKeys
        .map((day) => {
            const value = resolveValue(day)
            return value ? `${arabicDayLabels[day]}: ${value}` : null
        })
        .filter(Boolean) as string[]

    const weekdaysLine = resolveValue('weekdays') ?? resolveValue('Weekdays') ?? (weekdaySegments.length ? weekdaySegments.join(' • ') : null)
    const fridayValue = resolveValue('friday') ?? resolveValue('Friday')
    const saturdayValue = resolveValue('saturday') ?? resolveValue('Saturday')

    return {
        headquarters: {
            address: data.address ?? 'القاهرة، مصر',
            phone: data.primaryPhone ?? data.secondaryPhone ?? 'غير متوفر',
            email: data.primaryEmail ?? data.secondaryEmail ?? 'غير متوفر'
        },
        contactNumbers: {
            primary: data.primaryPhone ?? null,
            secondary: data.secondaryPhone ?? null
        },
        workingHours: {
            weekdays: weekdaysLine ?? 'السبت - الخميس: 9:00 ص - 5:00 م',
            friday: fridayValue ? `الجمعة: ${fridayValue}` : 'الجمعة: مغلق',
            saturday: saturdayValue ? `السبت: ${saturdayValue}` : undefined
        },
        emergency: data.emergency ?? null,
        socialMedia: data.socialMedia ?? {},
        headquartersGeo: typeof data.mapLat === 'number' && typeof data.mapLng === 'number'
            ? { lat: data.mapLat, lng: data.mapLng }
            : null,
        mapLat: data.mapLat,
        mapLng: data.mapLng,
        googleMapLink: data.googleMapLink,
        branches: data.branches || []
    }
}

export async function ContactSection() {
    const [companyInfoData, contactData, siteSettingsData] = await Promise.all([
        getCompanyInfo(),
        getContactInfo(),
        getSiteSettings()
    ])

    const companyInfo = normalizeBrandingObject(companyInfoData || {})
    const contactInfo = normalizeContactInfo(normalizeBrandingObject(contactData))
    const siteSettings = siteSettingsData || {}

    // Social Links Logic
    const getSocialLinks = () => {
        const priorityOrder = ['facebook', 'instagram', 'whatsapp', 'twitter', 'linkedin', 'youtube', 'tiktok', 'snapchat', 'telegram', 'messenger']
        const collected: Record<string, string> = {}
        const addLinks = (source?: Record<string, any>) => {
            if (!source || typeof source !== 'object') return
            Object.entries(source).forEach(([key, value]) => {
                if (typeof value === 'string' && value.trim()) {
                    const normalizedKey = key.trim().toLowerCase()
                    if (!collected[normalizedKey]) {
                        collected[normalizedKey] = value.trim()
                    }
                }
            })
        }
        addLinks(contactInfo?.socialMedia)
        addLinks(companyInfo?.socialMedia)
        addLinks(companyInfo?.socialLinks)
        addLinks(siteSettings?.socialLinks)

        const prioritized = priorityOrder.map((platform) => ({ platform, url: collected[platform] })).filter((item) => Boolean(item.url))
        const remaining = Object.entries(collected).filter(([platform]) => !priorityOrder.includes(platform)).map(([platform, url]) => ({ platform, url }))
        return [...prioritized, ...remaining]
    }
    const socialLinks = getSocialLinks()

    if (!contactInfo) return null

    return (
        <section className="py-24 relative overflow-hidden bg-[#0A1A3F] text-white">
            <div className="absolute inset-0 opacity-20 bg-white/5"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A1A3F] via-[#0A1A3F]/95 to-transparent"></div>

            {/* Animated Shapes */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <Badge className="bg-blue-500/10 text-blue-200 border-blue-500/20 mb-4 px-4 py-1.5 text-sm backdrop-blur-sm">
                        تواصل معنا
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        نحن هنا <span className="text-blue-400">لخدمتك</span>
                    </h2>
                    <p className="text-blue-100/60 max-w-2xl mx-auto text-lg">
                        فريقنا جاهز للإجابة على استفساراتكم وتقديم أفضل خدمات الدعم والمبيعات.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Contact Info Column */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Address Card */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                                    <MapPin className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-1">المقر الرئيسي</h4>
                                    <p className="text-blue-100/70 mb-3 leading-relaxed">{contactInfo.headquarters.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
                                    <Phone className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-white mb-1">اتصل بنا</h4>
                                    <div className="space-y-1">
                                        <Link href={`tel:${contactInfo.contactNumbers.primary}`} className="block text-blue-100/70 hover:text-white transition-colors dir-ltr text-right">
                                            {contactInfo.contactNumbers.primary}
                                        </Link>
                                        {contactInfo.contactNumbers.secondary && (
                                            <Link href={`tel:${contactInfo.contactNumbers.secondary}`} className="block text-blue-100/70 hover:text-white transition-colors dir-ltr text-right">
                                                {contactInfo.contactNumbers.secondary}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                                    <Mail className="h-6 w-6 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-1">البريد الإلكتروني</h4>
                                    <Link href={`mailto:${contactInfo.headquarters.email}`} className="text-blue-100/70 hover:text-white transition-colors break-all">
                                        {contactInfo.headquarters.email}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="pt-4 flex justify-center gap-3">
                            {socialLinks.map(({ platform, url }) => {
                                const Icon = platform.includes('facebook') ? Facebook :
                                    platform.includes('instagram') ? Instagram :
                                        platform.includes('twitter') ? Twitter :
                                            platform.includes('linkedin') ? Linkedin :
                                                platform.includes('youtube') ? Youtube : MessageCircle
                                return (
                                    <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                                        aria-label={platform}
                                    >
                                        <Icon className="h-5 w-5 text-white/80" />
                                    </a>
                                )
                            })}
                        </div>

                        {/* Branches Addresses List */}
                        {contactInfo.branches && contactInfo.branches.length > 0 && (
                            <div className="pt-6 border-t border-white/10 space-y-4">
                                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-blue-400" />
                                    فروعنا الأخرى
                                </h4>
                                {contactInfo.branches.map((branch: any) => (
                                    <div key={branch.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                                        <h5 className="text-lg font-semibold text-white mb-1">{branch.name}</h5>
                                        <p className="text-blue-100/70 text-sm leading-relaxed">{branch.address}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Map Column */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group">
                            <CompanyMap contactInfo={contactInfo} />

                            {/* Overlay Info for Working Hours on Desktop */}
                            <div className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur-md text-white p-5 rounded-xl border border-white/10 max-w-xs shadow-xl hidden md:block">
                                <div className="flex items-center gap-3 mb-3">
                                    <Clock className="h-5 w-5 text-blue-400" />
                                    <h4 className="font-bold">ساعات العمل</h4>
                                </div>
                                <div className="space-y-2 text-sm text-blue-100/80">
                                    {contactInfo.workingHours.weekdays && (
                                        <div className="flex justify-between gap-4">
                                            <span>أيام الأسبوع:</span>
                                            <span dir="ltr" className="text-white">{contactInfo.workingHours.weekdays}</span>
                                        </div>
                                    )}
                                    {contactInfo.workingHours.friday && (
                                        <div className="flex justify-between gap-4">
                                            <span>الجمعة:</span>
                                            <span dir="ltr" className="text-white">{contactInfo.workingHours.friday}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
