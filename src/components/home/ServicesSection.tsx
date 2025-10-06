'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Wrench } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingCard } from '@/components/ui/LoadingIndicator'
import { EnhancedLazySection } from '@/components/ui/enhanced-lazy-loading'

export function ServicesSection() {
  const [serviceItems, setServiceItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const serviceItemsResponse = await fetch('/api/service-items')
        if (serviceItemsResponse.ok) {
          const serviceData = await serviceItemsResponse.json()
          setServiceItems(Array.isArray(serviceData) ? serviceData : [])
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  return (
    <EnhancedLazySection rootMargin="100px" preload={false}>
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              <Wrench className="ml-2 h-4 w-4" />
              خدماتنا
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              خدماتنا المتكاملة
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              نقدم مجموعة شاملة من الخدمات لضمان رحلة شراء سيارة ممتعة وخالية من المتاعب
            </p>
          </div>
          
          {serviceItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {serviceItems.map((service, index) => (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Wrench className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <LoadingCard key={i} title="جاري تحميل الخدمة..." className="h-48" />
              ))}
            </div>
          )}
        </div>
      </section>
    </EnhancedLazySection>
  )
}