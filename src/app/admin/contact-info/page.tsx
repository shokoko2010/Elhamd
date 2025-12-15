'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

interface ContactInfo {
    id: string
    primaryPhone: string
    secondaryPhone: string
    primaryEmail: string
    secondaryEmail: string
    address: string
    mapLat: number
    mapLng: number
    mapUrl?: string
    workingHours: {
        day: string
        hours: string
    }[]
    departments: {
        value: string
        label: string
        description: string
    }[]
    isActive: boolean
}

export default function AdminContactInfoPage() {
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState<Partial<ContactInfo>>({})

    useEffect(() => {
        loadContactInfo()
    }, [])

    const loadContactInfo = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/contact-info', { cache: 'no-store' })
            if (!response.ok) throw new Error('Failed to fetch contact info')
            const data = await response.json()

            // Ensure workingHours is formatted correctly for form
            const formattedData = {
                ...data,
                workingHours: Array.isArray(data.workingHours) ? data.workingHours : []
            }

            setFormData(formattedData)
        } catch (error) {
            console.error('Error loading contact info:', error)
            toast.error('فشل في تحميل معلومات الاتصال')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            const response = await fetch('/api/contact-info', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            })

            if (!response.ok) throw new Error('Failed to save contact info')

            const savedData = await response.json()
            setFormData(savedData)
            toast.success('تم تحديث معلومات الاتصال بنجاح')
        } catch (error) {
            console.error('Error saving contact info:', error)
            toast.error('فشل في حفظ التغييرات')
        }
    }

    const updateWorkingHours = (index: number, field: 'day' | 'hours', value: string) => {
        const newHours = [...(formData.workingHours || [])]
        if (!newHours[index]) return
        newHours[index] = { ...newHours[index], [field]: value }
        setFormData({ ...formData, workingHours: newHours })
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">بيانات الاتصال</h1>
                    <p className="text-gray-500 mt-2">تحديث أرقام الهواتف، البريد الإلكتروني، والعنوان</p>
                </div>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    <Save className="ml-2 h-4 w-4" />
                    حفظ التغييرات
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-blue-600" />
                            <CardTitle>أرقام التواصل</CardTitle>
                        </div>
                        <CardDescription>أرقام الهواتف التي تظهر للعملاء في الموقع</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="primaryPhone">رقم الهاتف الأساسي</Label>
                            <Input
                                id="primaryPhone"
                                value={formData.primaryPhone || ''}
                                onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                                placeholder="+20 100 000 0000"
                                dir="ltr"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="secondaryPhone">رقم الهاتف الثانوي (اختياري)</Label>
                            <Input
                                id="secondaryPhone"
                                value={formData.secondaryPhone || ''}
                                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                                placeholder="+20 120 000 0000"
                                dir="ltr"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <CardTitle>البريد الإلكتروني</CardTitle>
                        </div>
                        <CardDescription>عناوين البريد الإلكتروني للمراسلات الرسمية</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="primaryEmail">البريد الإلكتروني الأساسي</Label>
                            <Input
                                id="primaryEmail"
                                value={formData.primaryEmail || ''}
                                onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })}
                                placeholder="info@elhamdimport.com"
                                dir="ltr"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="secondaryEmail">بريد المبيعات (اختياري)</Label>
                            <Input
                                id="secondaryEmail"
                                value={formData.secondaryEmail || ''}
                                onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
                                placeholder="sales@elhamdimport.com"
                                dir="ltr"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            <CardTitle>العنوان والموقع</CardTitle>
                        </div>
                        <CardDescription>العنوان الفعلي للشركة وإحداثيات الخريطة</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="address">العنوان الكامل</Label>
                            <Input
                                id="address"
                                value={formData.address || ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="العنوان التفصيلي..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mapUrl">رابط خرائط جوجل (Google Maps Link)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="mapUrl"
                                    value={formData.mapUrl || ''}
                                    onChange={(e) => {
                                        const url = e.target.value
                                        let lat = formData.mapLat
                                        let lng = formData.mapLng

                                        // Try to parse coordinates from URL
                                        // Supports formats like: 
                                        // 1. https://www.google.com/maps/@30.0444,31.2357,15z
                                        // 2. https://www.google.com/maps?q=30.0444,31.2357
                                        // 3. ...!3d30.0444!4d31.2357...
                                        const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
                                        const qMatch = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)
                                        const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)

                                        if (atMatch) {
                                            lat = parseFloat(atMatch[1])
                                            lng = parseFloat(atMatch[2])
                                            toast.success('تم استخراج الإحداثيات من الرابط (Format 1)')
                                        } else if (qMatch) {
                                            lat = parseFloat(qMatch[1])
                                            lng = parseFloat(qMatch[2])
                                            toast.success('تم استخراج الإحداثيات من الرابط (Format 2)')
                                        } else if (dataMatch) {
                                            lat = parseFloat(dataMatch[1])
                                            lng = parseFloat(dataMatch[2])
                                            toast.success('تم استخراج الإحداثيات من الرابط (Format 3)')
                                        }

                                        setFormData({ ...formData, mapUrl: url, mapLat: lat, mapLng: lng })
                                    }}
                                    placeholder="https://www.google.com/maps/..."
                                    dir="ltr"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                قم بلصق رابط الخريطة وسيتم استخراج خطوط الطول والعرض تلقائيًا
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="mapLat">خط العرض (Latitude)</Label>
                                <Input
                                    id="mapLat"
                                    type="number"
                                    value={formData.mapLat || 0}
                                    onChange={(e) => setFormData({ ...formData, mapLat: parseFloat(e.target.value) })}
                                    dir="ltr"
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="mapLng">خط الطول (Longitude)</Label>
                                <Input
                                    id="mapLng"
                                    type="number"
                                    value={formData.mapLng || 0}
                                    onChange={(e) => setFormData({ ...formData, mapLng: parseFloat(e.target.value) })}
                                    dir="ltr"
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <CardTitle>مواعيد العمل</CardTitle>
                        </div>
                        <CardDescription>تحديد ساعات العمل للأيام المختلفة</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(formData.workingHours || []).map((hours, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end border-b pb-4 last:border-0 last:pb-0">
                                <div className="grid gap-2">
                                    <Label>الأيام</Label>
                                    <Input
                                        value={hours.day}
                                        onChange={(e) => updateWorkingHours(index, 'day', e.target.value)}
                                        placeholder="مثال: من الأحد إلى الخميس"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>الساعات</Label>
                                    <Input
                                        value={hours.hours}
                                        onChange={(e) => updateWorkingHours(index, 'hours', e.target.value)}
                                        placeholder="مثال: 9:00 ص - 5:00 م"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        ))}
                        {(formData.workingHours || []).length === 0 && (
                            <div className="text-center text-muted-foreground py-4">
                                لا توجد مواعيد عمل محددة
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
