'use client'

import Link from 'next/link'
import { 
  Car, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Clock
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Al-Hamd Cars</span>
            </div>
            <p className="text-gray-300 mb-4">
              الوكيل الرسمي لشركة تاتا موتورز في مصر. نقدم أفضل السيارات والخدمات لعملائنا الكرام.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/vehicles" className="text-gray-300 hover:text-white transition-colors">
                  السيارات
                </Link>
              </li>
              <li>
                <Link href="/test-drive" className="text-gray-300 hover:text-white transition-colors">
                  قيادة تجريبية
                </Link>
              </li>
              <li>
                <Link href="/service-booking" className="text-gray-300 hover:text-white transition-colors">
                  حجز خدمة
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">خدماتنا</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/vehicles" className="text-gray-300 hover:text-white transition-colors">
                  بيع سيارات جديدة
                </Link>
              </li>
              <li>
                <Link href="/test-drive" className="text-gray-300 hover:text-white transition-colors">
                  قيادة تجريبية
                </Link>
              </li>
              <li>
                <Link href="/service-booking" className="text-gray-300 hover:text-white transition-colors">
                  صيانة واصلاح
                </Link>
              </li>
              <li>
                <Link href="/service-booking" className="text-gray-300 hover:text-white transition-colors">
                  قطع غيار أصلية
                </Link>
              </li>
              <li>
                <Link href="/service-booking" className="text-gray-300 hover:text-white transition-colors">
                  خدمات ما بعد البيع
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">معلومات الاتصال</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-gray-300">العنوان</p>
                  <p className="text-sm text-gray-400">القاهرة، مصر</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-gray-300">الهاتف</p>
                  <p className="text-sm text-gray-400">+20 2 1234 5678</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-gray-300">البريد الإلكتروني</p>
                  <p className="text-sm text-gray-400">info@alhamdcars.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-gray-300">ساعات العمل</p>
                  <p className="text-sm text-gray-400">السبت - الخميس: 9:00 ص - 8:00 م</p>
                  <p className="text-sm text-gray-400">الجمعة: 2:00 م - 8:00 م</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Al-Hamd Cars. جميع الحقوق محفوظة.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                الشروط والأحكام
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
                من نحن
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}