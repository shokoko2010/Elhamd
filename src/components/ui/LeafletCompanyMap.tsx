'use client'

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Button } from '@/components/ui/button'

// Fix for default marker icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

const customIcon = new L.Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

function ChangeView({ contactInfo }: { contactInfo: any }) {
    const map = useMap()

    useEffect(() => {
        if (!contactInfo) return

        const points: [number, number][] = []

        // Add HQ
        if (contactInfo.mapLat && contactInfo.mapLng) {
            points.push([contactInfo.mapLat, contactInfo.mapLng])
        }

        // Add Branches
        contactInfo.branches?.forEach((b: any) => {
            if (b.mapLat && b.mapLng) {
                points.push([b.mapLat, b.mapLng])
            }
        })

        if (points.length > 0) {
            const bounds = L.latLngBounds(points.map(p => L.latLng(p[0], p[1])))
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
        } else {
            // Default to Cairo if no points
            map.setView([30.0444, 31.2357], 10)
        }
    }, [contactInfo, map])

    return null
}

interface MapProps {
    contactInfo: any
}

export default function LeafletCompanyMap({ contactInfo }: MapProps) {
    // Default center (Cairo) - used only for initial render before effect kicks in
    const defaultCenter: [number, number] = [30.0444, 31.2357]

    const openInGoogleMaps = (lat: number, lng: number, link?: string) => {
        if (link) {
            window.open(link, '_blank')
            return
        }
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        window.open(url, '_blank')
    }

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={10}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
            >
                <ChangeView contactInfo={contactInfo} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Main HQ */}
                {contactInfo?.mapLat && contactInfo?.mapLng && (
                    <Marker position={[contactInfo.mapLat, contactInfo.mapLng]} icon={customIcon}>
                        <Popup>
                            <div className="text-center p-2">
                                <h3 className="font-bold mb-1">المقر الرئيسي</h3>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2 text-xs"
                                    onClick={() => openInGoogleMaps(contactInfo.mapLat, contactInfo.mapLng, contactInfo.googleMapLink)}
                                >
                                    فتح في خرائط جوجل
                                </Button>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Branches */}
                {contactInfo?.branches?.map((branch: any) => (
                    branch.mapLat && branch.mapLng ? (
                        <Marker
                            key={branch.id}
                            position={[branch.mapLat, branch.mapLng]}
                            icon={customIcon}
                        >
                            <Popup>
                                <div className="text-center p-2">
                                    <h3 className="font-bold mb-1">{branch.name}</h3>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-2 text-xs"
                                        onClick={() => openInGoogleMaps(branch.mapLat, branch.mapLng, branch.googleMapLink)}
                                    >
                                        فتح في خرائط جوجل
                                    </Button>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    )
}
