'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  BarChart3,
  Bell,
  Building,
  Calendar,
  Car,
  Calculator,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  Database,
  DollarSign,
  FileCheck,
  FileText,
  HelpCircle,
  ImageIcon,
  Layout,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Phone,
  Settings,
  Shield,
  ShoppingCart,
  Target,
  TrendingUp,
  Truck,
  Type,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'

type SidebarLink = {
  title: string
  href: string
  icon: LucideIcon
}

type SidebarSection = {
  type: 'section'
  title: string
  icon: LucideIcon
  items: SidebarLink[]
}

type SidebarEntry = SidebarSection | (SidebarLink & { type: 'link' })

const sidebarConfig: SidebarEntry[] = [
  {
    type: 'link',
    title: 'لوحة التحكم',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    type: 'section',
    title: 'المبيعات والعملاء',
    icon: Users,
    items: [
      {
        title: 'الحجوزات',
        href: '/admin/bookings',
        icon: Calendar,
      },
      {
        title: 'العملاء',
        href: '/admin/customers',
        icon: UserPlus,
      },
      {
        title: 'عروض الأسعار',
        href: '/admin/quotations',
        icon: FileCheck,
      },
      {
        title: 'المبيعات',
        href: '/admin/sales',
        icon: DollarSign,
      },
    ],
  },
  {
    type: 'section',
    title: 'المخزون والعمليات',
    icon: Package,
    items: [
      {
        title: 'المخزون',
        href: '/admin/inventory',
        icon: Package,
      },
      {
        title: 'طلبات الشراء',
        href: '/admin/inventory/purchase-orders',
        icon: ShoppingCart,
      },
      {
        title: 'المركبات',
        href: '/admin/vehicles',
        icon: Car,
      },
      {
        title: 'موديلات السيارات',
        href: '/admin/models',
        icon: Car,
      },
      {
        title: 'الصيانة',
        href: '/admin/maintenance',
        icon: Wrench,
      },
      {
        title: 'الخدمات',
        href: '/admin/service',
        icon: Wrench,
      },
      {
        title: 'قطع الغيار',
        href: '/admin/parts',
        icon: Settings,
      },
      {
        title: 'الموردون',
        href: '/admin/suppliers',
        icon: Truck,
      },
      {
        title: 'المستودع',
        href: '/admin/warehouse',
        icon: Building,
      },
    ],
  },
  {
    type: 'section',
    title: 'الموارد البشرية',
    icon: UserCheck,
    items: [
      {
        title: 'الموظفون',
        href: '/admin/employees',
        icon: UserCheck,
      },
      {
        title: 'الحضور والانصراف',
        href: '/admin/attendance',
        icon: Calendar,
      },
      {
        title: 'الرواتب',
        href: '/admin/payroll',
        icon: Calculator,
      },
      {
        title: 'الإجازات',
        href: '/admin/leaves',
        icon: Calendar,
      },
      {
        title: 'تقييم الأداء',
        href: '/admin/performance',
        icon: FileText,
      },
    ],
  },
  {
    type: 'section',
    title: 'المالية والمحاسبة',
    icon: Calculator,
    items: [
      {
        title: 'الفواتير',
        href: '/admin/invoices/list',
        icon: CreditCard,
      },
      {
        title: 'المحاسبة',
        href: '/admin/accounting',
        icon: Calculator,
      },
      {
        title: 'المصروفات',
        href: '/admin/expenses',
        icon: CreditCard,
      },
      {
        title: 'الإيرادات',
        href: '/admin/revenue',
        icon: TrendingUp,
      },
      {
        title: 'الميزانية',
        href: '/admin/budget',
        icon: Target,
      },
      {
        title: 'الضرائب',
        href: '/admin/tax',
        icon: FileText,
      },
      {
        title: 'الحسابات البنكية',
        href: '/admin/banking',
        icon: Building,
      },
    ],
  },
  {
    type: 'section',
    title: 'العقود والتأمين',
    icon: Shield,
    items: [
      {
        title: 'العقود',
        href: '/admin/contracts',
        icon: FileText,
      },
      {
        title: 'الشؤون القانونية',
        href: '/admin/legal',
        icon: Shield,
      },
      {
        title: 'التأمين',
        href: '/admin/insurance',
        icon: Shield,
      },
      {
        title: 'الوثائق',
        href: '/admin/documents',
        icon: FileText,
      },
    ],
  },
  {
    type: 'section',
    title: 'التقارير والتحليلات',
    icon: BarChart3,
    items: [
      {
        title: 'نظرة عامة',
        href: '/admin/reports?tab=overview',
        icon: BarChart3,
      },
      {
        title: 'تقارير العملاء',
        href: '/admin/reports?tab=customers',
        icon: Users,
      },
      {
        title: 'تقارير مالية',
        href: '/admin/reports?tab=financial',
        icon: TrendingUp,
      },
    ],
  },
  {
    type: 'section',
    title: 'التواصل والدعم',
    icon: MessageSquare,
    items: [
      {
        title: 'الإشعارات',
        href: '/admin/notifications',
        icon: Bell,
      },
      {
        title: 'الرسائل',
        href: '/admin/messages',
        icon: MessageSquare,
      },
      {
        title: 'الدعم الفني',
        href: '/admin/support',
        icon: HelpCircle,
      },
      {
        title: 'ملاحظات',
        href: '/admin/feedback',
        icon: MessageSquare,
      },
      {
        title: 'اتصل بنا',
        href: '/admin/contact',
        icon: Phone,
      },
    ],
  },
  {
    type: 'section',
    title: 'إدارة الموقع',
    icon: Layout,
    items: [
      {
        title: 'الصفحة الرئيسية',
        href: '/admin/homepage',
        icon: Layout,
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
        title: 'بيانات الاتصال',
        href: '/admin/contact-info',
        icon: Phone,
      },
      {
        title: 'جدول الزمن (Timeline)',
        href: '/admin/timeline',
        icon: Calendar,
      },
      {
        title: 'الهيدر',
        href: '/admin/header',
        icon: Layout,
      },
      {
        title: 'الفوتر',
        href: '/admin/footer',
        icon: Type,
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
        title: 'إدارة المحتوى',
        href: '/admin/content-management',
        icon: Layout,
      },
      {
        title: 'النوافذ المنبثقة',
        href: '/admin/popup-configs',
        icon: MessageSquare,
      },
      {
        title: 'SEO',
        href: '/admin/page-seo',
        icon: Type,
      },
    ],
  },
  {
    type: 'section',
    title: 'النظام والإعدادات',
    icon: Settings,
    items: [
      {
        title: 'الصلاحيات',
        href: '/admin/permissions',
        icon: Shield,
      },
      {
        title: 'المستخدمون',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'الأدوار',
        href: '/admin/roles',
        icon: UserCheck,
      },
      {
        title: 'الإعدادات',
        href: '/admin/settings',
        icon: Settings,
      },
      {
        title: 'النسخ الاحتياطي',
        href: '/admin/backup',
        icon: Database,
      },
      {
        title: 'السجلات',
        href: '/admin/logs',
        icon: FileText,
      },
    ],
  },
]

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['المخزون والعمليات'])
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleSignOut = async () => {
    await logout()
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => pathname === href
  const isParentActive = (links: SidebarLink[]) =>
    links.some(link => isActive(link.href))

  const renderMenuItem = (item: SidebarEntry) => {
    if (item.type === 'section') {
      const isExpanded = expandedItems.includes(item.title)
      const active = isParentActive(item.items)
      const IconComponent = item.icon || Package

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
              <IconComponent className={cn(
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
              {item.items.map((child) => {
                const ChildIconComponent = child.icon || Package
                return (
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
                    <ChildIconComponent className={cn(
                      'h-4 w-4',
                      isActive(child.href) ? 'text-blue-700' : 'text-gray-400'
                    )} />
                    <span>{child.title}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    const IconComponent = item.icon || Package
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive(item.href)
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
      >
        <IconComponent className={cn(
          'h-5 w-5',
          isActive(item.href) ? 'text-blue-700' : 'text-gray-400'
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
            {sidebarConfig.map((item) => renderMenuItem(item))}
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
          {sidebarConfig.map((item) => renderMenuItem(item))}
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