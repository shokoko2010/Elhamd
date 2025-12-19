'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Send, Inbox, Star, RefreshCcw, Eye, Trash2, CheckCircle, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  type: string
  status: 'NEW' | 'READ' | 'ARCHIVED' | 'REPLIED'
  metadata: any
  createdAt: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status: statusFilter
      })
      const response = await fetch(`/api/admin/messages?${params}`)
      const data = await response.json()
      if (response.ok) {
        setMessages(data.messages)
        setTotalPages(data.totalPages)
      } else {
        console.error(data.error)
      }
    } catch (error) {
      console.error('Failed to fetch messages', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchMessages()
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, statusFilter, page])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return

    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast({
          title: "تم الحذف",
          description: "تم حذف الرسالة بنجاح",
        })
        fetchMessages()
        if (selectedMessage?.id === id) setSelectedMessage(null)
      } else {
        toast({
          title: "خطأ",
          description: "فشل حذف الرسالة",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting message', error)
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        fetchMessages()
        if (selectedMessage?.id === id) {
          setSelectedMessage(prev => prev ? { ...prev, status: newStatus as any } : null)
        }
        toast({
          title: "تم التحديث",
          description: "تم تحديث حالة الرسالة",
        })
      }
    } catch (error) {
      console.error('Error updating status', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <Badge variant="destructive">جديدة</Badge>
      case 'READ': return <Badge variant="secondary">مقروءة</Badge>
      case 'ARCHIVED': return <Badge variant="outline">مؤرشفة</Badge>
      case 'REPLIED': return <Badge className="bg-green-500">تم الرد</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الرسائل</h1>
        <Button onClick={fetchMessages} variant="outline" size="icon">
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الرسائل..."
            className="pr-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground ml-2" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="تصفية بالحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الرسائل</SelectItem>
              <SelectItem value="NEW">جديدة</SelectItem>
              <SelectItem value="READ">مقروءة</SelectItem>
              <SelectItem value="ARCHIVED">مؤرشفة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الوارد</CardTitle>
          <CardDescription>
            عرض وإدارة رسائل العملاء والاستفسارات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المرسل</TableHead>
                  <TableHead className="text-right">الموضوع</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا توجد رسائل
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((msg) => (
                    <TableRow key={msg.id} className="cursor-pointer hover:bg-slate-50" onClick={() => {
                      setSelectedMessage(msg)
                      if (msg.status === 'NEW') handleStatusUpdate(msg.id, 'READ')
                    }}>
                      <TableCell className="font-medium">
                        <div>{msg.name}</div>
                        <div className="text-xs text-muted-foreground">{msg.email}</div>
                      </TableCell>
                      <TableCell>{msg.subject || 'بدون عنوان'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{msg.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(msg.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground" dir="ltr">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={(e) => {
                            e.stopPropagation()
                            setSelectedMessage(msg)
                          }}>
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => handleDelete(msg.id, e)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                السابق
              </Button>
              <span className="text-sm">
                صفحة {page} من {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                التالي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الرسالة</DialogTitle>
            <DialogDescription>
              {selectedMessage?.createdAt && new Date(selectedMessage.createdAt).toLocaleString('ar-EG')}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <div className="font-semibold text-sm text-muted-foreground mb-1">الاسم</div>
                  <div>{selectedMessage.name}</div>
                </div>
                <div>
                  <div className="font-semibold text-sm text-muted-foreground mb-1">البريد الإلكتروني</div>
                  <div className="font-mono text-sm">{selectedMessage.email}</div>
                </div>
                <div>
                  <div className="font-semibold text-sm text-muted-foreground mb-1">الهاتف</div>
                  <div dir="ltr" className="text-right">{selectedMessage.phone || '-'}</div>
                </div>
                <div>
                  <div className="font-semibold text-sm text-muted-foreground mb-1">النوع</div>
                  <Badge variant="outline">{selectedMessage.type}</Badge>
                </div>
              </div>

              <div>
                <div className="font-semibold text-sm text-muted-foreground mb-2">الموضوع</div>
                <div className="font-medium">{selectedMessage.subject || 'بدون عنوان'}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="font-semibold text-sm text-muted-foreground mb-2">نص الرسالة</div>
                <div className="whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</div>
              </div>

              {selectedMessage.metadata && Object.keys(selectedMessage.metadata).length > 0 && (
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                  <div className="font-bold mb-1">بيانات إضافية:</div>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(selectedMessage.metadata, null, 2)}</pre>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                {selectedMessage.status !== 'ARCHIVED' && (
                  <Button variant="outline" onClick={() => handleStatusUpdate(selectedMessage.id, 'ARCHIVED')}>
                    <CheckCircle className="ml-2 h-4 w-4" />
                    أرشفة
                  </Button>
                )}
                <Button variant="destructive" onClick={(e) => handleDelete(selectedMessage.id, e as any)}>
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}