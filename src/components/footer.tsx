'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSiteSettings } from '@/components/SiteSettingsProvider'
import { normalizeBrandingObject, normalizeBrandingText } from '@/lib/branding'
import {
  Car,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Clock,
  Loader
} from 'lucide-react'

interface FooterContent {
  id: string
  logoUrl?: string
  logoText?: string
  tagline?: string
  primaryPhone?: string
  secondaryPhone?: string
  primaryEmail?: string
  secondaryEmail?: string
  address?: string
  workingHours?: string
  copyrightText?: string
  newsletterText?: string
  backToTopText?: string
  isActive: boolean
}

interface FooterColumn {
  id: string
  title: string
  content: string
  order: number
  isVisible: boolean
  type: string
}

interface FooterSocial {
  id: string
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
}

export default function Footer() {
  const { settings } = useSiteSettings()
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null)
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>([])
  const [footerSocial, setFooterSocial] = useState<FooterSocial | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        // Fetch footer content
        try {
          const contentResponse = await fetch('/api/footer/content')
          if (contentResponse.ok) {
            const contentData = await contentResponse.json()
            setFooterContent(normalizeBrandingObject(contentData))
          }
        } catch (e) { console.warn('Footer content fetch failed', e) }

        // Fetch footer columns
        try {
          const columnsResponse = await fetch('/api/footer/columns')
          if (columnsResponse.ok) {
            const columnsData = await columnsResponse.json()
            if (Array.isArray(columnsData) && columnsData.length > 0) {
              setFooterColumns(columnsData.map((column: FooterColumn) => normalizeBrandingObject(column)))
            } else {
              throw new Error('Empty columns')
            }
          } else {
            throw new Error('Failed to fetch columns')
          }
        } catch {
          // Fallback Columns
          setFooterColumns([
            {
              id: '1', title: 'روابط سريعة', order: 1, isVisible: true, type: 'LINK',
              content: 'الرئيسية\nمن نحن\nاتصل بنا\nسياسة الخصوصية\nالشروط والأحكام'
            },
            {
              id: '2', title: 'خدماتنا', order: 2, isVisible: true, type: 'LINK',
              content: 'بيع السيارات\nخدمة الصيانة\nقطع الغيار\nالتمويل'
            },
            {
              id: '3', title: 'تواصل معنا', order: 3, isVisible: true, type: 'CONTACT',
              content: '01000000000\ninfo@elhamdimport.com\nبورسعيد - الحي الإماراتي'
            }
          ])
        }

        // Fetch footer social links
        try {
          const socialResponse = await fetch('/api/footer/social')
          if (socialResponse.ok) {
            const socialData = await socialResponse.json()
            setFooterSocial(normalizeBrandingObject(socialData))
          }
        } catch (e) { console.warn('Footer social fetch failed', e) }

      } catch (error) {
        console.error('Error fetching footer data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFooterData()
  }, [])

  const parseContent = (content: string) => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content)
      return Array.isArray(parsed) ? parsed : content.split('\n').filter(line => line.trim())
    } catch {
      // Fallback to old format (split by newlines)
      return content.split('\n').filter(line => line.trim())
    }
  }

  const getItemText = (item: string | any) => {
    if (typeof item === 'object' && item.text) {
      return normalizeBrandingText(item.text)
    }

    return typeof item === 'string' ? normalizeBrandingText(item) : ''
  }

  const socialTextMap: Record<string, keyof FooterSocial | keyof typeof settings.socialLinks> = {
    'فيسبوك': 'facebook',
    'facebook': 'facebook',
    'تويتر': 'twitter',
    'twitter': 'twitter',
    'اكس': 'twitter',
    'انستغرام': 'instagram',
    'انستقرام': 'instagram',
    'instagram': 'instagram',
    'لينكدإن': 'linkedin',
    'linkedin': 'linkedin',
    'يوتيوب': 'youtube',
    'youtube': 'youtube',
    'تيك توك': 'tiktok',
    'tiktok': 'tiktok'
  }

  const isLikelyPhone = (value: string) => /^(\+?[0-9][0-9\s-]{5,})$/.test(value.replace(/\u200f|\u200e/g, ''))
  const isLikelyEmail = (value: string) => /.+@.+\..+/.test(value)

  const sanitizeHref = (href?: string) => {
    if (!href) return undefined
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
      return href
    }
    if (href.startsWith('/')) {
      return href
    }
    return `/${href}`
  }

  const resolveLinkHref = (item: string | any, columnType: string, text: string) => {
    if (typeof item === 'object' && item.href) {
      return sanitizeHref(item.href)
    }

    const trimmedText = text.trim()

    if (!trimmedText) {
      return undefined
    }

    if (columnType === 'SOCIAL') {
      const key = socialTextMap[trimmedText.toLowerCase()]
      if (key) {
        return sanitizeHref(
          (footerSocial && footerSocial[key as keyof FooterSocial]) ||
          (settings.socialLinks && settings.socialLinks[key as keyof typeof settings.socialLinks])
        )
      }
      return undefined
    }

    if (columnType === 'CONTACT') {
      if (isLikelyPhone(trimmedText)) {
        const phone = trimmedText.replace(/\s+/g, '')
        return `tel:${phone}`
      }
      if (isLikelyEmail(trimmedText)) {
        return `mailto:${trimmedText}`
      }
      if (trimmedText.includes('بورسعيد') || trimmedText.includes('القنطرة')) {
        return `https://maps.google.com/?q=${encodeURIComponent(trimmedText)}`
      }
      return undefined
    }

    const linkMap: { [key: string]: string } = {
      'الرئيسية': '/',
      'السيارات': '/vehicles',
      'الخدمات': '/services',
      'من نحن': '/about',
      'اتصل بنا': '/contact',
      'بيع السيارات': '/vehicles',
      'قيادة تجريبية': '/test-drive',
      'حجز الخدمة': '/service-booking',
      'التمويل': '/financing',
      'الصيانة': '/maintenance',
      'سياسة الخصوصية': '/privacy',
      'الشروط والأحكام': '/terms',
      'الأسئلة الشائعة': '/faq',
      'خريطة الموقع': '/sitemap',
      'الدعم الفني': '/support',
      'الضمان': '/warranty',
      'قطع الغيار': '/parts'
    }

    if (linkMap[trimmedText]) {
      return linkMap[trimmedText]
    }

    return undefined
  }

  const renderFooterItem = (item: any, columnType: string) => {
    const text = getItemText(item)

    if (!text) return null

    const href = resolveLinkHref(item, columnType, text)
    const linkClasses = 'text-gray-300 hover:text-white transition-colors'

    if (!href) {
      return <span className="text-gray-300">{text}</span>
    }

    const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')

    if (isExternal) {
      return (
        <a href={href} className={linkClasses} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      )
    }

    return (
      <Link href={href} className={linkClasses}>
        {text}
      </Link>
    )
  }

  const getSocialIcon = (platform: string, url: string) => {
    const iconMap: { [key: string]: any } = {
      facebook: Facebook,
      twitter: Twitter,
      instagram: Instagram,
      youtube: Youtube,
      linkedin: Facebook, // Using Facebook as fallback for LinkedIn
      tiktok: Instagram // Using Instagram as fallback for TikTok
    }

    const IconComponent = iconMap[platform.toLowerCase()] || Facebook

    return (
      <a
        key={platform}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-colors"
        aria-label={platform}
      >
        <IconComponent className="h-5 w-5" />
      </a>
    )
  }

  if (loading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2 text-gray-400">جاري تحميل الفوتر...</p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.16),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Company Info */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-xl lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              {footerContent?.logoUrl || settings.logoUrl ? (
                <img
                  src={footerContent?.logoUrl || settings.logoUrl}
                  alt={footerContent?.logoText || settings.siteTitle}
                  width="200"
                  height="64"
                  className="h-14 w-auto rounded-md bg-transparent md:h-16"
                />
              ) : (
                <Car className="h-12 w-12" style={{ color: settings.primaryColor }} />
              )}
              <span className="text-xl md:text-2xl font-semibold tracking-tight text-white">
                {footerContent?.logoText || settings.siteTitle}
              </span>
            </div>
            <p className="text-white/80 leading-relaxed mb-4">
              {footerContent?.tagline || settings.siteDescription}
            </p>
            {(footerSocial || settings.socialLinks) && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">تابعنا</span>
                <div className="flex items-center gap-3">
                  {footerSocial?.facebook && getSocialIcon('facebook', footerSocial.facebook)}
                  {footerSocial?.twitter && getSocialIcon('twitter', footerSocial.twitter)}
                  {footerSocial?.instagram && getSocialIcon('instagram', footerSocial.instagram)}
                  {footerSocial?.linkedin && getSocialIcon('linkedin', footerSocial.linkedin)}
                  {footerSocial?.youtube && getSocialIcon('youtube', footerSocial.youtube)}
                  {settings.socialLinks?.facebook && getSocialIcon('facebook', settings.socialLinks.facebook)}
                  {settings.socialLinks?.twitter && getSocialIcon('twitter', settings.socialLinks.twitter)}
                  {settings.socialLinks?.instagram && getSocialIcon('instagram', settings.socialLinks.instagram)}
                  {settings.socialLinks?.linkedin && getSocialIcon('linkedin', settings.socialLinks.linkedin)}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Columns */}
          {footerColumns
            .filter(column => column.isVisible)
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <div
                key={column.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-950/20 backdrop-blur"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
                  {column.title}
                </h3>
                <ul className="space-y-2 text-white/80">
                  {parseContent(column.content).map((item, index) => (
                    <li key={index}>
                      {renderFooterItem(item, column.type)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-white/70 text-sm text-center md:text-right leading-relaxed">
              <span
                dangerouslySetInnerHTML={{
                  __html: footerContent?.copyrightText || `© ${new Date().getFullYear()} ${settings.siteTitle}. جميع الحقوق محفوظة.`
                }}
              />
              <span className="block md:inline md:ml-2">
                تم التطوير ويتم الإدارة بواسطة{' '}
                <a
                  href="https://arab-web3.com"
                  className="text-white font-semibold hover:text-blue-200 underline decoration-dotted"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Arab Web 3
                </a>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 justify-center md:justify-start">
              <Link href="/privacy" className="transition hover:text-white">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="transition hover:text-white">
                الشروط والأحكام
              </Link>
              <Link href="/contact" className="transition hover:text-white">
                اتصل بنا
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}