'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Banknote, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  ArrowRight,
  Info,
  SmartphoneNfc
} from 'lucide-react'
import { PaymentMethod } from '@prisma/client'
import { enhancedPaymentService } from '@/lib/enhanced-payment-service'

interface EnhancedPaymentFormProps {
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
  paymentMethod: PaymentMethod | ''
  cardNumber: string
  cardExpiry: string
  cardCVC: string
  cardName: string
  discountCode: string
  agreeToTerms: boolean
  vodafonePin: string
  bankReference: string
}

type PaymentStep = 'method' | 'details' | 'confirm' | 'processing' | 'success'

export default function EnhancedPaymentForm({
  amount,
  currency = 'EGP',
  description,
  customerInfo,
  bookingType,
  bookingId,
  onPaymentSuccess,
  onPaymentError
}: EnhancedPaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardName: '',
    discountCode: '',
    agreeToTerms: false,
    vodafonePin: '',
    bankReference: ''
  })
  
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [finalAmount, setFinalAmount] = useState(amount)
  const [currentStep, setCurrentStep] = useState<PaymentStep>('method')
  const [selectedMethodDetails, setSelectedMethodDetails] = useState<any>(null)
  const [paymentProgress, setPaymentProgress] = useState(0)

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
      const discountedAmount = applyDiscount(amount, formData.discountCode, discountRules)
      setDiscountAmount(amount - discountedAmount)
      setFinalAmount(discountedAmount)
    } else {
      setDiscountAmount(0)
      setFinalAmount(amount)
    }
  }, [formData.discountCode, amount])

  useEffect(() => {
    if (formData.paymentMethod) {
      const details = enhancedPaymentService.getPaymentMethodDetails(formData.paymentMethod)
      setSelectedMethodDetails(details)
    }
  }, [formData.paymentMethod])

  const fetchPaymentMethods = async () => {
    try {
      const methods = enhancedPaymentService.getAllPaymentMethodsDetails()
      setAvailablePaymentMethods(methods)
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const handleInputChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const applyDiscount = (amount: number, code: string, rules: Record<string, any>): number => {
    const rule = rules[code]
    if (!rule) return amount

    if (rule.type === 'percentage') {
      return amount * (1 - rule.value / 100)
    } else if (rule.type === 'fixed') {
      return Math.max(0, amount - rule.value)
    }
    return amount
  }

  const validatePaymentDetails = (): string[] => {
    const errors: string[] = []

    if (!formData.paymentMethod) {
      errors.push('يرجى اختيار طريقة الدفع')
    }

    if (formData.paymentMethod === PaymentMethod.CREDIT_CARD || formData.paymentMethod === PaymentMethod.DEBIT_CARD) {
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

    if (formData.paymentMethod === PaymentMethod.MOBILE_WALLET && !formData.vodafonePin) {
      errors.push('يرجى إدخال رمز التأكيد')
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
    setCurrentStep('processing')
    setPaymentProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setPaymentProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const paymentRequest = {
        bookingId: bookingId || '',
        bookingType,
        amount: finalAmount,
        currency,
        paymentMethod: formData.paymentMethod as PaymentMethod,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerName: customerInfo.name,
        description,
        notes: formData.discountCode ? `Discount code: ${formData.discountCode}` : undefined,
        metadata: {
          discountCode: formData.discountCode || undefined,
          originalAmount: amount,
          discountAmount: discountAmount > 0 ? discountAmount : undefined
        }
      }

      const result = await enhancedPaymentService.processPayment(paymentRequest)

      clearInterval(progressInterval)
      setPaymentProgress(100)

      if (result.success) {
        setCurrentStep('success')
        
        // If redirect is required, redirect after a delay
        if (result.requiresRedirect && result.redirectUrl) {
          setTimeout(() => {
            window.location.href = result.redirectUrl!
          }, 2000)
        }

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
        setCurrentStep('details')
      }
    } catch (error) {
      clearInterval(progressInterval)
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      setPaymentError(errorMessage)
      onPaymentError(errorMessage)
      setCurrentStep('details')
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

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        return <CreditCard className="h-6 w-6" />
      case PaymentMethod.MOBILE_WALLET:
        return <Smartphone className="h-6 w-6" />
      case PaymentMethod.BANK_TRANSFER:
        return <Building2 className="h-6 w-6" />
      case PaymentMethod.CASH:
        return <Banknote className="h-6 w-6" />
      default:
        return <CreditCard className="h-6 w-6" />
    }
  }

  const getPaymentMethodName = (method: PaymentMethod) => {
    const names = {
      [PaymentMethod.CASH]: 'نقدي',
      [PaymentMethod.CREDIT_CARD]: 'بطاقة ائتمان',
      [PaymentMethod.DEBIT_CARD]: 'بطاقة خصم',
      [PaymentMethod.BANK_TRANSFER]: 'تحويل بنكي',
      [PaymentMethod.MOBILE_WALLET]: 'محفظة إلكترونية'
    }
    return names[method] || method
  }

  const renderPaymentMethodCard = (method: any) => (
    <Card
      key={method.method}
      className={`cursor-pointer transition-all hover:shadow-md ${
        formData.paymentMethod === method.method ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => method.available && handleInputChange('paymentMethod', method.method)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{method.icon}</div>
          <div className="flex-1">
            <div className="font-medium">{method.name}</div>
            <div className="text-sm text-gray-500">
              {method.fees > 0 ? `رسوم: ${method.fees} جنيه` : 'بدون رسوم'}
            </div>
          </div>
          {method.available ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </CardContent>
    </Card>
  )

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
              <span>{finalAmount.toLocaleString()} {currency}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>الخصم:</span>
                <span>-{discountAmount.toLocaleString()} {currency}</span>
              </div>
            )}
            {selectedMethodDetails && selectedMethodDetails.fees > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>رسوم الدفع:</span>
                <span>+{selectedMethodDetails.fees.toLocaleString()} {currency}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>المجموع:</span>
              <span className="text-blue-600">
                {selectedMethodDetails 
                  ? (finalAmount + selectedMethodDetails.fees).toLocaleString()
                  : finalAmount.toLocaleString()} {currency}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${currentStep === 'method' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'method' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="text-sm">اختيار الطريقة</span>
            </div>
            <div className={`flex items-center gap-2 ${currentStep === 'details' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="text-sm">تفاصيل الدفع</span>
            </div>
            <div className={`flex items-center gap-2 ${currentStep === 'processing' || currentStep === 'success' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'processing' || currentStep === 'success' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="text-sm">تأكيد</span>
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
          {currentStep === 'method' && (
            <div className="space-y-4">
              <h3 className="font-semibold">اختر طريقة الدفع:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePaymentMethods.map(renderPaymentMethodCard)}
              </div>
              
              {formData.paymentMethod && (
                <div className="mt-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep('details')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    متابعة
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Payment Details */}
          {currentStep === 'details' && selectedMethodDetails && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">تفاصيل الدفع:</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep('method')}
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                  تغيير طريقة الدفع
                </Button>
              </div>

              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {selectedMethodDetails.description}
                </AlertDescription>
              </Alert>

              {(formData.paymentMethod === PaymentMethod.CREDIT_CARD || formData.paymentMethod === PaymentMethod.DEBIT_CARD) && (
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

              {formData.paymentMethod === PaymentMethod.MOBILE_WALLET && (
                <div className="space-y-4">
                  <div className="text-center">
                    <SmartphoneNfc className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                    <p className="text-sm text-gray-600 mb-4">
                      سيتم إرسال رمز تأكيد إلى هاتفك: {customerInfo.phone}
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="vodafonePin">رمز التأكيد</Label>
                    <Input
                      id="vodafonePin"
                      value={formData.vodafonePin}
                      onChange={(e) => handleInputChange('vodafonePin', e.target.value)}
                      placeholder="أدخل الرمز المرسل إلى هاتفك"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              )}

              {formData.paymentMethod === PaymentMethod.BANK_TRANSFER && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">بيانات الحساب البنكي:</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>البنك:</strong> بنك القاهرة</div>
                      <div><strong>اسم الحساب:</strong> الحمد للسيارات</div>
                      <div><strong>رقم الحساب:</strong> 1234567890</div>
                      <div><strong>الفرع:</strong> فرع الرئيسي - القاهرة</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bankReference">رقم الإشارة (اختياري)</Label>
                    <Input
                      id="bankReference"
                      value={formData.bankReference}
                      onChange={(e) => handleInputChange('bankReference', e.target.value)}
                      placeholder="رقم الإشارة للتحويل"
                    />
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
                  onClick={() => setCurrentStep('method')}
                  className="flex-1"
                >
                  رجوع
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing || !formData.agreeToTerms}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {`ادفع ${(finalAmount + (selectedMethodDetails?.fees || 0)).toLocaleString()} ${currency}`}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {currentStep === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">جاري معالجة الدفع...</h3>
              <p className="text-gray-600 mb-4">يرجى الانتظار بينما نعالج طلب الدفع الخاص بك</p>
              <Progress value={paymentProgress} className="w-full max-w-xs mx-auto" />
              <p className="text-sm text-gray-500 mt-2">{paymentProgress}%</p>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">تمت عملية الدفع بنجاح!</h3>
              <p className="text-gray-600 mb-4">
                شكراً لك. تم استلام دفعتك بنجاح وتأكيد حجزك.
              </p>
              {selectedMethodDetails?.requiresRedirect && (
                <p className="text-sm text-blue-600 mb-4">
                  سيتم توجيهك إلى صفحة الدفع خلال ثوانٍ...
                </p>
              )}
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