import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

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
  keywords: ["الحمد للسيارات", "تاتا موتورز", "مصر", "سيارات", "مركبات", "قيادة تجريبية", "صيانة", "وكالة"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
