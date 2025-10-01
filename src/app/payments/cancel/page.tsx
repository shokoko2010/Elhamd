'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { XCircle, Home, RefreshCw, Phone } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function PaymentCancelContent() {
  const searchParams = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const paymentId = searchParams.get('payment')
    if (paymentId) {
      // In a real app, you would fetch payment details from the API
      // For now, we'll simulate it
      setTimeout(() => {
        setPaymentDetails({
          id: paymentId,
          amount: 1500,
          currency: 'EGP',
          status: 'CANCELLED',
          transactionId: 'TXN123456789',
          date: new Date().toISOString(),
          bookingType: 'service'
        })
        setIsLoading(false)
      }, 1000)
    }
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل الدفع...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">تم إلغاء عملية الدفع</CardTitle>
          <CardDescription>
            لقد قمت بإلغاء عملية الدفع. لم يتم خصم أي مبلغ من حسابك.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-700">
              حجزك لا يزال قائماً ولكن يتطلب الدفع لتأكيده. يمكنك إعادة محاولة الدفع في أي وقت.
            </AlertDescription>
          </Alert>

          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">رقم المعاملة:</span>
                <span className="font-medium">{paymentDetails.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">المبلغ:</span>
                <span className="font-medium">{paymentDetails.amount.toLocaleString()} {paymentDetails.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">التاريخ:</span>
                <span className="font-medium">{new Date(paymentDetails.date).toLocaleDateString('ar-EG')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">الحالة:</span>
                <span className="font-medium text-red-600">ملغي</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="ml-2 h-4 w-4" />
              إعادة محاولة الدفع
            </Button>
            
            <Button variant="outline" className="w-full">
              <Phone className="ml-2 h-4 w-4" />
              اتصل بالدعم
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full">
                <Home className="ml-2 h-4 w-4" />
                العودة للصفحة الرئيسية
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>إذا واجهت أي مشكلة في الدفع، يرجى التواصل معنا</p>
            <p>الدعم الفني: 01000000000</p>
            <p>البريد الإلكتروني: support@elhamd-cars.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}