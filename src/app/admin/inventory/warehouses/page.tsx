'use client'

import { useEffect, useState } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface WarehouseRow {
  id: string
  name: string
  location: string
  capacity: number
  manager?: string
  status: string
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    const loadWarehouses = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/inventory/warehouses', {
          signal: controller.signal,
        })
        if (response.ok) {
          const data = await response.json()
          const rows: WarehouseRow[] = (data.warehouses || []).map((warehouse: any) => ({
            id: warehouse.id,
            name: warehouse.name,
            location: warehouse.location,
            capacity: warehouse.capacity,
            manager: warehouse.manager,
            status: warehouse.status,
          }))
          setWarehouses(rows)
        } else {
          setWarehouses([])
        }
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          setWarehouses([])
        }
      } finally {
        setLoading(false)
      }
    }

    loadWarehouses()
    return () => controller.abort()
  }, [])

  return (
    <AdminRoute>
      <Card>
        <CardHeader>
          <CardTitle>المستودعات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستودع</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>السعة</TableHead>
                  <TableHead>المسؤول</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map(warehouse => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                    <TableCell>{warehouse.location}</TableCell>
                    <TableCell>{warehouse.capacity.toLocaleString()}</TableCell>
                    <TableCell>{warehouse.manager || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'}>
                        {warehouse.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {warehouses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                      لا توجد مستودعات مسجلة حالياً
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminRoute>
  )
}
