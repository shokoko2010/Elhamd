'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption 
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react'

interface ResponsiveTableProps {
  data: any[]
  columns: {
    key: string
    label: string
    type?: 'text' | 'number' | 'currency' | 'date' | 'status' | 'actions'
    format?: (value: any) => string | React.ReactNode
    className?: string
    mobilePriority?: 'high' | 'medium' | 'low'
  }[]
  title?: string
  description?: string
  onRowClick?: (row: any) => void
  actions?: (row: any) => React.ReactNode
  loading?: boolean
  emptyState?: {
    title: string
    description: string
    action?: React.ReactNode
  }
  className?: string
}

export function ResponsiveTable({
  data,
  columns,
  title,
  description,
  onRowClick,
  actions,
  loading = false,
  emptyState,
  className
}: ResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const formatValue = (value: any, column: any, row: any) => {
    if (column.format) {
      return column.format(value)
    }

    switch (column.type) {
      case 'currency':
        return new Intl.NumberFormat('ar-EG', {
          style: 'currency',
          currency: 'EGP',
          minimumFractionDigits: 0
        }).format(value || 0)
      
      case 'date':
        return value ? new Date(value).toLocaleDateString('ar-EG') : '-'
      
      case 'status':
        const statusConfig: Record<string, { variant: any; label: string }> = {
          'PENDING': { variant: 'secondary', label: 'قيد الانتظار' },
          'APPROVED': { variant: 'default', label: 'معتمد' },
          'REJECTED': { variant: 'destructive', label: 'مرفوض' },
          'COMPLETED': { variant: 'outline', label: 'مكتمل' },
          'ACTIVE': { variant: 'default', label: 'نشط' },
          'INACTIVE': { variant: 'secondary', label: 'غير نشط' }
        }
        const config = statusConfig[value] || { variant: 'secondary', label: value }
        return (
          <Badge variant={config.variant} className="text-xs">
            {config.label}
          </Badge>
        )
      
      case 'actions':
        return actions ? actions(row) : null
      
      default:
        return value || '-'
    }
  }

  // Mobile Card View
  const MobileCardView = () => (
    <div className="space-y-3 md:hidden">
      {data.map((row, index) => {
        const rowId = row.id || index.toString()
        const isExpanded = expandedRows.has(rowId)
        const highPriorityColumns = columns.filter(col => col.mobilePriority !== 'low')
        
        return (
          <Card 
            key={rowId} 
            className="transition-all duration-200 hover:shadow-md cursor-pointer"
            onClick={() => onRowClick?.(row)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {formatValue(row[columns[0]?.key], columns[0], row)}
                  </CardTitle>
                  {columns[1] && (
                    <CardDescription className="mt-1">
                      {formatValue(row[columns[1]?.key], columns[1], row)}
                    </CardDescription>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleRow(rowId)
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* High priority fields always visible */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {highPriorityColumns.slice(2, 6).map((column) => (
                  <div key={column.key} className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">{column.label}</p>
                    <p className={cn("text-sm font-medium", column.className)}>
                      {formatValue(row[column.key], column, row)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Expandable details */}
              {isExpanded && (
                <div className="space-y-3 pt-3 border-t">
                  {columns.filter(col => col.mobilePriority === 'low').map((column) => (
                    <div key={column.key} className="flex justify-between items-start">
                      <p className="text-sm text-gray-500 font-medium min-w-0 flex-shrink-0">
                        {column.label}
                      </p>
                      <p className={cn("text-sm font-medium text-right max-w-[60%]", column.className)}>
                        {formatValue(row[column.key], column, row)}
                      </p>
                    </div>
                  ))}
                  
                  {/* Actions */}
                  {actions && (
                    <div className="flex gap-2 pt-2">
                      {actions(row)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  // Desktop Table View
  const DesktopTableView = () => (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={cn(
                  "text-right font-medium",
                  column.type === 'actions' && "text-center",
                  column.className
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={row.id || index}
              className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  className={cn(
                    "text-right",
                    column.type === 'actions' && "text-center",
                    column.className
                  )}
                >
                  {formatValue(row[column.key], column, row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-16"></div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {emptyState?.title || 'لا توجد بيانات'}
            </h3>
            <p className="text-gray-500 mb-4">
              {emptyState?.description || 'لم يتم العثور على أي سجلات'}
            </p>
            {emptyState?.action}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}
      
      <MobileCardView />
      <DesktopTableView />
    </div>
  )
}