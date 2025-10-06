'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Car, Calendar, Award } from 'lucide-react'
import Link from 'next/link'
import { WorkingSlider } from '@/components/ui/WorkingSlider'
import { EnhancedLazyImage } from '@/components/ui/enhanced-lazy-loading'
import { LoadingCard } from '@/components/ui/LoadingIndicator'
import { TouchButton, useDeviceInfo } from '@/components/ui/enhanced-mobile-optimization'

interface SliderItem {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  ctaText: string
  ctaLink: string
  badge?: string
  badgeColor?: string
}

export function HeroSection() {
  const deviceInfo = useDeviceInfo()
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([])
  const [companyInfo, setCompanyInfo] = useState<any>(null)
  const [companyStats, setCompanyStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch company info
        const companyInfoResponse = await fetch('/api/company-info')
        if (companyInfoResponse.ok) {
          const companyData = await companyInfoResponse.json()
          setCompanyInfo(companyData)
        }

        // Fetch company stats
        const statsResponse = await fetch('/api/about/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          if (Array.isArray(statsData)) {
            const uniqueStats = statsData.reduce((acc, current) => {
              if (!acc.find(item => item.label === current.label)) {
                acc.push(current)
              }
              return acc
            }, [])
            setCompanyStats(uniqueStats)
          }
        }

        // Fetch sliders
        const slidersResponse = await fetch('/api/sliders?activeOnly=true')
        if (slidersResponse.ok) {
          const slidersData = await slidersResponse.json()
          let sliders: SliderItem[] = []
          if (slidersData?.sliders) {
            sliders = slidersData.sliders
          } else if (Array.isArray(slidersData)) {
            sliders = slidersData
          }
          setSliderItems(sliders)
        }
      } catch (error) {
        console.error('Error fetching hero data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isAutoPlay && sliderItems.length > 0) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev < sliderItems.length - 1 ? prev + 1 : 0))
      }, 5000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isAutoPlay, sliderItems.length])

  return (
    <>
      {/* Mobile-Optimized Slider Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh]">
        <WorkingSlider 
          items={sliderItems}
          loading={loading}
          autoPlay={isAutoPlay}
          autoPlayInterval={5000}
          className="w-full h-full"
        />
      </section>

      {/* Company Introduction Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-right">
              {companyInfo ? (
                <>
                  <div className="mb-6">
                    <Badge className="bg-white/20 text-white border-white/30 mb-4">
                      <Award className="ml-2 h-4 w-4" />
                      {companyInfo.features?.[0] || 'وكيل معتمد'}
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    {companyInfo.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-6 text-blue-100 font-semibold">
                    {companyInfo.subtitle}
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
                          size={deviceInfo.isMobile ? 'lg' : 'xl'}
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
                <LoadingCard 
                  title="جاري تحميل معلومات الشركة..."
                  description="يرجى الانتظار بينما نقوم بتحميل المعلومات"
                />
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
                  quality={deviceInfo.isMobile ? 80 : 95}
                  priority={true}
                  mobileOptimized={true}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Stats */}
              {companyStats.length > 0 && (
                <div className="absolute -bottom-6 -right-6 bg-white text-blue-600 p-6 rounded-2xl shadow-2xl border border-blue-100">
                  <div className="text-3xl font-bold mb-1">
                    {companyStats.find(stat => stat.label?.includes('سنة'))?.number || '25+'}
                  </div>
                  <div className="text-sm text-blue-500 font-medium">
                    {companyStats.find(stat => stat.label?.includes('سنة'))?.label || 'سنة خبرة'}
                  </div>
                </div>
              )}
              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-400 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing between sections */}
      <div className="h-8 md:h-12 bg-gradient-to-b from-blue-800 to-gray-50"></div>
    </>
  )
}