import { cn } from "@/lib/utils"

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

interface VehicleCardSkeletonProps {
  count?: number
}

export function VehicleCardSkeleton({ count = 1 }: VehicleCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface HeroSliderSkeletonProps {
  // Empty interface for future props
}

export function HeroSliderSkeleton({}: HeroSliderSkeletonProps) {
  return (
    <div className="relative h-[600px] md:h-[700px] overflow-hidden">
      <Skeleton className="h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface ServiceCardSkeletonProps {
  count?: number
}

export function ServiceCardSkeleton({ count = 1 }: ServiceCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </>
  )
}

interface TestimonialSkeletonProps {
  count?: number
}

export function TestimonialSkeleton({ count = 1 }: TestimonialSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-4" />
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </>
  )
}

interface StatsCardSkeletonProps {
  count?: number
}

export function StatsCardSkeleton({ count = 1 }: StatsCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="text-center space-y-2">
          <Skeleton className="h-12 w-12 mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PageHeaderSkeletonProps {
  // Empty interface for future props
}

export function PageHeaderSkeleton({}: PageHeaderSkeletonProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-64" />
        </div>
      </div>
    </div>
  )
}

interface FormSkeletonProps {
  fieldCount?: number
}

export function FormSkeleton({ fieldCount = 5 }: FormSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fieldCount }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

interface TableSkeletonProps {
  rowCount?: number
  columnCount?: number
}

export function TableSkeleton({ rowCount = 5, columnCount = 4 }: TableSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="space-y-0">
          {/* Header */}
          <div className="border-b bg-gray-50 p-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: columnCount }).map((_, index) => (
                <Skeleton key={index} className="h-4" />
              ))}
            </div>
          </div>
          {/* Rows */}
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <div key={rowIndex} className="border-b p-4">
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}