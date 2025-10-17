'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Wrench, 
  Car, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter
} from 'lucide-react'

interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string
  subject?: string
  message: string
  department?: string
  status: string
  submittedAt: string
}

interface ServiceBookingSubmission {
  id: string
  name: string
  email: string
  phone: string
  vehicleType: string
  serviceType: string
  preferredDate: string
  preferredTime: string
  message?: string
  status: string
  submittedAt: string
}

interface TestDriveSubmission {
  id: string
  name: string
  email: string
  phone: string
  vehicleId: string
  vehicleModel: string
  preferredDate: string
  preferredTime: string
  message?: string
  status: string
  submittedAt: string
}

interface ConsultationSubmission {
  id: string
  name: string
  email: string
  phone: string
  consultationType: string
  preferredDate: string
  preferredTime: string
  message?: string
  status: string
  submittedAt: string
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<{
    contact: ContactSubmission[]
    service: ServiceBookingSubmission[]
    testdrive: TestDriveSubmission[]
    consultation: ConsultationSubmission[]
  }>({
    contact: [],
    service: [],
    testdrive: [],
    consultation: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchSubmissions()
  }, [statusFilter])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const url = `/api/admin/submissions${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      } else {
        setError('فشل في تحميل البيانات')
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setError('فشل في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const updateSubmissionStatus = async (type: string, id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, id, status }),
      })

      if (response.ok) {
        fetchSubmissions()
      } else {
        setError('فشل في تحديث الحالة')
      }
    } catch (error) {
      console.error('Error updating submission:', error)
      setError('فشل في تحديث الحالة')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">قيد الانتظار</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">موافق عليه</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">مرفوض</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة النماذج المقدمة</h1>
        <p className="text-gray-600">عرض وإدارة جميع النماذج المقدمة من العملاء</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">جميع الحالات</option>
            <option value="PENDING">قيد الانتظار</option>
            <option value="APPROVED">موافق عليه</option>
            <option value="REJECTED">مرفوض</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="contact" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            اتصل بنا ({submissions.contact.length})
          </TabsTrigger>
          <TabsTrigger value="service" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            حجز خدمة ({submissions.service.length})
          </TabsTrigger>
          <TabsTrigger value="testdrive" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            تجربة قيادة ({submissions.testdrive.length})
          </TabsTrigger>
          <TabsTrigger value="consultation" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            استشارة ({submissions.consultation.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid gap-4">
            {submissions.contact.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{submission.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {submission.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {submission.phone}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(submission.status)}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSubmissionStatus('contact', submission.id, 'APPROVED')}
                          disabled={submission.status === 'APPROVED'}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSubmissionStatus('contact', submission.id, 'REJECTED')}
                          disabled={submission.status === 'REJECTED'}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {submission.subject && (
                      <div>
                        <strong>الموضوع:</strong> {submission.subject}
                      </div>
                    )}
                    {submission.department && (
                      <div>
                        <strong>القسم:</strong> {submission.department}
                      </div>
                    )}
                    <div>
                      <strong>الرسالة:</strong>
                      <p className="mt-1 text-gray-600">{submission.message}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatDate(submission.submittedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="service" className="space-y-4">
          <div className="grid gap-4">
            {submissions.service.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{submission.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {submission.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {submission.phone}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(submission.status)}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSubmissionStatus('service', submission.id, 'APPROVED')}
                          disabled={submission.status === 'APPROVED'}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSubmissionStatus('service', submission.id, 'REJECTED')}
                          disabled={submission.status === 'REJECTED'}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <strong>نوع المركبة:</strong> {submission.vehicleType}
                    </div>
                    <div>
                      <strong>نوع الخدمة:</strong> {submission.serviceType}
                    </div>
                    <div>
                      <strong>التاريخ المفضل:</strong> {submission.preferredDate} - {submission.preferredTime}
                    </div>
                    {submission.message && (
                      <div>
                        <strong>ملاحظات:</strong>
                        <p className="mt-1 text-gray-600">{submission.message}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatDate(submission.submittedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testdrive" className="space-y-4">
          <div className="grid gap-4">
            {submissions.testdrive.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{submission.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {submission.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {submission.phone}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(submission.status)}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSubmissionStatus('testdrive', submission.id, 'APPROVED')}
                          disabled={submission.status === 'APPROVED'}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSubmissionStatus('testdrive', submission.id, 'REJECTED')}
                          disabled={submission.status === 'REJECTED'}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <strong>الموديل المطلوب:</strong> {submission.vehicleModel}
                    </div>
                    <div>
                      <strong>التاريخ المفضل:</strong> {submission.preferredDate} - {submission.preferredTime}
                    </div>
                    {submission.message && (
                      <div>
                        <strong>ملاحظات:</strong>
                        <p className="mt-1 text-gray-600">{submission.message}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatDate(submission.submittedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="consultation" className="space-y-4">
          <div className="grid gap-4">
            {submissions.consultation.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{submission.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {submission.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {submission.phone}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(submission.status)}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSubmissionStatus('consultation', submission.id, 'APPROVED')}
                          disabled={submission.status === 'APPROVED'}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSubmissionStatus('consultation', submission.id, 'REJECTED')}
                          disabled={submission.status === 'REJECTED'}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <strong>نوع الاستشارة:</strong> {submission.consultationType}
                    </div>
                    <div>
                      <strong>التاريخ المفضل:</strong> {submission.preferredDate} - {submission.preferredTime}
                    </div>
                    {submission.message && (
                      <div>
                        <strong>ملاحظات:</strong>
                        <p className="mt-1 text-gray-600">{submission.message}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatDate(submission.submittedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}