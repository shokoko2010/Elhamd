'use client'

import { AdminRoute } from '@/components/auth/AdminRoute'
import FooterManagement from '@/components/admin/FooterManagement'

export default function AdminFooterPage() {
  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8">
        <FooterManagement />
      </div>
    </AdminRoute>
  )
}