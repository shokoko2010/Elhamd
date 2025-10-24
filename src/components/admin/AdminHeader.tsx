'use client'

import { Search, User, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import NotificationSystem from './NotificationSystem'

export function AdminHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleSignOut = async () => {
    await logout()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - empty for mobile (sidebar handles menu) */}
          <div className="flex items-center">
            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mr-2"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Center - Search bar for desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="ابحث عن سيارات، عملاء، حجوزات..."
                className="pl-10 pr-4"
              />
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            <NotificationSystem />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 sm:h-auto sm:w-auto">
                  <div className="flex items-center space-x-0 sm:space-x-2">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium truncate max-w-[120px]">{user?.name || 'مستخدم المشرف'}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/')}>
                  عرض العميل
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="ابحث عن سيارات، عملاء، حجوزات..."
                className="pl-10 pr-4"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}