import type { Metadata } from "next";
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminRoute } from '@/components/auth/AdminRoute'

export const metadata: Metadata = {
  title: "لوحة التحكم - الحمد للسيارات",
  description: "لوحة تحكم مشرفي شركة الحمد للسيارات",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminRoute>
  )
}