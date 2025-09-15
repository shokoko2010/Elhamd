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
  LogOut,
  Menu,
  ImageIcon,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const sidebarItems = [
  {
    title: 'لوحة التحكم',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'الصفحة الرئيسية',
    href: '/admin/homepage',
    icon: LayoutDashboard,
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
    title: 'موديلات السيارات',
    href: '/admin/models',
    icon: Car,
  },
  {
    title: 'المركبات',
    href: '/admin/vehicles',
    icon: Car,
  },
  {
    title: 'المواعيد',
    href: '/admin/appointments',
    icon: Calendar,
  },
  {
    title: 'حجوزات الخدمة',
    href: '/admin/bookings',
    icon: Wrench,
  },
  {
    title: 'العملاء',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'الإعدادات',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className={cn(
      'bg-white border-r border-gray-200 transition-all duration-300',
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
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5',
                  isActive ? 'text-blue-700' : 'text-gray-400'
                )} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
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
}