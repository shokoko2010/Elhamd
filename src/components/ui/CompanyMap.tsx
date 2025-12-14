'use client'

import React from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '400px',
    borderRadius: '1rem'
}

interface MapProps {
    contactInfo: any
}

export default function CompanyMap({ contactInfo }: MapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    })

    const defaultCenter = {
        lat: contactInfo?.mapLat || 30.0444,
        lng: contactInfo?.mapLng || 31.2357
    }

    const [mapCenter, setMapCenter] = React.useState(defaultCenter)

    React.useEffect(() => {
        if (contactInfo?.branches && contactInfo.branches.length > 0) {
            const firstBranch = contactInfo.branches.find((b: any) => b.mapLat && b.mapLng)
            if (firstBranch) {
                setMapCenter({ lat: firstBranch.mapLat, lng: firstBranch.mapLng })
            }
        } else if (contactInfo?.mapLat && contactInfo?.mapLng) {
            setMapCenter({ lat: contactInfo.mapLat, lng: contactInfo.mapLng })
        }
    }, [contactInfo])

    const openInGoogleMaps = (lat?: number, lng?: number) => {
        const targetLat = lat || mapCenter.lat
        const targetLng = lng || mapCenter.lng

        // Check if we have a custom Map URL in the contact info
        if (contactInfo?.mapUrl && !lat && !lng) {
            window.open(contactInfo.mapUrl, '_blank')
            return
        }

        const url = `https://www.google.com/maps/search/?api=1&query=${targetLat},${targetLng}`
        window.open(url, '_blank')
    }

    const shouldShowMap = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY &&
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE' &&
        isLoaded && !loadError

    if (!shouldShowMap) {
        return (
            <Card className="h-full min-h-[400px] flex items-center justify-center bg-gray-50 border-0 shadow-inner">
                <CardContent className="p-8 text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">الخريطة غير متاحة</h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                        {loadError ? `خطأ في تحميل الخريطة: ${loadError.message}` :
                            (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') ?
                                'يرجى إضافة مفتاح Google Maps API في إعدادات النظام لعرض الخريطة' :
                                'جاري تحميل الخريطة...'}
                    </p>
                    <Button variant="outline" onClick={() => openInGoogleMaps()}>
                        فتح في خرائط جوجل
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={11}
                options={{
                    disableDefaultUI: false,
                    clickableIcons: true,
                    scrollwheel: false,
                    styles: [
                        {
                            featureType: 'all',
                            elementType: 'geometry.fill',
                            stylers: [{ color: '#f8f9fa' }]
                        },
                        {
                            featureType: 'water',
                            elementType: 'geometry.fill',
                            stylers: [{ color: '#e1f5fe' }]
                        }
                    ]
                }}
            >
                {/* Main HQ */}
                {contactInfo?.mapLat && contactInfo?.mapLng && (
                    <Marker
                        position={{ lat: contactInfo.mapLat, lng: contactInfo.mapLng }}
                        title="المقر الرئيسي"
                        onClick={() => openInGoogleMaps(contactInfo.mapLat, contactInfo.mapLng)}
                    />
                )}

                {/* Branches */}
                {contactInfo?.branches?.map((branch: any) => (
                    branch.mapLat && branch.mapLng ? (
                        <Marker
                            key={branch.id}
                            position={{ lat: branch.mapLat, lng: branch.mapLng }}
                            title={branch.name}
                            onClick={() => openInGoogleMaps(branch.mapLat, branch.mapLng)}
                        />
                    ) : null
                ))}
            </GoogleMap>
        </div>
    )
}
