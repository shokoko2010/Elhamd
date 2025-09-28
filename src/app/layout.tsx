import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
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
  title: "Elhamd Imports - الوكيل الرسمي لتاتا موتورز في مصر",
  description: "الوكيل الرسمي لشركة تاتا موتورز في مصر. استكشف تشكيلتنا من السيارات، واحجز قيادة تجريبية، وجد مواعيد الصيانة.",
  keywords: "Elhamd Imports, الحمد للسيارات, تاتا موتورز, مصر, سيارات, مركبات, قيادة تجريبية, صيانة, وكالة",
  authors: [{ name: "فريق Elhamd Imports" }],
  openGraph: {
    title: "Elhamd Imports - الوكيل الرسمي لتاتا موتورز في مصر",
    description: "الوكيل الرسمي لشركة تاتا موتورز في مصر",
    url: "https://elhamdimports.com",
    siteName: "Elhamd Imports",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elhamd Imports - الوكيل الرسمي لتاتا موتورز في مصر",
    description: "الوكيل الرسمي لشركة تاتا موتورز في مصر",
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
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                      
                      // Check for updates
                      registration.addEventListener('updatefound', () => {
                        const installingWorker = registration.installing;
                        installingWorker.addEventListener('statechange', () => {
                          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            if (confirm('إصدار جديد متاح! هل تريد تحديث الصفحة؟')) {
                              window.location.reload();
                            }
                          }
                        });
                      });
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                });
              }
              
              // PWA Install Prompt
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                // Show install button if desired
                if (typeof document !== 'undefined') {
                  const installButton = document.getElementById('pwa-install-button');
                  if (installButton) {
                    installButton.style.display = 'block';
                    installButton.addEventListener('click', () => {
                      deferredPrompt.prompt();
                      deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                          console.log('User accepted the install prompt');
                        } else {
                          console.log('User dismissed the install prompt');
                        }
                        deferredPrompt = null;
                      });
                    });
                  }
                }
              });
              
              // Handle app installed
              window.addEventListener('appinstalled', (evt) => {
                console.log('PWA was installed');
                if (typeof document !== 'undefined') {
                  const installButton = document.getElementById('pwa-install-button');
                  if (installButton) {
                    installButton.style.display = 'none';
                  }
                }
              });
              
              // Handle online/offline status
              window.addEventListener('online', () => {
                console.log('App is online');
                if (typeof document !== 'undefined' && document.body) {
                  document.body.classList.remove('offline');
                  document.body.classList.add('online');
                }
              });
              
              window.addEventListener('offline', () => {
                console.log('App is offline');
                if (typeof document !== 'undefined' && document.body) {
                  document.body.classList.remove('online');
                  document.body.classList.add('offline');
                }
              });
              
              // Check initial status
              if (typeof document !== 'undefined' && document.body) {
                if (navigator.onLine) {
                  document.body.classList.add('online');
                } else {
                  document.body.classList.add('offline');
                }
              }
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <AnalyticsProvider measurementId={measurementId}>
            <SiteSettingsProvider>
              {children}
              <Toaster />
            </SiteSettingsProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
