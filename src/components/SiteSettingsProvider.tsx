'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { normalizeBrandingObject } from '@/lib/branding'

interface SiteSettings {
  id?: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  neutralDarkColor?: string
  neutralLightColor?: string
  surfaceColor?: string
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

const defaultSettings: SiteSettings = normalizeBrandingObject({
  primaryColor: '#0A1A3F',
  secondaryColor: '#C1272D',
  accentColor: '#C9C9C9',
  neutralDarkColor: '#1F1F1F',
  neutralLightColor: '#EEEEEE',
  surfaceColor: '#FFFFFF',
  fontFamily: 'Inter',
  siteTitle: 'شركة الحمد لاستيراد السيارات',
  siteDescription: 'الموزع المعتمد لسيارات تاتا في مدن القناة - السيارات التجارية والبيك أب والشاحنات',
  contactEmail: 'info@elhamdimport.online',
  contactPhone: '+20 2 12345678',
  contactAddress: 'بورسعيد، مصر',
  socialLinks: {
    facebook: 'https://facebook.com/elhamdimport',
    twitter: 'https://twitter.com/elhamdimport',
    instagram: 'https://instagram.com/elhamdimport',
    linkedin: 'https://linkedin.com/company/elhamdimport'
  },
  seoSettings: {
    metaTitle: 'شركة الحمد للسيارات - الموزع المعتمد لتاتا موتورز في مدن القناة',
    metaDescription: 'الموزع المعتمد لسيارات تاتا في مدن القناة، متخصصون في السيارات التجارية والبيك أب والشاحنات فقط',
    keywords: 'سيارات تاتا، موزع تاتا، سيارات تجارية، شاحنات، بيك أب، مدن القناة',
    ogImage: '/og-image.jpg',
    twitterHandle: '@elhamdimport'
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
})

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
        const normalized = normalizeBrandingObject(data)
        setSettings(normalized)
        applySettingsToDOM(normalized)
      } else {
        console.warn('Failed to load site settings, using defaults')
      }
    } catch (error) {
      console.error('Error loading site settings:', error)
      // Keep default settings on error
    } finally {
      setLoading(false)
    }
  }

  const applySettingsToDOM = (settings: SiteSettings) => {
    const root = document.documentElement
    const primary = settings.primaryColor || defaultSettings.primaryColor
    const secondary = settings.secondaryColor || defaultSettings.secondaryColor
    const accent = settings.accentColor || defaultSettings.accentColor
    const neutralDark = settings.neutralDarkColor || '#1F1F1F'
    const neutralLight = settings.neutralLightColor || '#EEEEEE'
    const surface = settings.surfaceColor || '#FFFFFF'

    const toHsl = (hex: string) => {
      const result = hex.replace('#', '')
      if (result.length !== 6) return ''

      const r = parseInt(result.substring(0, 2), 16) / 255
      const g = parseInt(result.substring(2, 4), 16) / 255
      const b = parseInt(result.substring(4, 6), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0
      let s = 0
      const l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          default:
            h = (r - g) / d + 4
            break
        }
        h /= 6
      }

      const hDeg = Math.round(h * 360)
      const sPerc = Math.round(s * 100)
      const lPerc = Math.round(l * 100)
      return `${hDeg} ${sPerc}% ${lPerc}%`
    }

    const getContrastHex = (hex: string) => {
      const normalized = hex.replace('#', '')
      if (normalized.length !== 6) return '#FFFFFF'

      const r = parseInt(normalized.substring(0, 2), 16) / 255
      const g = parseInt(normalized.substring(2, 4), 16) / 255
      const b = parseInt(normalized.substring(4, 6), 16) / 255
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b
      return luminance > 0.6 ? '#1F1F1F' : '#FFFFFF'
    }

    // Brand CSS variables for Tailwind
    root.style.setProperty('--primary', toHsl(primary))
    root.style.setProperty('--primary-foreground', toHsl(getContrastHex(primary)))
    root.style.setProperty('--secondary', toHsl(secondary))
    root.style.setProperty('--secondary-foreground', toHsl(getContrastHex(secondary)))
    root.style.setProperty('--accent', toHsl(accent))
    root.style.setProperty('--accent-foreground', toHsl(getContrastHex(accent)))
    root.style.setProperty('--muted', toHsl(neutralLight))
    root.style.setProperty('--muted-foreground', toHsl(neutralDark))
    root.style.setProperty('--background', toHsl(surface))
    root.style.setProperty('--foreground', toHsl(neutralDark))
    root.style.setProperty('--card', toHsl(surface))
    root.style.setProperty('--card-foreground', toHsl(neutralDark))
    root.style.setProperty('--popover', toHsl(surface))
    root.style.setProperty('--popover-foreground', toHsl(neutralDark))
    root.style.setProperty('--border', toHsl(neutralLight))
    root.style.setProperty('--input', toHsl(neutralLight))
    root.style.setProperty('--ring', toHsl(secondary))
    root.style.setProperty('--sidebar', toHsl(surface))
    root.style.setProperty('--sidebar-foreground', toHsl(neutralDark))
    root.style.setProperty('--sidebar-primary', toHsl(primary))
    root.style.setProperty('--sidebar-primary-foreground', toHsl(getContrastHex(primary)))
    root.style.setProperty('--sidebar-accent', toHsl(neutralLight))
    root.style.setProperty('--sidebar-accent-foreground', toHsl(neutralDark))
    root.style.setProperty('--sidebar-border', toHsl(neutralLight))
    root.style.setProperty('--sidebar-ring', toHsl(secondary))

    // Preserve legacy custom props for components using raw hex values
    root.style.setProperty('--primary-color', primary)
    root.style.setProperty('--secondary-color', secondary)
    root.style.setProperty('--accent-color', accent)
    root.style.setProperty('--neutral-dark-color', neutralDark)
    root.style.setProperty('--neutral-light-color', neutralLight)
    root.style.setProperty('--surface-color', surface)

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