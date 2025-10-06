'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingCard } from '@/components/ui/LoadingIndicator'
import { TouchButton, useDeviceInfo } from '@/components/ui/enhanced-mobile-optimization'
import { EnhancedLazySection } from '@/components/ui/enhanced-lazy-loading'
import Link from 'next/link'

export function ContactSection() {
  const [contactInfo, setContactInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const contactResponse = await fetch('/api/contact-info')
        if (contactResponse.ok) {
          const contactData = await contactResponse.json()
          setContactInfo(contactData)
        }
      } catch (error) {
        console.error('Error fetching contact info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContact()
  }, [])

  return (
    <EnhancedLazySection rootMargin="100px" preload={false}>
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative w-full overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              <Phone className="ml-2 h-4 w-4" />
              تواصل معنا
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              نحن هنا لمساعدتك
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              لا تتردد في التواصل معنا لأي استفسار أو لتحديد موعد زيارة للمعرض
            </p>
          </div>
          
          {contactInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
                <CardContent className="p-8 text-center">
                  <Phone className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                  <h3 className="text-xl font-bold mb-2">الهاتف</h3>
                  <p className="text-blue-100">{contactInfo.phone}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
                <CardContent className="p-8 text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                  <h3 className="text-xl font-bold mb-2">البريد الإلكتروني</h3>
                  <p className="text-blue-100">{contactInfo.email}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                  <h3 className="text-xl font-bold mb-2">العنوان</h3>
                  <p className="text-blue-100">{contactInfo.address}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[...Array(3)].map((_, i) => (
                <LoadingCard key={i} title="جاري تحميل معلومات الاتصال..." className="h-32" />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/contact">
              <TouchButton 
                variant="outline" 
                size="xl"
                className="bg-white hover:bg-blue-50 text-blue-600 border-white hover:border-blue-100 px-8 py-4 text-lg font-semibold"
              >
                تواصل معنا الآن
                <Phone className="mr-3 h-6 w-6" />
              </TouchButton>
            </Link>
          </div>
        </div>
      </section>
    </EnhancedLazySection>
  )
}