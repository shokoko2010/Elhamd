import Link from 'next/link'
import { Award, Car, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TouchButton } from '@/components/ui/enhanced-mobile-optimization'
import { EnhancedLazyImage } from '@/components/ui/enhanced-lazy-loading'
import { getCompanyInfo } from '@/services/home-data'
import { normalizeBrandingObject, normalizeBrandingText, DISTRIBUTOR_BRANDING } from '@/lib/branding'

export async function CompanyIntroSection() {
    const companyInfoData = await getCompanyInfo()
    const companyInfo = normalizeBrandingObject(companyInfoData || {})

    const brandHeroGradient = 'linear-gradient(135deg, var(--brand-primary-600, #081432) 0%, var(--brand-primary-700, #061028) 55%, var(--brand-secondary-500, #C1272D) 100%)'

    return (
        <section
            className="py-16 md:py-24 text-white relative overflow-hidden"
            style={{ background: brandHeroGradient }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="text-right">
                        {companyInfoData ? (
                            <>
                                <div className="mb-6">
                                    <Badge className="bg-white/20 text-white border-white/30 mb-4">
                                        <Award className="ml-2 h-4 w-4" />
                                        {companyInfo.features?.[0] || 'موزع معتمد'}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                    {companyInfo.title}
                                </h1>
                                <p className="text-xl md:text-2xl mb-6 text-blue-100 font-semibold">
                                    {normalizeBrandingText(companyInfo.subtitle || DISTRIBUTOR_BRANDING)}
                                </p>
                                <p className="text-lg md:text-xl mb-8 text-blue-50 leading-relaxed">
                                    {companyInfo.description}
                                </p>
                                <div className="space-y-4 mb-10">
                                    {companyInfo.features && companyInfo.features.map((feature: string, index: number) => (
                                        <div key={index} className="flex items-center gap-3 group">
                                            <div className="w-3 h-3 bg-white rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                                            <span className="text-blue-50 text-lg group-hover:text-white transition-colors">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    {companyInfo.ctaButtons && companyInfo.ctaButtons.map((button: any, index: number) => (
                                        <Link key={index} href={button.link} className="flex-1 sm:flex-none">
                                            <TouchButton
                                                variant={button.variant === 'primary' ? 'primary' : 'outline'}
                                                size="xl"
                                                fullWidth
                                                hapticFeedback={true}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 border-blue-600 flex items-center justify-center"
                                            >
                                                {button.text === 'استعرض السيارات' && <Car className="ml-3 h-6 w-6" />}
                                                {button.text === 'قيادة تجريبية' && <Calendar className="ml-3 h-6 w-6" />}
                                                {button.text}
                                            </TouchButton>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-white">جاري تحميل المعلومات...</div>
                        )}
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] bg-gradient-to-br from-white/10 to-white/20 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm border border-white/20">
                            <EnhancedLazyImage
                                src={companyInfo?.imageUrl || "/uploads/showroom-luxury.jpg"}
                                alt="معرض الحمد للسيارات"
                                width={800}
                                height={600}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                quality={90}
                                priority={false} // Lazy load intro image, favor hero
                                mobileOptimized={true}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-20 blur-xl bg-[color:var(--brand-secondary,#C1272D)]"></div>
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-20 blur-xl bg-[color:var(--brand-primary-400,#798fb0)]"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}
