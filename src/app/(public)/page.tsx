import { Suspense } from 'react'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedVehicles } from '@/components/home/FeaturedVehicles'
import { ServicesSection } from '@/components/home/ServicesSection'
import { ContactSection } from '@/components/home/ContactSection'
import { LoadingCard } from '@/components/ui/LoadingIndicator'
import ConfigurablePopup from '@/components/ConfigurablePopup'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
      <Suspense fallback={<LoadingCard title="جاري تحميل..." className="h-[70vh] md:h-[80vh]" />}>
        <HeroSection />
      </Suspense>
      
      <div className="w-full">
        <Suspense fallback={<LoadingCard title="جاري تحميل السيارات المميزة..." className="h-96" />}>
          <FeaturedVehicles />
        </Suspense>
        
        <Suspense fallback={<LoadingCard title="جاري تحميل الخدمات..." className="h-96" />}>
          <ServicesSection />
        </Suspense>
        
        <Suspense fallback={<LoadingCard title="جاري تحميل معلومات الاتصال..." className="h-96" />}>
          <ContactSection />
        </Suspense>
      </div>

      <ConfigurablePopup />
    </div>
  )
}