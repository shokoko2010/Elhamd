import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'خريطة الموقع - الحمد للسيارات',
  description: 'اكتشف جميع صفحات وأقسام موقع الحمد للسيارات. تصفح بسهولة جميع الخدمات والمنتجات والمعلومات المتوفرة.',
  keywords: ['خريطة الموقع', 'فهرس الموقع', 'صفحات الموقع', 'الحمد للسيارات', 'سيارات', 'خدمات'],
  openGraph: {
    title: 'خريطة الموقع - الحمد للسيارات',
    description: 'اكتشف جميع صفحات وأقسام موقع الحمد للسيارات',
    type: 'website',
  },
}

export default function layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}