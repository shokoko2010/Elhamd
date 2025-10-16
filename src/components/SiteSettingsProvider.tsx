'use client'

import { useState, useEffect } from 'react'
import React from 'react'

interface SiteSettings {
  id?: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  siteTitle: string
  siteDescription: string
  contactEmail: string
  contactPhone?: string
  contactAddress?: string
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  seoSettings: {
    metaTitle: string
    metaDescription: string
    keywords: string
    ogImage?: string
    twitterHandle?: string
  }
  headerSettings: {
    showLogo: boolean
    showNavigation: boolean
    showContactInfo: boolean
    showSocialLinks: boolean
    stickyHeader: boolean
    transparentHeader: boolean
  }
  footerSettings: {
    showLogo: boolean
    showNavigation: boolean
    showContactInfo: boolean
    showSocialLinks: boolean
    showNewsletter: boolean
    showCopyright: boolean
    columns: number
  }
}

interface SiteSettingsContextType {
  settings: SiteSettings
  loading: boolean
}

const defaultSettings: SiteSettings = {
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  fontFamily: 'Inter',
  siteTitle: 'Al-Hamd Cars',
  siteDescription: 'Premium Car Dealership in Egypt',
  contactEmail: 'info@elhamdimport.com',
  contactPhone: '+20 123 456 7890',
  contactAddress: 'Cairo, Egypt',
  socialLinks: {
    facebook: 'https://facebook.com/alhamdcars',
    twitter: 'https://twitter.com/alhamdcars',
    instagram: 'https://instagram.com/alhamdcars',
    linkedin: 'https://linkedin.com/company/alhamdcars'
  },
  seoSettings: {
    metaTitle: 'Al-Hamd Cars - Premium Car Dealership in Egypt',
    metaDescription: 'Discover premium cars at Al-Hamd Cars. Best prices, excellent service, and wide selection of vehicles.',
    keywords: 'cars, dealership, egypt, premium vehicles, car sales',
    ogImage: '/og-image.jpg',
    twitterHandle: '@alhamdcars'
  },
  headerSettings: {
    showLogo: true,
    showNavigation: true,
    showContactInfo: true,
    showSocialLinks: true,
    stickyHeader: true,
    transparentHeader: false
  },
  footerSettings: {
    showLogo: true,
    showNavigation: true,
    showContactInfo: true,
    showSocialLinks: true,
    showNewsletter: true,
    showCopyright: true,
    columns: 4
  }
}

export const SiteSettingsContext = React.createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  loading: true
})

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSiteSettings()
  }, [])

  const loadSiteSettings = async () => {
    try {
      const response = await fetch('/api/public/site-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        applySettingsToDOM(data)
      }
    } catch (error) {
      console.error('Error loading site settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const applySettingsToDOM = (settings: SiteSettings) => {
    // Apply CSS custom properties for colors
    const root = document.documentElement
    root.style.setProperty('--primary-color', settings.primaryColor)
    root.style.setProperty('--secondary-color', settings.secondaryColor)
    root.style.setProperty('--accent-color', settings.accentColor)
    
    // Apply font family
    if (settings.fontFamily && settings.fontFamily !== 'Inter') {
      root.style.setProperty('--font-family', settings.fontFamily)
    }

    // Update favicon
    if (settings.faviconUrl) {
      const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement
      if (favicon) {
        favicon.href = settings.faviconUrl
      } else {
        const newFavicon = document.createElement('link')
        newFavicon.rel = 'icon'
        newFavicon.href = settings.faviconUrl
        document.head.appendChild(newFavicon)
      }
    }

    // Update page title
    if (settings.seoSettings?.metaTitle) {
      document.title = settings.seoSettings.metaTitle
    }

    // Update meta description
    let metaDescription = document.querySelector("meta[name='description']") as HTMLMetaElement
    if (metaDescription) {
      metaDescription.content = settings.seoSettings?.metaDescription || ''
    } else {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      metaDescription.content = settings.seoSettings?.metaDescription || ''
      document.head.appendChild(metaDescription)
    }

    // Update meta keywords
    let metaKeywords = document.querySelector("meta[name='keywords']") as HTMLMetaElement
    if (metaKeywords) {
      metaKeywords.content = settings.seoSettings?.keywords || ''
    } else {
      metaKeywords = document.createElement('meta')
      metaKeywords.name = 'keywords'
      metaKeywords.content = settings.seoSettings?.keywords || ''
      document.head.appendChild(metaKeywords)
    }

    // Update Open Graph meta tags
    updateMetaTag('property', 'og:title', settings.seoSettings?.metaTitle)
    updateMetaTag('property', 'og:description', settings.seoSettings?.metaDescription)
    updateMetaTag('property', 'og:image', settings.seoSettings?.ogImage)

    // Update Twitter Card meta tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', settings.seoSettings?.metaTitle)
    updateMetaTag('name', 'twitter:description', settings.seoSettings?.metaDescription)
    updateMetaTag('name', 'twitter:image', settings.seoSettings?.ogImage)
    updateMetaTag('name', 'twitter:site', settings.seoSettings?.twitterHandle)
  }

  const updateMetaTag = (attribute: string, value: string, content?: string) => {
    if (!content) return
    
    let metaTag = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement
    if (metaTag) {
      metaTag.content = content
    } else {
      metaTag = document.createElement('meta')
      metaTag.setAttribute(attribute, value)
      metaTag.content = content
      document.head.appendChild(metaTag)
    }
  }

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = React.useContext(SiteSettingsContext)
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  }
  return context
}