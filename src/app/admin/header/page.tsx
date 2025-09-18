'use client'

import { AdminRoute } from '@/components/auth/AdminRoute'
import HeaderManagement from '@/components/admin/HeaderManagement'

export default function AdminHeaderPage() {
  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8">
        <HeaderManagement />
      </div>
    </AdminRoute>
  )
}