export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 h-full flex items-center justify-center text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              الحمد للسيارات
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              وكيل معتمد لسيارات تاتا في مصر
            </p>
            <p className="text-lg md:text-xl mb-12 text-blue-50 leading-relaxed max-w-2xl mx-auto">
              نقدم أفضل السيارات الهندية بجودة عالية وأسعار تنافسية وخدمة عملاء ممتازة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/vehicles" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
              >
                استعرض السيارات
              </a>
              <a 
                href="/test-drive" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
              >
                قيادة تجريبية
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
              لماذا تختار الحمد للسيارات؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نقدم لكم أفضل الخدمات والمنتجات مع ضمان الجودة والخدمة الممتازة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">ضمان الجودة</h3>
              <p className="text-gray-600">جميع سياراتنا تخضع لفحص شامل وضمان معتمد من المصنع</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">أسعار تنافسية</h3>
              <p className="text-gray-600">نقدم أفضل الأسعار في السمع مع عروض مميزة وتمويل سهل</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">خدمة ممتازة</h3>
              <p className="text-gray-600">فريق خدمة عملاء محترف متخصص في تقديم أفضل الخدمات</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            جاهز لاختيار سيارتك الجديدة؟
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            تواصل معنا اليوم واحصل على استشارة مجانية وعرض خاص
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
            >
              تواصل معنا
            </a>
            <a 
              href="/tel:+20123456789" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              اتصل بنا
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}