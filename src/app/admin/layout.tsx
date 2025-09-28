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
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminRoute>
  )
}