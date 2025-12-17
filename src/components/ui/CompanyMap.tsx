'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

// Dynamically import Leaflet component to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletCompanyMap'), {
    ssr: false,
    loading: () => (
        <Card className="h-full min-h-[400px] flex items-center justify-center bg-gray-50 border-0 shadow-inner">
            <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-semibold mb-2">جاري تحميل الخريطة...</h3>
            </CardContent>
        </Card>
    )
})

interface MapProps {
    contactInfo: any
}

export default function CompanyMap({ contactInfo }: MapProps) {
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { rootMargin: '200px' }
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <div ref={containerRef} className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl border border-gray-100 relative z-0">
            {isVisible ? (
                <LeafletMap contactInfo={contactInfo} />
            ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto animate-pulse" />
                </div>
            )}
        </div>
    )
}
