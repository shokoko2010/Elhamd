'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Menu,
  X,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronDown,
  Car,
  Settings,
  User,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface SiteSettings {
  id: string
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
  headerSettings: {
    showLogo: boolean
    showNavigation: boolean
    showContactInfo: boolean
    showSocialLinks: boolean
    stickyHeader: boolean
    transparentHeader: boolean
  }
}

interface NavigationItem {
  label: string
  href: string
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Vehicles',
    href: '/vehicles',
    children: [
      { label: 'All Vehicles', href: '/vehicles' },
      { label: 'New Cars', href: '/vehicles?condition=new' },
      { label: 'Used Cars', href: '/vehicles?condition=used' },
      { label: 'Special Offers', href: '/vehicles?offer=true' }
    ]
  },
  { label: 'Services', href: '/service-booking' },
  { label: 'Test Drive', href: '/test-drive' },
  { label: 'Financing', href: '/financing' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' }
]

export default function DynamicHeader() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    fetchSiteSettings()

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('/api/site-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data[0] || null)
      }
    } catch (error) {
      console.error('Error fetching site settings:', error)
    }
  }

  const handleSignOut = async () => {
    await logout()
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const headerClasses = () => {
    if (!settings) return 'bg-white shadow-md'

    const baseClasses = 'transition-all duration-300'
    const scrollClasses = settings.headerSettings.stickyHeader && isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''
    const transparentClasses = settings.headerSettings.transparentHeader && !isScrolled ? 'absolute top-0 left-0 right-0 z-50 bg-transparent' : 'bg-white relative'

    return `${baseClasses} ${scrollClasses} ${transparentClasses}`
  }

  const textClasses = () => {
    if (!settings) return 'text-gray-900'
    return settings.headerSettings.transparentHeader && !isScrolled ? 'text-white' : 'text-gray-900'
  }

  if (!settings) {
    return (
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">Loading...</div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={headerClasses()}>
      {/* Top Bar */}
      {settings.headerSettings.showContactInfo && (
        <div className={`text-sm py-2 ${textClasses()} bg-gray-50`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {settings.contactPhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{settings.contactPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{settings.contactEmail}</span>
                </div>
              </div>

              {settings.headerSettings.showSocialLinks && (
                <div className="flex items-center gap-3">
                  {settings.socialLinks.facebook && (
                    <a href={settings.socialLinks.facebook} className="hover:text-blue-600 transition-colors">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {settings.socialLinks.twitter && (
                    <a href={settings.socialLinks.twitter} className="hover:text-blue-400 transition-colors">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {settings.socialLinks.instagram && (
                    <a href={settings.socialLinks.instagram} className="hover:text-pink-600 transition-colors">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {settings.socialLinks.linkedin && (
                    <a href={settings.socialLinks.linkedin} className="hover:text-blue-700 transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          {settings.headerSettings.showLogo && (
            <Link href="/" className="flex items-center gap-3">
              {settings.logoUrl ? (
                <Image
                  src={settings.logoUrl}
                  alt={settings.siteTitle}
                  width={160}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
              )}
              <span className={`text-xl font-bold ${textClasses()}`}>
                {settings.siteTitle}
              </span>
            </Link>
          )}

          {/* Desktop Navigation */}
          {settings.headerSettings.showNavigation && (
            <nav className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <div key={item.href} className="relative">
                  {item.children ? (
                    <div className="group">
                      <button
                        className={`flex items-center gap-1 font-medium transition-colors hover:text-blue-600 ${isActive(item.href) ? 'text-blue-600' : textClasses()
                          }`}
                        onMouseEnter={() => setActiveDropdown(item.href)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        {item.label}
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {activeDropdown === item.href && (
                        <div
                          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50"
                          onMouseEnter={() => setActiveDropdown(item.href)}
                          onMouseLeave={() => setActiveDropdown(null)}
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${isActive(child.href) ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                                }`}
                              onClick={() => setActiveDropdown(null)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`font-medium transition-colors hover:text-blue-600 ${isActive(item.href) ? 'text-blue-600' : textClasses()
                        }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && settings.headerSettings.showNavigation && (
        <div className="lg:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-md font-medium transition-colors ${isActive(item.href) ? 'text-blue-600 bg-blue-50' : textClasses()
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>

                  {item.children && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-2 rounded-md text-sm transition-colors ${isActive(child.href) ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                            }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}