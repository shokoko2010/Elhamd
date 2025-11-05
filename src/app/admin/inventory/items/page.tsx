'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface InventoryRow {
  id: string
  name: string
  partNumber: string
  quantity: number
  minStockLevel: number
  unitPrice: number
  warehouse?: string
  status: string
  category?: string
}

const statusLabels: Record<string, string> = {
  IN_STOCK: 'متوفر',
  LOW_STOCK: 'منخفض',
  OUT_OF_STOCK: 'غير متوفر',
  DISCONTINUED: 'متوقف',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  IN_STOCK: 'default',
  LOW_STOCK: 'secondary',
  OUT_OF_STOCK: 'destructive',
  DISCONTINUED: 'outline',
}

export default function InventoryItemsPage() {
  const [items, setItems] = useState<InventoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    const controller = new AbortController()

    const loadItems = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ limit: '200' })
        if (search) params.set('search', search)
        if (status !== 'all') params.set('status', status)
        if (category !== 'all') params.set('category', category)

        const response = await fetch(`/api/inventory/items?${params.toString()}`, {
          signal: controller.signal,
        })

        if (response.ok) {
          const data = await response.json()
          const rows: InventoryRow[] = (data.items || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            partNumber: item.partNumber,
            quantity: item.quantity,
            minStockLevel: item.minStockLevel,
            unitPrice: item.unitPrice || 0,
            warehouse: item.warehouse,
            status: item.status,
            category: item.category,
          }))
          setItems(rows)
        } else {
          setItems([])
        }
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          setItems([])
        }
      } finally {
        setLoading(false)
      }
    }

    loadItems()

    return () => controller.abort()
  }, [search, status, category])

  const categories = useMemo(() => {
    const unique = new Set<string>()
    items.forEach(item => {
      if (item.category) unique.add(item.category)
    })
    return Array.from(unique)
  }, [items])

  const content = loading ? (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  ) : (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الصنف</TableHead>
          <TableHead>رقم القطعة</TableHead>
          <TableHead>الفئة</TableHead>
          <TableHead>المستودع</TableHead>
          <TableHead>الكمية</TableHead>
          <TableHead>حد إعادة الطلب</TableHead>
          <TableHead>سعر الوحدة</TableHead>
          <TableHead>الحالة</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(item => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.partNumber}</TableCell>
            <TableCell>{item.category || '-'}</TableCell>
            <TableCell>{item.warehouse || '-'}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>{item.minStockLevel}</TableCell>
            <TableCell>{item.unitPrice.toLocaleString()} ج.م</TableCell>
            <TableCell>
              <Badge variant={statusVariants[item.status] || 'secondary'}>
                {statusLabels[item.status] || item.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
              لا توجد بيانات مطابقة للبحث الحالي
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )

  return (
    <AdminRoute>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>إدارة أصناف المخزون</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <LabelledInput label="بحث" description="ابحث بالاسم أو رقم القطعة">
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="مثال: فلتر زيت" />
                </LabelledInput>
              </div>
              <div>
                <LabelledInput label="الحالة">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="كل الحالات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الحالات</SelectItem>
                      <SelectItem value="IN_STOCK">متوفر</SelectItem>
                      <SelectItem value="LOW_STOCK">منخفض</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">غير متوفر</SelectItem>
                      <SelectItem value="DISCONTINUED">متوقف</SelectItem>
                    </SelectContent>
                  </Select>
                </LabelledInput>
              </div>
              <div>
                <LabelledInput label="الفئة">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="كل الفئات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الفئات</SelectItem>
                      {categories.map(value => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </LabelledInput>
              </div>
            </div>

            {content}
          </CardContent>
        </Card>
      </div>
    </AdminRoute>
  )
}

interface LabelledInputProps {
  label: string
  description?: string
  children: ReactNode
}

function LabelledInput({ label, description, children }: LabelledInputProps) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}
