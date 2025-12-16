'use client'

import { useState, useEffect, use } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Download, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface QuotationPrintPageProps {
    params: Promise<{ id: string }>
}

export default function QuotationPrintPage({ params }: QuotationPrintPageProps) {
    const { id } = use(params)
    const [quotation, setQuotation] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchQuotation()
    }, [])

    const fetchQuotation = async () => {
        try {
            // Assuming this endpoint exists or will be created/handled
            // We reusing the finance/quotations endpoint or similar logic
            const response = await fetch(`/api/finance/quotations/${id}`)
            if (response.ok) {
                const data = await response.json()
                setQuotation(data)
            }
        } catch (error) {
            console.error('Error fetching quotation:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center">جاري تحميل عرض السعر...</div>
    if (!quotation) return <div className="p-8 text-center text-red-600">لم يتم العثور على عرض السعر</div>

    const handlePrint = () => {
        window.print()
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white p-8 print:p-0 font-sans" dir="rtl">
            {/* Action Bar - Hidden in Print */}
            <div className="max-w-[210mm] mx-auto mb-8 flex items-center justify-between print:hidden">
                <Link href="/admin/quotations">
                    <Button variant="outline">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        عودة للقائمة
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Printer className="ml-2 h-4 w-4" />
                        طباعة / حفظ كملف PDF
                    </Button>
                </div>
            </div>

            {/* A4 Page Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none min-h-[297mm] p-[10mm] relative">

                {/* Header */}
                <div className="border-b-2 border-gray-800 pb-4 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">عرض أسعار ومواصفات</h1>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-bold ml-2">التاريخ:</span> {formatDate(quotation.issueDate)}</p>
                                <p><span className="font-bold ml-2">الرقم المرجعي:</span> {quotation.quotationNumber}</p>
                                <p><span className="font-bold ml-2">الصلاحية:</span> حتى {formatDate(quotation.validUntil)}</p>
                            </div>
                        </div>
                        {/* Logo Placeholder */}
                        <div className="text-left">
                            {/* Replace with actual Logo image if available */}
                            <div className="text-xl font-bold">شركة الحمد للسيارات</div>
                            <div className="text-sm text-gray-500">الموزع المعتمد</div>
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="mb-6 bg-gray-50 p-4 rounded print:bg-transparent print:p-0 print:border print:border-gray-200">
                    <table className="w-full text-sm">
                        <tbody>
                            <tr>
                                <td className="font-bold py-1 w-24">السادة /</td>
                                <td className="py-1">{quotation.customer.name}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1">العنوان /</td>
                                <td className="py-1">{quotation.customer.address || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Vehicle Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold font-serif ltr-text" style={{ direction: 'ltr' }}>
                        {quotation.vehicle?.make} {quotation.vehicle?.model} {quotation.vehicle?.year}
                    </h2>
                </div>

                {/* Vehicle Image */}
                {quotation.vehicle?.images && quotation.vehicle.images.length > 0 && (
                    <div className="mb-8 flex justify-center">
                        <img
                            src={quotation.vehicle.images[0].url}
                            alt="Vehicle"
                            className="max-h-[300px] object-contain"
                        />
                    </div>
                )}

                {/* Technical Specs Table */}
                <div className="mb-8">
                    <div className="bg-gray-800 text-white p-2 text-center font-bold mb-2 print:bg-gray-800 print:text-white">
                        المواصفات الفنية
                    </div>
                    <table className="w-full text-sm border-collapse border border-gray-300">
                        <tbody>
                            {/* Needs actual vehicle specs mapped here. Fallback mock if missing in quotation object */}
                            <tr className="border-b border-gray-200">
                                <td className="p-2 border-l border-gray-300 font-bold bg-gray-50 w-1/3">المحرك (Engine)</td>
                                <td className="p-2 ltr-text text-left" style={{ direction: 'ltr' }}>{quotation.vehicle?.specifications?.engine || '-'}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-2 border-l border-gray-300 font-bold bg-gray-50">ناقل الحركة (Transmission)</td>
                                <td className="p-2 ltr-text text-left" style={{ direction: 'ltr' }}>{quotation.vehicle?.specifications?.transmission || '-'}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-2 border-l border-gray-300 font-bold bg-gray-50">اللون (Color)</td>
                                <td className="p-2">{quotation.vehicle?.color || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Features / Options */}
                <div className="mb-8 break-inside-avoid">
                    <div className="bg-gray-800 text-white p-2 text-center font-bold mb-2 print:bg-gray-800 print:text-white">
                        الكماليات (Options)
                    </div>
                    <div className="border border-gray-300 p-4 min-h-[100px]">
                        <ul className="grid grid-cols-2 gap-2 text-sm list-disc list-inside">
                            {quotation.vehicle?.features && quotation.vehicle.features.length > 0 ? (
                                quotation.vehicle.features.map((feature: any, idx: number) => (
                                    <li key={idx}>{typeof feature === 'string' ? feature : feature.name}</li>
                                ))
                            ) : (
                                <li>لم يتم تحديد كماليات إضافية</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Pricing */}
                <div className="mb-8 break-inside-avoid">
                    <div className="bg-gray-800 text-white p-2 text-center font-bold mb-2 print:bg-gray-800 print:text-white">
                        الشروط والأحكام والسعر
                    </div>
                    <table className="w-full text-sm border-collapse border border-gray-300">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="p-3 border-l border-gray-300 font-bold bg-gray-50 w-1/3">سعر الوحدة (Price)</td>
                                <td className="p-3 font-bold text-lg">{formatCurrency(quotation.totalAmount)}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-3 border-l border-gray-300 font-bold bg-gray-50">الضمان (Warranty)</td>
                                <td className="p-3">{quotation.terms || 'ساري حسب شروط الوكيل'}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-3 border-l border-gray-300 font-bold bg-gray-50">الصلاحية</td>
                                <td className="p-3">هذا العرض ساري حتى {formatDate(quotation.validUntil)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-500 print:absolute print:bottom-4 print:left-0 print:right-0">
                    <p>شركة الحمد للسيارات - الموزع المعتمد</p>
                    <p>العنوان: طريق مصر اسماعيلية الصحراوي</p>
                </div>

            </div>

            <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
        </div>
    )
}
