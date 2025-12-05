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
      <div className="admin-surface relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_30%),linear-gradient(135deg,rgba(59,130,246,0.06)_0%,rgba(99,102,241,0.04)_40%,rgba(14,165,233,0.06)_100%)]" />
        <AdminHeader />
        <div className="relative flex flex-col md:flex-row">
          <AdminSidebar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            <div className="mx-auto w-full max-w-7xl space-y-4 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-2xl shadow-blue-100/70 backdrop-blur-xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminRoute>
  )
}