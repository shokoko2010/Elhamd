import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { HomepageSEO } from "@/components/seo/SEO";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "الحمد للسيارات - الوكيل الرسمي لتاتا موتورز في مصر",
  description: "الوكيل الرسمي لشركة تاتا موتورز في مصر. استكشف تشكيلتنا من السيارات، واحجز قيادة تجريبية، وجد مواعيد الصيانة.",
  keywords: "الحمد للسيارات, تاتا موتورز, مصر, سيارات, مركبات, قيادة تجريبية, صيانة, وكالة",
  authors: [{ name: "فريق الحمد للسيارات" }],
  openGraph: {
    title: "الحمد للسيارات - الوكيل الرسمي لتاتا موتورز في مصر",
    description: "الوكيل الرسمي لشركة تاتا موتورز في مصر",
    url: "https://alhamdcars.com",
    siteName: "الحمد للسيارات",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "الحمد للسيارات - الوكيل الرسمي لتاتا موتورز في مصر",
    description: "الوكيل الرسمي لشركة تاتا موتورز في مصر",
  },
  alternates: {
    canonical: "https://alhamdcars.com",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  other: {
    'theme-color': '#1e40af',
    'msapplication-TileColor': '#1e40af',
    'geo.region': 'EG-C',
    'geo.placename': 'Cairo',
    'geo.position': '30.0444;31.2357',
    'ICBM': '30.0444, 31.2357',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { structuredData } = HomepageSEO();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''
  
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: structuredData
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <AnalyticsProvider measurementId={measurementId}>
            {children}
            <Toaster />
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
