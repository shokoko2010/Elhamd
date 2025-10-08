'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  Wrench, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  X,
  ImageIcon,
  FileText,
  TrendingUp,
  DollarSign,
  BarChart3,
  Send,
  Bell,
  Package,
  CreditCard,
  Calculator,
  Home,
  Building,
  Archive,
  Shield,
  ShoppingCart,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const sidebarItems = [
  {
    title: 'لوحة التحكم',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'إدارة الموقع',
    icon: Building,
    children: [
      {
        title: 'الصفحة الرئيسية',
        href: '/admin/homepage',
        icon: Home,
      },
      {
        title: 'الفروع',
        href: '/admin/branches',
        icon: Building,
      },
      {
        title: 'إعدادات الموقع',
        href: '/admin/site-settings',
        icon: Settings,
      },
      {
        title: 'الوسائط',
        href: '/admin/media',
        icon: ImageIcon,
      },
      {
        title: 'المحتوى',
        href: '/admin/content',
        icon: FileText,
      },
      {
        title: 'النوافذ المنبثقة',
        href: '/admin/popup-configs',
        icon: MessageSquare,
      },
    ]
  },
  {
    title: 'إدارة المركبات',
    icon: Car,
    children: [
      {
        title: 'موديلات السيارات',
        href: '/admin/models',
        icon: Car,
      },
      {
        title: 'المركبات',
        href: '/admin/vehicles',
        icon: Car,
      },
    ]
  },
  {
    title: 'الحجوزات والمواعيد',
    icon: Calendar,
    children: [
      {
        title: 'المواعيد',
        href: '/admin/appointments',
        icon: Calendar,
      },
      {
        title: 'التقويم',
        href: '/admin/calendar',
        icon: Calendar,
      },
      {
        title: 'حجوزات الخدمة',
        href: '/admin/bookings',
        icon: Wrench,
      },
    ]
  },
  {
    title: 'إدارة العملاء',
    icon: Users,
    children: [
      {
        title: 'العملاء',
        href: '/admin/customers',
        icon: Users,
      },
      {
        title: 'إدارة علاقات العملاء',
        href: '/admin/crm',
        icon: TrendingUp,
      },
    ]
  },
  {
    title: 'الإدارة المالية',
    icon: DollarSign,
    children: [
      {
        title: 'النظرة العامة',
        href: '/admin/finance',
        icon: DollarSign,
      },
      {
        title: 'الفواتير',
        href: '/admin/invoices/dashboard',
        icon: FileText,
      },
      {
        title: 'المدفوعات',
        href: '/admin/payments',
        icon: CreditCard,
      },
      {
        title: 'الضرائب',
        href: '/admin/tax',
        icon: Calculator,
      },
    ]
  },
  {
    title: 'التجارة الإلكترونية',
    icon: ShoppingCart,
    children: [
      {
        title: 'إدارة المتجر',
        href: '/admin/commerce',
        icon: ShoppingCart,
      },
    ]
  },
  {
    title: 'التقارير والتحليلات',
    icon: BarChart3,
    children: [
      {
        title: 'التقارير',
        href: '/admin/reports',
        icon: BarChart3,
      },
      {
        title: 'التسويق',
        href: '/admin/marketing',
        icon: Send,
      },
    ]
  },
  {
    title: 'المخزون والموارد',
    icon: Package,
    children: [
      {
        title: 'المخزون',
        href: '/admin/inventory',
        icon: Package,
      },
      {
        title: 'الأرشيف',
        href: '/admin/archive',
        icon: Archive,
      },
    ]
  },
  {
    title: 'نظام التأمين',
    icon: Shield,
    children: [
      {
        title: 'إدارة التأمين',
        href: '/admin/insurance',
        icon: Shield,
      },
    ]
  },
  {
    title: 'الإشعارات',
    href: '/admin/notifications',
    icon: Bell,
  },
  {
    title: 'الإعدادات',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    signOut({ callbackUrl: '/' })
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => pathname === href
  const isParentActive = (children: any[]) => 
    children.some(child => isActive(child.href))

  const renderMenuItem = (item: any) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.title)
    const active = hasChildren ? isParentActive(item.children) : isActive(item.href)

    if (hasChildren) {
      return (
        <div key={item.title} className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              'w-full justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              active 
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <div className="flex items-center space-x-3">
              <item.icon className={cn(
                'h-5 w-5',
                active ? 'text-blue-700' : 'text-gray-400'
              )} />
              {!isCollapsed && <span>{item.title}</span>}
            </div>
            {!isCollapsed && (
              isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )
            )}
          </Button>
          
          {(!isCollapsed && isExpanded) && (
            <div className="mr-4 space-y-1">
              {item.children.map((child: any) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(child.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <child.icon className={cn(
                    'h-4 w-4',
                    isActive(child.href) ? 'text-blue-700' : 'text-gray-400'
                  )} />
                  <span>{child.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          active
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
      >
        <item.icon className={cn(
          'h-5 w-5',
          active ? 'text-blue-700' : 'text-gray-400'
        )} />
        {!isCollapsed && <span>{item.title}</span>}
      </Link>
    )
  }

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full bg-white">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">لوحة التحكم</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => renderMenuItem(item))}
          </nav>

          {/* Mobile User Section */}
          <div className="p-4 border-t">
            {user && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="text-xs text-blue-600 capitalize">{user.role}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  // Desktop Sidebar Component
  const DesktopSidebar = () => (
    <div className={cn(
      'hidden md:flex bg-white border-r border-gray-200 transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">لوحة التحكم</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => renderMenuItem(item))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t">
          {!isCollapsed && user && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs text-blue-600 capitalize">{user.role}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={cn(
              'w-full justify-start',
              isCollapsed && 'px-2'
            )}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">تسجيل الخروج</span>}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  )
}