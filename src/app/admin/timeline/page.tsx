'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Calendar, MoveUp, MoveDown, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface TimelineEvent {
    id: string
    year: string
    title: string
    description: string
    icon?: string
    order: number
    isActive: boolean
}

export default function AdminTimelinePage() {
    const [events, setEvents] = useState<TimelineEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
    const [formData, setFormData] = useState<Partial<TimelineEvent>>({})

    useEffect(() => {
        loadEvents()
    }, [])

    const loadEvents = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/about/timeline', { cache: 'no-store' })
            if (!response.ok) throw new Error('Failed to fetch events')
            const data = await response.json()
            setEvents(data.sort((a: any, b: any) => a.order - b.order))
        } catch (error) {
            console.error('Error loading timeline events:', error)
            toast.error('فشل في تحميل أحداث الجدول الزمني')
        } finally {
            setLoading(false)
        }
    }

    const handleAddEvent = () => {
        setEditingEvent(null)
        setFormData({
            year: new Date().getFullYear().toString(),
            title: '',
            description: '',
            isActive: true,
            order: events.length
        })
        setShowDialog(true)
    }

    const handleEditEvent = (event: TimelineEvent) => {
        setEditingEvent(event)
        setFormData({ ...event })
        setShowDialog(true)
    }

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الحدث؟')) return

        const newEvents = events.filter(e => e.id !== id)
        setEvents(newEvents)
        await saveEvents(newEvents)
    }

    const handleMoveEvent = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === events.length - 1) return

        const newEvents = [...events]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        // Swap
        const temp = newEvents[index]
        newEvents[index] = newEvents[targetIndex]
        newEvents[targetIndex] = temp

        // Update orders
        const orderedEvents = newEvents.map((e, i) => ({ ...e, order: i }))

        setEvents(orderedEvents)
        await saveEvents(orderedEvents)
    }

    const handleSave = async () => {
        if (!formData.year || !formData.title || !formData.description) {
            toast.error('يرجى ملء جميع الحقول المطلوبة')
            return
        }

        let newEvents = [...events]

        if (editingEvent) {
            newEvents = newEvents.map(e =>
                e.id === editingEvent.id
                    ? { ...e, ...formData } as TimelineEvent
                    : e
            )
        } else {
            newEvents.push({
                id: `temp-${Date.now()}`,
                ...formData,
                order: events.length
            } as TimelineEvent)
        }

        setEvents(newEvents)
        setShowDialog(false)
        await saveEvents(newEvents)
    }

    const saveEvents = async (eventsToSave: TimelineEvent[]) => {
        try {
            const response = await fetch('/api/about/timeline', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(eventsToSave)
            })

            if (!response.ok) throw new Error('Failed to save events')

            const savedEvents = await response.json()
            setEvents(savedEvents)
            toast.success('تم حفظ التغييرات بنجاح')
        } catch (error) {
            console.error('Error saving events:', error)
            toast.error('فشل في حفظ التغييرات')
            // Reload on error to restore state
            loadEvents()
        }
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">سجل النجاح (Timeline)</h1>
                    <p className="text-gray-500 mt-2">إدارة محطات تاريخ الشركة وأبرز الإنجازات</p>
                </div>
                <Button onClick={handleAddEvent} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة حدث جديد
                </Button>
            </div>

            <div className="grid gap-6">
                {events.map((event, index) => (
                    <Card key={event.id} className="group hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-start gap-6">
                            <div className="flex-shrink-0 w-24 text-center">
                                <Badge variant="outline" className="text-xl font-bold px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
                                    {event.year}
                                </Badge>
                            </div>

                            <div className="flex-grow space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{event.description}</p>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex flex-col gap-1 ml-2 border-l pl-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleMoveEvent(index, 'up')}
                                        disabled={index === 0}
                                        className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                    >
                                        <MoveUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleMoveEvent(index, 'down')}
                                        disabled={index === events.length - 1}
                                        className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                    >
                                        <MoveDown className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                                    <Edit className="h-4 w-4 ml-2" />
                                    تعديل
                                </Button>

                                <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                                    <Trash2 className="h-4 w-4 ml-2" />
                                    حذف
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {events.length === 0 && !loading && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">لا توجد أحداث مسجلة</h3>
                        <p className="text-gray-500 mt-1">ابدأ بإضافة أول حدث في تاريخ الشركة</p>
                    </div>
                )}
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? 'تعديل الحدث' : 'إضافة حدث جديد'}</DialogTitle>
                        <DialogDescription>
                            أدخل تفاصيل الحدث التاريخي ليظهر في الجدول الزمني
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="year">السنة</Label>
                            <Input
                                id="year"
                                value={formData.year || ''}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                placeholder="مثال: 2024"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="title">عنوان الحدث</Label>
                            <Input
                                id="title"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="مثال: التوسع في السوق السعودي"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">الوصف التفصيلي</Label>
                            <Textarea
                                id="description"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                placeholder="صف تفاصيل هذا الحدث وأهميته..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="ml-2 h-4 w-4" />
                            حفظ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
