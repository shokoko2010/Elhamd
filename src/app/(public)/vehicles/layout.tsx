import { VehiclesSEO } from '@/components/seo/SEO'

export const metadata = VehiclesSEO().metadata

export default function VehiclesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: VehiclesSEO().structuredData
        }}
      />
      {children}
    </>
  )
}