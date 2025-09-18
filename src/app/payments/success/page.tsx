'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Home, Download, Mail } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
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
          status: 'COMPLETED',
          transactionId: 'TXN123456789',
          date: new Date().toISOString(),
          bookingType: 'service',
          customerName: 'أحمد محمد'
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
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">تمت عملية الدفع بنجاح!</CardTitle>
          <CardDescription>
            شكراً لك. تم استلام دفعتك بنجاح وتأكيد حجزك.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
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
                <span className="font-medium text-green-600">مكتمل</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="ml-2 h-4 w-4" />
              تحميل الإيصال
            </Button>
            
            <Button variant="outline" className="w-full">
              <Mail className="ml-2 h-4 w-4" />
              إرسال الإيصال بالبريد
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
            <p>تم إرسال تأكيد الحجز إلى بريدك الإلكتروني</p>
            <p>للاستفسار: 01000000000</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}