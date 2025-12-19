'use client'

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { usePathname } from "next/navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <>
      <Navbar />
      <main className={isHome ? '' : 'pt-4 md:pt-8'}>
        {children}
      </main>
      <Footer />
    </>
  )
}