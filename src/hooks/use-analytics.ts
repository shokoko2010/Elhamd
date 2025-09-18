'use client'

import {
  trackEvent,
  trackVehicleView,
  trackTestDriveBooking,
  trackServiceBooking,
  trackContactForm,
  trackSearch,
  trackFilterUsage,
  trackComparison,
  trackUserLogin,
  trackUserRegistration,
  trackViewItem,
  trackAddToComparison,
  setUserType
} from '@/components/analytics/GoogleAnalytics'

export function useAnalytics() {
  return {
    // Generic event tracking
    trackEvent,
    
    // Vehicle-related events
    trackVehicleView,
    trackTestDriveBooking,
    trackViewItem,
    trackAddToComparison,
    
    // Service-related events
    trackServiceBooking,
    
    // Form-related events
    trackContactForm,
    
    // Search and filter events
    trackSearch,
    trackFilterUsage,
    
    // Comparison events
    trackComparison,
    
    // Authentication events
    trackUserLogin,
    trackUserRegistration,
    
    // User properties
    setUserType
  }
}

// Specific hooks for common use cases
export function useVehicleAnalytics() {
  const { trackVehicleView, trackViewItem } = useAnalytics()
  
  const trackVehicleInteraction = (vehicleId: string, make: string, model: string, price?: number) => {
    trackVehicleView(vehicleId, make, model)
    if (price) {
      trackViewItem(vehicleId, make, model, price)
    }
  }
  
  return { trackVehicleInteraction }
}

export function useConversionAnalytics() {
  const { trackTestDriveBooking, trackServiceBooking, trackContactForm } = useAnalytics()
  
  return {
    trackTestDriveBooking,
    trackServiceBooking,
    trackContactForm
  }
}

export function useSearchAnalytics() {
  const { trackSearch, trackFilterUsage } = useAnalytics()
  
  return {
    trackSearch,
    trackFilterUsage
  }
}

export function useComparisonAnalytics() {
  const { trackComparison, trackAddToComparison } = useAnalytics()
  
  return {
    trackComparison,
    trackAddToComparison
  }
}

export function useAuthAnalytics() {
  const { trackUserLogin, trackUserRegistration, setUserType } = useAnalytics()
  
  return {
    trackUserLogin,
    trackUserRegistration,
    setUserType
  }
}