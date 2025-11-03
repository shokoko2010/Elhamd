'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  type LucideIcon,
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
  Bell,
  Package,
  CreditCard,
  Calculator,
  Home,
  Building,
  MessageSquare,
  UserCheck,
  Search,
  Download,
  Upload,
  Printer,
  Phone,
  HelpCircle,
  Database,
  Lock,
  Target,
  Percent,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'

type SidebarItem = {
  title: string
  icon: LucideIcon
  href?: string
  children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'لوحة التحكم',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'المبيعات والعملاء',
    icon: Users,
    children: [
      {
        title: 'المركبات',
        href: '/admin/vehicles',
        icon: Car,
      },
      {
        title: 'الحجوزات',
        href: '/admin/bookings',
        icon: Calendar,
      },
      {
        title: 'العملاء',
        href: '/admin/customers',
        icon: Users,
      },
      {
        title: 'عروض الأسعار',
        href: '/admin/quotations',
        icon: FileText,
      },
      {
        title: 'الفواتير',
        href: '/admin/invoices',
        icon: CreditCard,
      },
    ],
  },
  {
    title: 'العمليات',
    icon: Package,
    children: [
      {
        title: 'المخزون',
        href: '/admin/inventory',
        icon: Package,
      },
      {
        title: 'الصيانة',
        href: '/admin/maintenance',
        icon: Wrench,
      },
      {
        title: 'الموردون',
        href: '/admin/suppliers',
        icon: Building,
      },
      {
        title: 'المستودع',
        href: '/admin/warehouse',
        icon: Building,
      },
    ],
  },
  {
    title: 'الموارد البشرية',
    icon: UserCheck,
    children: [
      {
        title: 'نظرة عامة',
        href: '/admin/hr',
        icon: UserCheck,
      },
      {
        title: 'الموظفون',
        href: '/admin/employees',
        icon: Users,
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
        icon: Target,
      },
    ],
  },
  {
    title: 'المالية والمحاسبة',
    icon: DollarSign,
    children: [
      {
        title: 'الإدارة المالية',
        href: '/admin/finance',
        icon: DollarSign,
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
        icon: Percent,
      },
    ],
  },
  {
    title: 'إدارة الموقع',
    icon: Home,
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
        title: 'المحتوى',
        href: '/admin/content',
        icon: FileText,
      },
      {
        title: 'الوسائط',
        href: '/admin/media',
        icon: ImageIcon,
      },
      {
        title: 'النوافذ المنبثقة',
        href: '/admin/popup-configs',
        icon: MessageSquare,
      },
      {
        title: 'تحسين محركات البحث',
        href: '/admin/page-seo',
        icon: Search,
      },
    ],
  },
  {
    title: 'التواصل والدعم',
    icon: MessageSquare,
    children: [
      {
        title: 'الإشعارات',
        href: '/admin/notifications',
        icon: Bell,
      },
      {
        title: 'المحادثات',
        href: '/admin/messages',
        icon: MessageSquare,
      },
      {
        title: 'الدعم الفني',
        href: '/admin/support',
        icon: HelpCircle,
      },
      {
        title: 'اتصل بنا',
        href: '/admin/contact',
        icon: Phone,
      },
      {
        title: 'ملاحظات العملاء',
        href: '/admin/feedback',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: 'النظام والإعدادات',
    icon: Settings,
    children: [
      {
        title: 'الصلاحيات',
        href: '/admin/permissions',
        icon: Lock,
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
        title: 'النسخ الاحتياطي',
        href: '/admin/backup',
        icon: Database,
      },
      {
        title: 'سجلات النظام',
        href: '/admin/logs',
        icon: FileText,
      },
      {
        title: 'إعدادات عامة',
        href: '/admin/settings',
        icon: Settings,
      },
    ],
  },
  {
    title: 'الأدوات والتقارير',
    icon: Search,
    children: [
      {
        title: 'التقارير',
        href: '/admin/reports',
        icon: BarChart3,
      },
      {
        title: 'تصدير البيانات',
        href: '/admin/export',
        icon: Download,
      },
      {
        title: 'استيراد البيانات',
        href: '/admin/import',
        icon: Upload,
      },
      {
        title: 'الطباعة',
        href: '/admin/print',
        icon: Printer,
      },
    ],
  },
]

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([
    'المبيعات والعملاء',
    'المالية والمحاسبة',
  ])
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

  const isActive = (href?: string) => (href ? pathname === href : false)

  const isParentActive = (children?: SidebarItem[]) => {
    if (!children?.length) return false
    return children.some(child => child.href && isActive(child.href))
  }

  const renderMenuItem = (item: SidebarItem) => {
    const hasChildren = Boolean(item.children && item.children.length > 0)
    const isExpanded = expandedItems.includes(item.title)
    const active = hasChildren ? isParentActive(item.children) : isActive(item.href)
    const IconComponent = item.icon ?? Package

    if (hasChildren && item.children) {
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
              <IconComponent
                className={cn(
                  'h-5 w-5',
                  active ? 'text-blue-700' : 'text-gray-400'
                )}
              />
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

          {!isCollapsed && isExpanded && (
            <div className="mr-4 space-y-1">
              {item.children.map(child => {
                const ChildIconComponent = child.icon ?? Package

                if (!child.href) return null

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
                    <ChildIconComponent
                      className={cn(
                        'h-4 w-4',
                        isActive(child.href) ? 'text-blue-700' : 'text-gray-400'
                      )}
                    />
                    <span>{child.title}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    if (!item.href) {
      return null
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
        <IconComponent
          className={cn('h-5 w-5', active ? 'text-blue-700' : 'text-gray-400')}
        />
        {!isCollapsed && <span>{item.title}</span>}
      </Link>
    )
  }

  const MobileSidebar = () => (
    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full bg-white">
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

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarItems.map(item => renderMenuItem(item))}
          </nav>

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

  const DesktopSidebar = () => (
    <div
      className={cn(
        'hidden md:flex bg-white border-r border-gray-200 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
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
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map(item => renderMenuItem(item))}
        </nav>

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
            className={cn('w-full justify-start', isCollapsed && 'px-2')}
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
