import type { Metadata } from "next";
import { Cairo, Tajawal, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { HomepageSEO } from "@/components/seo/SEO";
import { SessionManager } from "@/components/session-manager";
import { PwaRegistry } from "@/components/pwa-registry";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "700"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elhamd Imports - الموزع المعتمد لتاتا موتورز في مدن القناة",
  description: "الموزع المعتمد لشركة تاتا موتورز في مدن القناة. استكشف تشكيلتنا المتخصصة من السيارات التجارية والخدمية، واحجز قيادة تجريبية، وجد مواعيد الصيانة.",
  keywords: "Elhamd Imports, الحمد للسيارات, تاتا موتورز, مدن القناة, سيارات, مركبات, قيادة تجريبية, صيانة, موزع",
  authors: [{ name: "فريق Elhamd Imports" }],
  openGraph: {
    title: "Elhamd Imports - الموزع المعتمد لتاتا موتورز في مدن القناة",
    description: "الموزع المعتمد لشركة تاتا موتورز في مدن القناة",
    url: "https://elhamdimports.com",
    siteName: "Elhamd Imports",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elhamd Imports - الموزع المعتمد لتاتا موتورز في مدن القناة",
    description: "الموزع المعتمد لشركة تاتا موتورز في مدن القناة",
  },
  alternates: {
    canonical: "https://elhamdimports.com",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  other: {
    'theme-color': '#2563eb',
    'msapplication-TileColor': '#2563eb',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Elhamd Imports',
    'mobile-web-app-capable': 'yes',
    'application-name': 'Elhamd Imports',
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
  const homepageSEO = HomepageSEO();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: homepageSEO.structuredData
          }}
        />
      </head>
      <body
        className={`${cairo.className} ${cairo.variable} ${tajawal.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <PwaRegistry />
        <AuthProvider>
          <AnalyticsProvider measurementId={measurementId}>
            <SiteSettingsProvider>
              <SessionManager />
              {children}
              <Toaster />
            </SiteSettingsProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
