'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Headphones, MessageSquare, Clock, CheckCircle, Search, Filter, Mail, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  status: string
  priority: string
  createdAt: string
  customer?: { id: string, name: string | null }
}

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  status: string
  type: string
  createdAt: string
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [inquiries, setInquiries] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tickets')
  // const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch Tickets
      const ticketRes = await fetch('/api/admin/support?limit=5')
      const ticketData = await ticketRes.json()
      if (ticketRes.ok) setTickets(ticketData.tickets || [])

      // Fetch Inquiries (Messages)
      const msgRes = await fetch('/api/admin/messages?limit=5&type=INQUIRY')
      const msgData = await msgRes.json()
      if (msgRes.ok) setInquiries(msgData.messages || [])

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <Badge variant="destructive">مفتوحة</Badge>
      case 'IN_PROGRESS': return <Badge variant="secondary">قيد المعالجة</Badge>
      case 'RESOLVED': return <Badge className="bg-green-500">تم الحل</Badge>
      case 'CLOSED': return <Badge variant="outline">مغلقة</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT': return <Badge variant="destructive">عاجل</Badge>
      case 'HIGH': return <Badge className="bg-orange-500">عالية</Badge>
      case 'MEDIUM': return <Badge className="bg-blue-500">متوسطة</Badge>
      case 'LOW': return <Badge variant="secondary">منخفضة</Badge>
      default: return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">دعم العملاء</h1>
        <Button onClick={fetchData} variant="outline" size="sm">تحديث</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التذاكر</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">تذاكر نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاستفسارات</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiries.length}</div>
            <p className="text-xs text-muted-foreground">رسائل من الموقع</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="tickets">تذاكر الدعم الفني</TabsTrigger>
          <TabsTrigger value="inquiries">استفسارات المركبات</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>أحدث التذاكر</CardTitle>
              <CardDescription>إدارة مشاكل وشكاوى العملاء</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لا توجد تذاكر حالياً</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم التذكرة</TableHead>
                      <TableHead className="text-right">الموضوع</TableHead>
                      <TableHead className="text-right">العميل</TableHead>
                      <TableHead className="text-right">الأولوية</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono">{ticket.ticketNumber}</TableCell>
                        <TableCell className="font-medium">{ticket.subject}</TableCell>
                        <TableCell>{ticket.customer?.name || 'زائر'}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground" dir="ltr">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>استفسارات المركبات</CardTitle>
              <CardDescription>رسائل "تواصل معنا" من صفحات السيارات</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لا توجد استفسارات حديثة</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">الموضوع</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.map((msg) => (
                      <TableRow key={msg.id}>
                        <TableCell>{msg.name}</TableCell>
                        <TableCell className="font-medium">{msg.subject}</TableCell>
                        <TableCell><Badge variant="outline">{msg.type}</Badge></TableCell>
                        <TableCell>
                          {msg.status === 'NEW' ? <Badge variant="destructive">جديدة</Badge> : <Badge variant="secondary">{msg.status}</Badge>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground" dir="ltr">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}