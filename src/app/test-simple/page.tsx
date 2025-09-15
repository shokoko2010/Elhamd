export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">صفحة اختبار بسيطة</h1>
        <p className="text-gray-600 mb-8">هذه صفحة اختبار للتأكد من أن التطبيق يعمل بشكل صحيح</p>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">المكونات تعمل</h2>
            <p className="text-green-600">✅ كل شيء يعمل بشكل ممتاز</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">الروابط تعمل</h2>
            <p className="text-green-600">✅ جميع الروابط تعمل بشكل صحيح</p>
          </div>
        </div>
      </div>
    </div>
  )
}