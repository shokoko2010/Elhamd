import { Suspense } from 'react'
import FinanceDashboard from './FinanceDashboard'

function FinanceDashboardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
    </div>
  )
}

export default function FinancePage() {
  return (
    <Suspense fallback={<FinanceDashboardFallback />}>
      <FinanceDashboard />
    </Suspense>
  )
}
