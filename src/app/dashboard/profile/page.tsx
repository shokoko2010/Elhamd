'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Shield, 
  Bell, 
  Car, 
  Calendar,
  MapPin,
  CreditCard,
  Settings,
  Save,
  Camera,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

interface UserProfile {
  id: string
  name?: string
  email: string
  phone?: string
  role: string
  createdAt: string
  lastLoginAt?: string
  emailVerified: boolean
  securitySettings?: {
    twoFactorEnabled: boolean
    loginNotifications: boolean
    emailNotifications: boolean
  }
}

interface Address {
  id: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  type: string
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

interface NotificationPreference {
  type: string
  email: boolean
  sms: boolean
  push: boolean
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { user, update } = useAuth()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  
  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    emailNotifications: true
  })
  
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchProfileData()
    }
  }, [status, router])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/dashboard/profile')
      if (response.ok) {
        const profileData = await response.json()
        setProfile(profileData)
        
        // Set form data
        setPersonalInfo({
          name: profileData.name || '',
          email: profileData.email,
          phone: profileData.phone || ''
        })
        
        setSecuritySettings({
          twoFactorEnabled: profileData.securitySettings?.twoFactorEnabled || false,
          loginNotifications: profileData.securitySettings?.loginNotifications || true,
          emailNotifications: profileData.securitySettings?.emailNotifications || true
        })
        
        setNotificationPreferences(profileData.notificationPreferences || [])
        setAddresses(profileData.addresses || [])
        setPaymentMethods(profileData.paymentMethods || [])
      } else {
        throw new Error('Failed to fetch profile data')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePersonalInfo = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(personalInfo)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Personal information updated successfully'
        })
        await update() // Update session data
        fetchProfileData() // Refresh profile data
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update personal information',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSecuritySettings = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/dashboard/profile/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(securitySettings)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Security settings updated successfully'
        })
        fetchProfileData()
      } else {
        throw new Error('Failed to update security settings')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update security settings',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotificationPreferences = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/dashboard/profile/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationPreferences)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification preferences updated successfully'
        })
        fetchProfileData()
      } else {
        throw new Error('Failed to update notification preferences')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}` : undefined} />
                  <AvatarFallback className="text-2xl">
                    {profile.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle>{profile.name || 'User'}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <Badge variant="outline">{profile.role}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member since</span>
                <span className="text-sm">{formatDate(profile.createdAt)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email verified</span>
                <Badge variant={profile.emailVerified ? "default" : "secondary"}>
                  {profile.emailVerified ? "Verified" : "Not verified"}
                </Badge>
              </div>
              
              {profile.lastLoginAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last login</span>
                  <span className="text-sm">{formatDate(profile.lastLoginAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="name"
                          value={personalInfo.name}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                          className="pl-10"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="phone"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                          className="pl-10"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSavePersonalInfo} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Addresses Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Addresses</CardTitle>
                  <CardDescription>
                    Manage your saved addresses for bookings and deliveries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No addresses saved</p>
                      <Button>Add Address</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">
                              {address.street}, {address.city}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.state} {address.zipCode}, {address.country}
                            </p>
                            {address.isDefault && (
                              <Badge variant="outline" className="mt-1">Default</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">Remove</Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        Add New Address
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and authentication preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" size="sm">
                        {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Login Notifications</h3>
                        <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                      </div>
                      <Button variant="outline" size="sm">
                        {securitySettings.loginNotifications ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive important account updates via email</p>
                      </div>
                      <Button variant="outline" size="sm">
                        {securitySettings.emailNotifications ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Password</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Change Password</p>
                          <p className="text-sm text-gray-600">Last changed recently</p>
                        </div>
                        <Button variant="outline">Change Password</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveSecuritySettings} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {notificationPreferences.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No notification preferences set</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {notificationPreferences.map((pref) => (
                        <div key={pref.type} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium capitalize">
                              {pref.type.replace(/_/g, ' ')}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Choose notification channels for this type
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={pref.email}
                                onChange={(e) => {
                                  const updated = notificationPreferences.map(p =>
                                    p.type === pref.type ? { ...p, email: e.target.checked } : p
                                  )
                                  setNotificationPreferences(updated)
                                }}
                              />
                              <span className="text-sm">Email</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={pref.sms}
                                onChange={(e) => {
                                  const updated = notificationPreferences.map(p =>
                                    p.type === pref.type ? { ...p, sms: e.target.checked } : p
                                  )
                                  setNotificationPreferences(updated)
                                }}
                              />
                              <span className="text-sm">SMS</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={pref.push}
                                onChange={(e) => {
                                  const updated = notificationPreferences.map(p =>
                                    p.type === pref.type ? { ...p, push: e.target.checked } : p
                                  )
                                  setNotificationPreferences(updated)
                                }}
                              />
                              <span className="text-sm">Push</span>
                            </label>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-end">
                        <Button onClick={handleSaveNotificationPreferences} disabled={saving}>
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save Preferences'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your saved payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No payment methods saved</p>
                      <Button>Add Payment Method</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium capitalize">{method.type}</p>
                            <p className="text-sm text-gray-600">
                              •••• {method.last4} (Expires {method.expiryMonth}/{method.expiryYear})
                            </p>
                            {method.isDefault && (
                              <Badge variant="outline" className="mt-1">Default</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">Remove</Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        Add Payment Method
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Preferences</CardTitle>
                  <CardDescription>
                    Customize your account experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Communications</h3>
                      <p className="text-sm text-gray-600">Receive updates and promotional emails</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Data & Privacy</h3>
                      <p className="text-sm text-gray-600">Manage your data and privacy settings</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Delete Account</h3>
                      <p className="text-sm text-gray-600">Permanently delete your account</p>
                    </div>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}