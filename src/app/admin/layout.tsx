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
      <div className="admin-surface relative min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/50 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(10,26,63,0.03),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(193,39,45,0.03),transparent_30%)]" />
        <AdminHeader />
        <div className="relative flex flex-col md:flex-row">
          <AdminSidebar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            <div className="mx-auto w-full max-w-7xl space-y-4 rounded-3xl border border-white/40 bg-white/60 p-4 shadow-2xl shadow-slate-200/50 backdrop-blur-2xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminRoute>
  )
}