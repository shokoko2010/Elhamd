'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, ChevronRight, Clock, MapPin, Phone, Mail, User, Calendar, DollarSign, TrendingUp } from 'lucide-react'

interface ResponsiveCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  status?: {
    text: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    icon?: React.ReactNode
  }
  footer?: React.ReactNode
  onClick?: () => void
  hoverable?: boolean
  compact?: boolean
  loading?: boolean
}

interface ResponsiveDataCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  icon?: React.ReactNode
  className?: string
  format?: 'currency' | 'percentage' | 'number'
  onClick?: () => void
}

interface ResponsiveListItemProps {
  title: string
  subtitle?: string
  description?: string
  avatar?: React.ReactNode
  status?: React.ReactNode
  action?: React.ReactNode
  meta?: Array<{
    icon?: React.ReactNode
    text: string
    label?: string
  }>
  className?: string
  onClick?: () => void
  compact?: boolean
}

export function ResponsiveCard({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  action,
  icon,
  status,
  footer,
  onClick,
  hoverable = false,
  compact = false,
  loading = false
}: ResponsiveCardProps) {
  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className={cn("p-4", contentClassName)}>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        hoverable && "hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        compact && "p-4",
        className
      )}
      onClick={onClick}
    >
      {(title || description || icon || action || status) && (
        <CardHeader className={cn("pb-4", compact && "pb-2", headerClassName)}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {icon && (
                <div className="flex-shrink-0 mt-1">
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <CardTitle className={cn(
                    "text-lg leading-tight",
                    compact && "text-base",
                    description && "mb-1"
                  )}>
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className={cn(
                    "text-sm",
                    compact && "text-xs"
                  )}>
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {status && (
                <Badge 
                  variant={status.variant} 
                  className={cn(
                    "text-xs flex items-center gap-1",
                    compact && "text-[10px] px-2 py-0.5"
                  )}
                >
                  {status.icon}
                  {status.text}
                </Badge>
              )}
              {action && (
                <div className="text-muted-foreground">
                  {action}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={cn(
        "pt-0",
        compact && "pt-0",
        contentClassName
      )}>
        {children}
      </CardContent>
      
      {footer && (
        <div className={cn(
          "px-6 pb-6",
          compact && "px-4 pb-4"
        )}>
          {footer}
        </div>
      )}
    </Card>
  )
}

export function ResponsiveDataCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
  format = 'number',
  onClick
}: ResponsiveDataCardProps) {
  const formatValue = (val: string | number) => {
    const numValue = typeof val === 'string' ? parseFloat(val) : val
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('ar-EG', {
          style: 'currency',
          currency: 'EGP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(numValue)
      
      case 'percentage':
        return `${numValue}%`
      
      default:
        return new Intl.NumberFormat('ar-EG').format(numValue)
    }
  }

  return (
    <ResponsiveCard
      icon={icon}
      onClick={onClick}
      hoverable={!!onClick}
      className={cn("h-auto", className)}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              trend.positive !== false ? "text-green-600" : "text-red-600"
            )}>
              <TrendingUp className={cn(
                "h-3 w-3",
                trend.positive === false && "rotate-180"
              )} />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">{formatValue(value)}</p>
          {trend && (
            <p className="text-xs text-muted-foreground">{trend.label}</p>
          )}
        </div>
        
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </ResponsiveCard>
  )
}

export function ResponsiveListItem({
  title,
  subtitle,
  description,
  avatar,
  status,
  action,
  meta,
  className,
  onClick,
  compact = false
}: ResponsiveListItemProps) {
  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors",
        onClick && "cursor-pointer",
        compact && "p-2 gap-2",
        className
      )}
      onClick={onClick}
    >
      {avatar && (
        <div className="flex-shrink-0">
          {avatar}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-medium text-sm truncate",
              compact && "text-xs"
            )}>
              {title}
            </h4>
            {subtitle && (
              <p className={cn(
                "text-xs text-muted-foreground truncate",
                compact && "text-[11px]"
              )}>
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {status && (
              <div className="flex-shrink-0">
                {status}
              </div>
            )}
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
        
        {description && (
          <p className={cn(
            "text-xs text-muted-foreground mb-2",
            compact && "text-[11px] mb-1"
          )}>
            {description}
          </p>
        )}
        
        {meta && meta.length > 0 && (
          <div className={cn(
            "flex flex-wrap gap-2",
            compact && "gap-1"
          )}>
            {meta.map((item, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center gap-1 text-xs text-muted-foreground",
                  compact && "text-[11px]"
                )}
              >
                {item.icon && (
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                )}
                <span className="truncate">{item.text}</span>
                {item.label && (
                  <span className="text-muted-foreground/60">• {item.label}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Mobile-optimized card grid component
interface ResponsiveCardGridProps {
  children: React.ReactNode
  cols?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  className?: string
}

export function ResponsiveCardGrid({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = { default: 4, sm: 4, md: 6, lg: 6 },
  className
}: ResponsiveCardGridProps) {
  const gridClasses = [
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ')

  const gapClasses = [
    `gap-${gap.default}`,
    gap.sm && `sm:gap-${gap.sm}`,
    gap.md && `md:gap-${gap.md}`,
    gap.lg && `lg:gap-${gap.lg}`,
    gap.xl && `xl:gap-${gap.xl}`,
  ].filter(Boolean).join(' ')

  return (
    <div className={cn("grid", gridClasses, gapClasses, className)}>
      {children}
    </div>
  )
}