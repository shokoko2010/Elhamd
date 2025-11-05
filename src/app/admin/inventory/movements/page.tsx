'use client'

import { useEffect, useMemo, useState } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

interface MovementRow {
  id: string
  itemName: string
  sku: string
  type: 'IN' | 'OUT'
  quantity: number
  reference: string
  reason: string
  createdAt: string
  createdBy?: string
}

const typeLabels: Record<MovementRow['type'], string> = {
  IN: 'دخول',
  OUT: 'خروج',
}

const typeVariants: Record<MovementRow['type'], 'default' | 'destructive'> = {
  IN: 'default',
  OUT: 'destructive',
}

export default function InventoryMovementsPage() {
  const [movements, setMovements] = useState<MovementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | MovementRow['type']>('all')

  useEffect(() => {
    const controller = new AbortController()

    const loadMovements = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ limit: '200' })
        const response = await fetch(`/api/inventory/movements?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          setMovements([])
          return
        }

        const data = await response.json()
        const rows: MovementRow[] = (data.movements || []).map((movement: any) => ({
          id: movement.id,
          itemName: movement.item?.name ?? 'غير معروف',
          sku: movement.item?.sku ?? 'N/A',
          type: movement.type === 'OUT' ? 'OUT' : 'IN',
          quantity: Number(movement.quantity) || 0,
          reference: movement.reference ?? '-',
          reason: movement.reason ?? '-',
          createdAt: movement.createdAt ?? new Date().toISOString(),
          createdBy: movement.createdBy?.name ?? movement.createdBy ?? undefined,
        }))

        setMovements(rows)
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          setMovements([])
        }
      } finally {
        setLoading(false)
      }
    }

    loadMovements()

    return () => controller.abort()
  }, [])

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const matchesType = typeFilter === 'all' || movement.type === typeFilter
      const normalizedSearch = search.trim().toLowerCase()

      if (!normalizedSearch) {
        return matchesType
      }

      return (
        matchesType &&
        [movement.itemName, movement.sku, movement.reference, movement.reason, movement.createdBy]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch))
      )
    })
  }, [movements, search, typeFilter])

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
          <TableHead>النوع</TableHead>
          <TableHead>الكمية</TableHead>
          <TableHead>السبب</TableHead>
          <TableHead>المرجع</TableHead>
          <TableHead>تاريخ الحركة</TableHead>
          <TableHead>بواسطة</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredMovements.map((movement) => (
          <TableRow key={movement.id}>
            <TableCell className="font-medium">{movement.itemName}</TableCell>
            <TableCell>{movement.sku}</TableCell>
            <TableCell>
              <Badge variant={typeVariants[movement.type]}>
                {typeLabels[movement.type]}
              </Badge>
            </TableCell>
            <TableCell>{movement.quantity}</TableCell>
            <TableCell>{movement.reason}</TableCell>
            <TableCell>{movement.reference}</TableCell>
            <TableCell>{formatDateTime(movement.createdAt)}</TableCell>
            <TableCell>{movement.createdBy ?? '-'}</TableCell>
          </TableRow>
        ))}
        {filteredMovements.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
              لا توجد حركات مطابقة للبحث الحالي
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
            <CardTitle>حركات المخزون</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">بحث</p>
                <p className="text-xs text-muted-foreground">ابحث بالاسم أو رقم القطعة أو المرجع</p>
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="مثال: حركة مخزون"
                  className="mt-2"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">نوع الحركة</p>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="كل الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    <SelectItem value="IN">دخول</SelectItem>
                    <SelectItem value="OUT">خروج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {content}
          </CardContent>
        </Card>
      </div>
    </AdminRoute>
  )
}

const formatDateTime = (value: string) => {
  try {
    return new Date(value).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}
