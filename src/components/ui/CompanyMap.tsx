'use client'

import dynamic from 'next/dynamic'
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
    // If we have a specific branch with a map link, we can potentially use it or just pass it down
    // The actual map implementation will reside in LeafletCompanyMap (which is client-side only)
    return (
        <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl border border-gray-100 relative z-0">
            <LeafletMap contactInfo={contactInfo} />
        </div>
    )
}
