'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSiteSettings } from '@/components/SiteSettingsProvider'
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
        const contentResponse = await fetch('/api/footer/content')
        if (contentResponse.ok) {
          const contentData = await contentResponse.json()
          setFooterContent(contentData)
        }

        // Fetch footer columns
        const columnsResponse = await fetch('/api/footer/columns')
        if (columnsResponse.ok) {
          const columnsData = await columnsResponse.json()
          setFooterColumns(columnsData)
        }

        // Fetch footer social links
        const socialResponse = await fetch('/api/footer/social')
        if (socialResponse.ok) {
          const socialData = await socialResponse.json()
          setFooterSocial(socialData)
        }
      } catch (error) {
        console.error('Error fetching footer data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFooterData()
  }, [])

  const parseContent = (content: string) => {
    return content.split('\n').filter(line => line.trim())
  }

  const generateLinkHref = (item: string) => {
    // Map Arabic text to appropriate routes
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
      'الصيانة': '/maintenance'
    }
    
    return linkMap[item] || `/${item.toLowerCase().replace(/\s+/g, '-')}`
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
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteTitle} className="h-8 w-auto" />
              ) : (
                <Car className="h-8 w-8" style={{ color: settings.primaryColor }} />
              )}
              <span className="text-xl font-bold">{settings.siteTitle}</span>
            </div>
            <p className="text-gray-300 mb-4">
              {settings.siteDescription}
            </p>
            {settings.socialLinks && (
              <div className="flex space-x-4">
                {settings.socialLinks.facebook && getSocialIcon('facebook', settings.socialLinks.facebook)}
                {settings.socialLinks.twitter && getSocialIcon('twitter', settings.socialLinks.twitter)}
                {settings.socialLinks.instagram && getSocialIcon('instagram', settings.socialLinks.instagram)}
                {settings.socialLinks.linkedin && getSocialIcon('linkedin', settings.socialLinks.linkedin)}
              </div>
            )}
          </div>

          {/* Dynamic Columns */}
          {footerColumns
            .filter(column => column.isVisible)
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <div key={column.id}>
                <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {parseContent(column.content).map((item, index) => (
                    <li key={index}>
                      {column.type === 'links' ? (
                        <Link 
                          href={generateLinkHref(item)} 
                          className="text-gray-300 hover:text-white transition-colors"
                        >
                          {item}
                        </Link>
                      ) : (
                        <span className="text-gray-300">{item}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {settings.siteTitle}. جميع الحقوق محفوظة.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                الشروط والأحكام
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                اتصل بنا
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}