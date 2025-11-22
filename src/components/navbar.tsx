'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Car, 
  Menu, 
  X, 
  Phone, 
  Mail, 
  User, 
  LogOut, 
  Settings,
  Calendar,
  Wrench,
  MapPin,
  Search
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useSiteSettings } from '@/components/SiteSettingsProvider'

interface NavigationItem {
  id: string
  label: string
  href: string
  order: number
  isVisible: boolean
  children?: NavigationItem[]
}

// Create a safe wrapper component to handle auth state
function AuthAwareNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [navigation, setNavigation] = useState<NavigationItem[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()
  const { settings } = useSiteSettings()
  const isAuthenticated = !!user
  const isHome = pathname === '/'

  useEffect(() => {
    setIsMounted(true)
    fetchNavigation()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const fetchNavigation = async () => {
    try {
      const response = await fetch('/api/header/navigation')
      if (response.ok) {
        const navData = await response.json()
        setNavigation(navData)
      }
    } catch (error) {
      console.error('Error fetching navigation:', error)
      // Fallback to default navigation
      setNavigation([
        { id: '1', label: 'الرئيسية', href: '/', order: 1, isVisible: true },
        { id: '2', label: 'السيارات', href: '/vehicles', order: 2, isVisible: true },
        { id: '3', label: 'قيادة تجريبية', href: '/test-drive', order: 3, isVisible: true },
        { id: '4', label: 'حجز خدمة', href: '/service-booking', order: 4, isVisible: true },
        { id: '5', label: 'استشارة', href: '/consultation', order: 5, isVisible: true },
        { id: '6', label: 'اتصل بنا', href: '/contact', order: 6, isVisible: true },
      ])
    }
  }

  const getIconForLabel = (label: string) => {
    const iconMap: { [key: string]: any } = {
      'الرئيسية': Car,
      'Home': Car,
      'السيارات': Car,
      'Vehicles': Car,
      'بحث': Search,
      'Search': Search,
      'قيادة تجريبية': Calendar,
      'Test Drive': Calendar,
      'حجز خدمة': Wrench,
      'Service Booking': Wrench,
      'استشارة': Phone,
      'Consultation': Phone,
      'اتصل بنا': Phone,
      'Contact': Phone,
      'Services': Wrench,
      'About Us': User,
      'About': User,
    }
    return iconMap[label] || Car
  }

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const shouldUseTransparent = isHome && !isScrolled
  const navBaseClasses =
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl border-b'
  const navToneClasses = shouldUseTransparent
    ? 'bg-white/10 border-white/20 text-white shadow-none'
    : 'bg-white/95 border-white/70 text-gray-900 shadow-lg'
  const desktopLinkDefault = shouldUseTransparent
    ? 'text-white/80 hover:text-white'
    : 'text-gray-600 hover:text-blue-600'
  const desktopLinkActive = shouldUseTransparent
    ? 'text-white font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]'
    : 'text-blue-600'
  const contactTextClass = shouldUseTransparent ? 'text-white/80' : 'text-gray-600'
  const iconToneClass = shouldUseTransparent ? 'text-white' : 'text-gray-700'
  const actionGhostClass = shouldUseTransparent
    ? 'text-white hover:bg-white/10 hover:text-white'
    : 'text-gray-700 hover:bg-gray-100'
  const actionPrimaryClass = shouldUseTransparent
    ? 'bg-white text-blue-600 hover:bg-white/90'
    : ''

  if (!isMounted) {
    return (
      <nav className={`${navBaseClasses} ${navToneClasses}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-white" />
                <span className="text-xl font-bold">Al-Hamd Cars</span>
              </Link>
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`${navBaseClasses} ${navToneClasses}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="group flex items-center gap-3 rounded-full px-4 py-2 transition hover:scale-[1.01]"
            >
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteTitle}
                  className="h-14 w-auto max-h-16 shrink-0 rounded-md bg-transparent md:h-16"
                />
              ) : (
                <Car
                  className={`h-12 w-12 ${iconToneClass}`}
                  style={{ color: shouldUseTransparent ? undefined : settings.primaryColor }}
                />
              )}
              <span
                className={`text-lg md:text-xl font-semibold tracking-tight transition-colors ${shouldUseTransparent ? 'text-white drop-shadow-[0_0_12px_rgba(0,0,0,0.35)]' : ''}`}
                style={!shouldUseTransparent ? { color: settings.primaryColor } : undefined}
              >
                {settings.siteTitle}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation
              .filter(item => item.isVisible)
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                const Icon = getIconForLabel(item.label)
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? `${desktopLinkActive} ${shouldUseTransparent ? 'hover:text-white' : 'hover:text-blue-600'}`
                        : desktopLinkDefault
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${shouldUseTransparent ? 'text-white/80' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
          </div>

          {/* Contact Info */}
          <div className={`hidden lg:flex items-center space-x-4 text-sm ${contactTextClass}`}>
            {settings.contactPhone && (
              <div className="flex items-center space-x-1">
                <Phone className={`h-4 w-4 ${shouldUseTransparent ? 'text-white/80' : 'text-gray-500'}`} />
                <span>{settings.contactPhone}</span>
              </div>
            )}
            {settings.contactEmail && (
              <div className="flex items-center space-x-1">
                <Mail className={`h-4 w-4 ${shouldUseTransparent ? 'text-white/80' : 'text-gray-500'}`} />
                <span>{settings.contactEmail}</span>
              </div>
            )}
          </div>

          {/* Authentication */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback>
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.name || 'مستخدم'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>الملف الشخصي</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/bookings" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>حجوزاتي</span>
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>لوحة التحكم</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === 'STAFF' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/employee/dashboard" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>لوحة الموظفين</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className={actionGhostClass}>
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className={actionPrimaryClass}>
                    إنشاء حساب
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={shouldUseTransparent ? 'text-white hover:bg-white/10' : ''}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-lg text-gray-900">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation
                .filter(item => item.isVisible)
                .sort((a, b) => a.order - b.order)
                .map((item) => {
                  const Icon = getIconForLabel(item.label)
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              
              <div className="border-t pt-3 mt-3">
                <div className="px-3 py-2 text-xs text-gray-500 uppercase font-medium">
                  معلومات الاتصال
                </div>
                <div className="px-3 py-2 space-y-2">
                  {settings.contactPhone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{settings.contactPhone}</span>
                    </div>
                  )}
                  {settings.contactEmail && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{settings.contactEmail}</span>
                    </div>
                  )}
                  {settings.contactAddress && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{settings.contactAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-3 mt-3">
                {loading ? (
                  <div className="px-3 py-2">
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : isAuthenticated && user ? (
                  <div className="px-3 py-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name || 'مستخدم'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>الملف الشخصي</span>
                      </Link>
                      <Link
                        href="/dashboard/bookings"
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>حجوزاتي</span>
                      </Link>
                      {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>لوحة التحكم</span>
                        </Link>
                      )}
                      {user.role === 'STAFF' && (
                        <Link
                          href="/employee/dashboard"
                          className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>لوحة الموظفين</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-3 py-2 space-y-2">
                    <Link
                      href="/login"
                      className="block w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start">
                        تسجيل الدخول
                      </Button>
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        إنشاء حساب
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default function Navbar() {
  try {
    return <AuthAwareNavbar />
  } catch (error) {
    console.error('Navbar error:', error)
    // Fallback navbar without auth functionality
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-white/70 shadow-lg backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Al-Hamd Cars</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  إنشاء حساب
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }
}