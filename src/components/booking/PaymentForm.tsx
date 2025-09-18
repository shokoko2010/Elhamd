'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, Shield, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { PaymentService, paymentUtils } from '@/lib/payment'

interface PaymentFormProps {
  amount: number
  currency?: string
  description: string
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  bookingType: 'test-drive' | 'service'
  bookingId?: string
  onPaymentSuccess: (paymentResult: any) => void
  onPaymentError: (error: string) => void
}

interface PaymentFormData {
  paymentMethod: string
  cardNumber: string
  cardExpiry: string
  cardCVC: string
  cardName: string
  discountCode: string
  agreeToTerms: boolean
}

export default function PaymentForm({
  amount,
  currency = 'EGP',
  description,
  customerInfo,
  bookingType,
  bookingId,
  onPaymentSuccess,
  onPaymentError
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardName: '',
    discountCode: '',
    agreeToTerms: false
  })
  
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [finalAmount, setFinalAmount] = useState(amount)
  const [paymentStep, setPaymentStep] = useState(1) // 1: Method, 2: Details, 3: Confirm

  const paymentService = PaymentService.getInstance()

  // Mock discount rules
  const discountRules: Record<string, any> = {
    'WELCOME10': { type: 'percentage', value: 10, description: 'خصم 10% لأول حجز' },
    'SERVICE50': { type: 'fixed', value: 50, description: 'خصم 50 جنيه على خدمات الصيانة' },
    'TEST100': { type: 'fixed', value: 100, description: 'خصم 100 جنيه على تجربة القيادة' }
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  useEffect(() => {
    // Calculate discount
    if (formData.discountCode) {
      const discountedAmount = paymentUtils.applyDiscount(amount, formData.discountCode, discountRules)
      setDiscountAmount(amount - discountedAmount)
      setFinalAmount(discountedAmount)
    } else {
      setDiscountAmount(0)
      setFinalAmount(amount)
    }
  }, [formData.discountCode, amount])

  const fetchPaymentMethods = async () => {
    try {
      const methods = await paymentService.getAvailablePaymentMethods()
      setAvailablePaymentMethods(methods)
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const handleInputChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validatePaymentDetails = (): string[] => {
    const errors: string[] = []

    if (!formData.paymentMethod) {
      errors.push('يرجى اختيار طريقة الدفع')
    }

    if (formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') {
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
        errors.push('رقم البطاقة غير صحيح')
      }
      if (!formData.cardExpiry || !/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        errors.push('تاريخ انتهاء البطاقة غير صحيح')
      }
      if (!formData.cardCVC || formData.cardCVC.length < 3) {
        errors.push('رمز الحماية غير صحيح')
      }
      if (!formData.cardName || formData.cardName.trim().length === 0) {
        errors.push('الاسم على البطاقة مطلوب')
      }
    }

    if (!formData.agreeToTerms) {
      errors.push('يجب الموافقة على الشروط والأحكام')
    }

    return errors
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validatePaymentDetails()
    if (errors.length > 0) {
      setPaymentError(errors.join(', '))
      return
    }

    setIsProcessing(true)
    setPaymentError('')

    try {
      const paymentOptions = {
        amount: finalAmount,
        currency,
        description,
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
        metadata: {
          bookingType,
          bookingId,
          customerPhone: customerInfo.phone,
          discountCode: formData.discountCode || undefined,
          originalAmount: amount,
          discountAmount: discountAmount > 0 ? discountAmount : undefined
        }
      }

      const result = await paymentService.createPayment(paymentOptions)

      if (result.success) {
        onPaymentSuccess({
          ...result,
          finalAmount,
          discountAmount: discountAmount > 0 ? discountAmount : undefined,
          discountCode: formData.discountCode || undefined,
          paymentMethod: formData.paymentMethod
        })
      } else {
        setPaymentError(result.error || 'فشلت عملية الدفع')
        onPaymentError(result.error || 'فشلت عملية الدفع')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      setPaymentError(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, '').replace(/(.{2})/, '$1/').substring(0, 5)
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-5 w-5" />
      case 'debit_card':
        return <CreditCard className="h-5 w-5" />
      case 'paypal':
        return <div className="h-5 w-5 bg-blue-600 rounded" />
      case 'fawry':
        return <div className="h-5 w-5 bg-blue-600 rounded" />
      case 'cash_on_delivery':
        return <div className="h-5 w-5 bg-green-600 rounded" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'بطاقة ائتمان'
      case 'debit_card':
        return 'بطاقة خصم مباشر'
      case 'paypal':
        return 'باي بال'
      case 'fawry':
        return 'فوري'
      case 'cash_on_delivery':
        return 'دفع عند الاستلام'
      default:
        return method
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          معلومات الدفع
        </CardTitle>
        <CardDescription>
          أكمل عملية الدفع لتأكيد حجزك
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">ملخص الدفع:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>المبلغ الأصلي:</span>
              <span>{paymentUtils.formatCurrency(amount, currency)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>الخصم:</span>
                <span>-{paymentUtils.formatCurrency(discountAmount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>المجموع:</span>
              <span className="text-blue-600">{paymentUtils.formatCurrency(finalAmount, currency)}</span>
            </div>
          </div>
        </div>

        {paymentError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {paymentError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          {/* Step 1: Payment Method Selection */}
          {paymentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">اختر طريقة الدفع:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePaymentMethods.map((method) => (
                  <Card
                    key={method}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.paymentMethod === method ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      handleInputChange('paymentMethod', method)
                      setPaymentStep(2)
                    }}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      {getPaymentMethodIcon(method)}
                      <div>
                        <div className="font-medium">{getPaymentMethodName(method)}</div>
                        <div className="text-sm text-gray-500">
                          {method === 'cash_on_delivery' ? 'ادفع عند الحضور' : 'دفع آمن ومشفر'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {paymentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">تفاصيل الدفع:</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPaymentStep(1)}
                >
                  تغيير طريقة الدفع
                </Button>
              </div>

              {(formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName">الاسم على البطاقة</Label>
                    <Input
                      id="cardName"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange('cardName', e.target.value)}
                      placeholder="الاسم كما يظهر على البطاقة"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber">رقم البطاقة</Label>
                    <Input
                      id="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry">تاريخ الانتهاء</Label>
                      <Input
                        id="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={(e) => handleInputChange('cardExpiry', formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCVC">رمز الحماية (CVC)</Label>
                      <Input
                        id="cardCVC"
                        value={formData.cardCVC}
                        onChange={(e) => handleInputChange('cardCVC', e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Discount Code */}
              <div>
                <Label htmlFor="discountCode">كود الخصم (اختياري)</Label>
                <div className="flex gap-2">
                  <Input
                    id="discountCode"
                    value={formData.discountCode}
                    onChange={(e) => handleInputChange('discountCode', e.target.value.toUpperCase())}
                    placeholder="أدخل كود الخصم"
                  />
                  {formData.discountCode && discountRules[formData.discountCode] && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {discountRules[formData.discountCode].description}
                    </Badge>
                  )}
                </div>
                {formData.discountCode && !discountRules[formData.discountCode] && (
                  <p className="text-sm text-red-500 mt-1">كود خصم غير صحيح</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="mt-1"
                  required
                />
                <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                  أوافق على الشروط والأحكام وأقر بأن جميع المعلومات المقدمة صحيحة. 
                  أفهم أن سياسة الإلغاء تنطبق على هذا الحجز.
                </Label>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentStep(1)}
                  className="flex-1"
                >
                  رجوع
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing || !formData.agreeToTerms}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    `ادفع ${paymentUtils.formatCurrency(finalAmount, currency)}`
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-4 border-t">
            <Shield className="h-4 w-4" />
            <span>جميع المعاملات مشفرة وآمنة</span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}