'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X,
  Users,
  Ticket,
  AlertTriangle,
  MapPin
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
}

interface Branch {
  id: string
  name: string
  code: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function CreateTicketPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  const [formData, setFormData] = useState({
    customerId: '',
    subject: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    source: 'WEB',
    assignedTo: '',
    branchId: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    
    if (status === 'authenticated') {
      fetchInitialData()
    }
  }, [status, router])

  const fetchInitialData = async () => {
    try {
      // Fetch customers
      const customersRes = await fetch('/api/crm/customers')
      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      }

      // Fetch branches
      const branchesRes = await fetch('/api/branches')
      if (branchesRes.ok) {
        const branchesData = await branchesRes.json()
        setBranches(branchesData)
      }

      // Fetch users (for assignment)
      const usersRes = await fetch('/api/admin/users')
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.filter((user: User) => user.role !== 'CUSTOMER'))
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    setSelectedCustomer(customer || null)
    setFormData(prev => ({ ...prev, customerId }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/customer-service/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          tags: tags.length > 0 ? tags : undefined
        })
      })

      if (response.ok) {
        const ticket = await response.json()
        router.push(`/admin/customer-service/tickets/${ticket.id}`)
      } else {
        const error = await response.json()
        console.error('Error creating ticket:', error)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          رجوع
        </Button>
        <div>
          <h1 className="text-3xl font-bold">إنشاء تذكرة دعم جديدة</h1>
          <p className="text-muted-foreground">إنشاء تذكرة دعم فني جديدة</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  معلومات التذكرة
                </CardTitle>
                <CardDescription>
                  أدخل المعلومات الأساسية للتذكرة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">الموضوع *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="أدخل موضوع التذكرة"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">الوصف *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="صف المشكلة بالتفصيل"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>التصنيف</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">عام</SelectItem>
                        <SelectItem value="TECHNICAL">فني</SelectItem>
                        <SelectItem value="BILLING">فوترة</SelectItem>
                        <SelectItem value="SERVICE">خدمة</SelectItem>
                        <SelectItem value="SALES">مبيعات</SelectItem>
                        <SelectItem value="PARTS">قطع غيار</SelectItem>
                        <SelectItem value="WARRANTY">ضمان</SelectItem>
                        <SelectItem value="COMPLAINT">شكوى</SelectItem>
                        <SelectItem value="SUGGESTION">اقتراح</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>الأولوية</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">منخفضة</SelectItem>
                        <SelectItem value="MEDIUM">متوسطة</SelectItem>
                        <SelectItem value="HIGH">عالية</SelectItem>
                        <SelectItem value="URGENT">عاجلة</SelectItem>
                        <SelectItem value="CRITICAL">حرجة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>المصدر</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEB">الموقع الإلكتروني</SelectItem>
                      <SelectItem value="EMAIL">البريد الإلكتروني</SelectItem>
                      <SelectItem value="PHONE">الهاتف</SelectItem>
                      <SelectItem value="SOCIAL_MEDIA">وسائل التواصل الاجتماعي</SelectItem>
                      <SelectItem value="IN_PERSON">شخصياً</SelectItem>
                      <SelectItem value="MOBILE_APP">تطبيق الجوال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>الوسوم</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="أضف وسماً"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  العميل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>اختر العميل *</Label>
                  <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={customer.avatar} />
                              <AvatarFallback>
                                {customer.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {customer.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCustomer && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedCustomer.avatar} />
                        <AvatarFallback>
                          {selectedCustomer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedCustomer.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                      </div>
                    </div>
                    {selectedCustomer.phone && (
                      <p className="text-sm text-muted-foreground">
                        📞 {selectedCustomer.phone}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>التعيين</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>المسند إليه</Label>
                  <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    الفرع
                  </Label>
                  <Select value={formData.branchId} onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفرع" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} ({branch.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !formData.customerId || !formData.subject || !formData.description}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Save className="ml-2 h-4 w-4" />
                      إنشاء التذكرة
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}