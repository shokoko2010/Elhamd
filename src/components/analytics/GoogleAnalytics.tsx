'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

interface GoogleAnalyticsProps {
  measurementId: string
}

function GoogleAnalyticsInner({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Manual script injection removed in favor of next/script
  // useEffect for page view tracking remains
  useEffect(() => {
    // Track page views when pathname or search params change
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')

      window.gtag('event', 'page_view', {
        page_path: url,
        page_title: document.title,
        send_to: measurementId
      })

      // Track custom events for page types
      const pageType = getPageType(pathname)
      window.gtag('event', 'page_view', {
        page_type: pageType,
        send_to: measurementId
      })
    }
  }, [pathname, searchParams, measurementId])

  return null
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <Suspense>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            send_page_view: true,
            custom_map: {
              'dimension1': 'user_type',
              'dimension2': 'page_type'
            }
          });
        `}
      </Script>
      <GoogleAnalyticsInner measurementId={measurementId} />
    </Suspense>
  )
}



// Helper function to determine page type
function getPageType(pathname: string): string {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/vehicles')) return 'vehicles'
  if (pathname.startsWith('/vehicle/')) return 'vehicle_detail'
  if (pathname.startsWith('/test-drive')) return 'test_drive'
  if (pathname.startsWith('/booking')) return 'booking'
  if (pathname.startsWith('/service-booking')) return 'service_booking'
  if (pathname.startsWith('/maintenance')) return 'maintenance'
  if (pathname.startsWith('/financing')) return 'financing'
  if (pathname.startsWith('/contact')) return 'contact'
  if (pathname.startsWith('/about')) return 'about'
  if (pathname.startsWith('/login')) return 'login'
  if (pathname.startsWith('/register')) return 'register'
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/forgot-password')) return 'forgot_password'
  return 'other'
}

// Event tracking functions
export const trackEvent = (
  eventName: string,
  eventParams: {
    [key: string]: any
  } = {}
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams)
  }
}

// Specific event tracking functions
export const trackVehicleView = (vehicleId: string, make: string, model: string) => {
  trackEvent('view_vehicle', {
    vehicle_id: vehicleId,
    make,
    model,
    event_category: 'engagement',
    event_label: 'vehicle_view'
  })
}

export const trackTestDriveBooking = (vehicleId: string, make: string, model: string) => {
  trackEvent('book_test_drive', {
    vehicle_id: vehicleId,
    make,
    model,
    event_category: 'conversion',
    event_label: 'test_drive_booking'
  })
}

export const trackServiceBooking = (serviceType: string) => {
  trackEvent('book_service', {
    service_type: serviceType,
    event_category: 'conversion',
    event_label: 'service_booking'
  })
}

export const trackContactForm = (formType: string) => {
  trackEvent('contact_form_submit', {
    form_type: formType,
    event_category: 'engagement',
    event_label: 'contact'
  })
}

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    event_category: 'engagement',
    event_label: 'search'
  })
}

export const trackFilterUsage = (filterType: string, filterValue: string) => {
  trackEvent('use_filter', {
    filter_type: filterType,
    filter_value: filterValue,
    event_category: 'engagement',
    event_label: 'filter'
  })
}

export const trackComparison = (vehicleIds: string[], comparisonCount: number) => {
  trackEvent('compare_vehicles', {
    vehicle_ids: vehicleIds,
    comparison_count: comparisonCount,
    event_category: 'engagement',
    event_label: 'comparison'
  })
}

export const trackUserLogin = (method: string) => {
  trackEvent('login', {
    method,
    event_category: 'authentication',
    event_label: 'login'
  })
}

export const trackUserRegistration = (method: string) => {
  trackEvent('sign_up', {
    method,
    event_category: 'authentication',
    event_label: 'registration'
  })
}

// Enhanced E-commerce tracking
export const trackViewItem = (vehicleId: string, make: string, model: string, price: number) => {
  trackEvent('view_item', {
    currency: 'EGP',
    value: price,
    items: [{
      item_id: vehicleId,
      item_name: `${make} ${model}`,
      item_brand: make,
      item_category: 'vehicle',
      price: price
    }]
  })
}

export const trackAddToComparison = (vehicleId: string, make: string, model: string, price: number) => {
  trackEvent('add_to_comparison', {
    currency: 'EGP',
    value: price,
    items: [{
      item_id: vehicleId,
      item_name: `${make} ${model}`,
      item_brand: make,
      item_category: 'vehicle',
      price: price
    }]
  })
}

// User type tracking
export const setUserType = (userType: 'guest' | 'registered' | 'admin') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', {
      user_type: userType
    })
  }
}

// Declare gtag on the window object
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, any> | string
    ) => void
    dataLayer: any[]
  }
}