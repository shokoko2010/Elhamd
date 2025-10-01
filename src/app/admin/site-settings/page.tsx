'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Settings, 
  BarChart3,
  Users,
  Car,
  Calendar,
  Target,
  Layout,
  Palette,
  Search,
  Share2,
  Database,
  LogOut
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import SiteSettingsManager from '@/components/admin/site-settings/SiteSettingsManager'

export default function AdminSiteSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading, authenticated, isAdmin } = useAuth()
  
  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/login')
      return
    }

    if (!loading && authenticated && !isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      })
      router.push('/dashboard')
      return
    }
  }, [loading, authenticated, isAdmin, router, toast])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!authenticated || !isAdmin()) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}` : undefined} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Site Settings</h1>
            <p className="text-gray-600">Manage website configuration and appearance</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Admin Settings
        </Button>
      </div>

      {/* Main Content */}
      <SiteSettingsManager />

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" onClick={() => router.push('/admin')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/vehicles')}>
            <Car className="w-4 h-4 mr-2" />
            Vehicle Management
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/customers')}>
            <Users className="w-4 h-4 mr-2" />
            Customer Management
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/bookings')}>
            <Calendar className="w-4 h-4 mr-2" />
            Booking Management
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/content')}>
            <Layout className="w-4 h-4 mr-2" />
            Content Management
          </Button>
        </CardContent>
      </Card>

      {/* Header & Footer Settings */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Header & Footer Settings</CardTitle>
          <CardDescription>Quick access to header and footer management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/header')}>
            <Layout className="w-4 h-4 mr-2" />
            Header Management
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/footer')}>
            <Layout className="w-4 h-4 mr-2" />
            Footer Management
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}