'use client'

import { useState, useEffect, use } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, ArrowRight, Save } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { VEHICLE_SPEC_TEMPLATE } from '@/lib/vehicle-specs'

interface QuotationPrintPageProps {
    params: Promise<{ id: string }>
}

export default function QuotationPrintPage({ params }: QuotationPrintPageProps) {
    const { id } = use(params)
    const [quotation, setQuotation] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [editablePrice, setEditablePrice] = useState<string>('')
    const [isEditingPrice, setIsEditingPrice] = useState(false)

    useEffect(() => {
        fetchQuotation()
    }, [])

    const fetchQuotation = async () => {
        try {
            const response = await fetch(`/api/finance/quotations/${id}`)
            if (response.ok) {
                const data = await response.json()
                setQuotation(data)
                setEditablePrice(data.totalAmount.toString())
            }
        } catch (error) {
            console.error('Error fetching quotation:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const formatCurrency = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount
        return new Intl.NumberFormat('ar-EG', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num) + ' EGP'
    }

    const formatDate = (date: string) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        })
    }

    if (loading) return <div className="p-8 text-center">جاري تحميل عرض السعر...</div>
    if (!quotation) return <div className="p-8 text-center text-red-600">لم يتم العثور على عرض السعر</div>

    // Helper to safely get nested specs
    const getSpec = (key: string) => {
        if (Array.isArray(quotation.vehicle?.specifications)) {
            // Normalize the search key (e.g. "engine_type" -> "engine")
            const normalizedSearch = key.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ')

            const spec = quotation.vehicle.specifications.find((s: any) => {
                const specKey = (s.key || '').toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ')
                const specLabel = (s.label || '').toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ')

                return specKey.includes(normalizedSearch) || specLabel.includes(normalizedSearch) || normalizedSearch.includes(specKey)
            })
            return spec?.value
        }
        return quotation.vehicle?.specifications?.[key]
    }

    const vehicleTitle = `${quotation.vehicle?.make || ''} ${quotation.vehicle?.model || ''}`.trim()

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white p-8 print:p-0 font-sans" dir="rtl">
            {/* Action Bar - Hidden in Print */}
            <div className="max-w-[210mm] mx-auto mb-8 flex items-center justify-between print:hidden">
                <Link href="/admin/finance/quotations">
                    <Button variant="outline">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        عودة للقائمة
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded border border-yellow-200 text-sm text-yellow-800">
                        <span>💡 يمكنك تعديل السعر بالضغط عليه أدناه</span>
                    </div>
                    <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Printer className="ml-2 h-4 w-4" />
                        طباعة / حفظ كملف PDF
                    </Button>
                </div>
            </div>

            {/* A4 Page Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none min-h-[297mm] p-[10mm] relative text-black">

                {/* Header Section */}
                <div className="mb-6">
                    <div className="bg-gray-400 text-black text-center py-2 text-2xl font-bold mb-1 border-2 border-black">
                        عرض أسعار ومواصفات
                    </div>
                    <div className="border-b-2 border-black pb-1 mb-1 flex justify-between text-sm font-bold">
                        <div className="w-1/3 text-right">شركة: {quotation.customer.company || '............................................'}</div>
                        <div className="w-1/3 text-center">التاريخ: {formatDate(quotation.issueDate)}</div>
                        <div className="w-1/3 text-left">............................................ :Company</div>
                    </div>
                    <div className="border-b-2 border-black pb-1 flex justify-between text-sm font-bold">
                        <div className="w-1/3 text-right">السيد: {quotation.customer.name}</div>
                        <div className="w-1/3 text-center">الصلاحية: حتى {formatDate(quotation.validUntil)}</div>
                        <div className="w-1/3 text-left">............................................ :Mr</div>
                    </div>
                    <div className="text-center text-xs mt-2 font-medium px-8">
                        تتشرف شركة الحمد للاستيراد الموزع المعتمد لشركة أم أم جروب للصناعة والتجارة العالمية (أم تي أي) الوكيل الحصري للعلامة التجارية تاتا موتورز بجمهورية مصر العربية، بتقديم العرض التالي لشركتكم الموقرة:
                    </div>
                </div>

                {/* Vehicle Title */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold font-serif" style={{ fontFamily: 'Times New Roman, serif' }}>
                        {vehicleTitle}
                    </h1>
                </div>

                {/* Vehicle Image */}
                {quotation.vehicle?.images && quotation.vehicle.images.length > 0 ? (
                    <div className="mb-6 flex justify-center h-[250px] items-center">
                        <img
                            src={quotation.vehicle.images[0].imageUrl || quotation.vehicle.images[0].url}
                            alt="Vehicle"
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                ) : (
                    <div className="mb-6 h-[200px] flex items-center justify-center border border-dashed border-gray-300 text-gray-400">
                        صورة السيارة غير متوفرة
                    </div>
                )}

                {/* Technical Specifications Table */}
                <div className="mb-6">
                    <div className="text-center text-xl font-bold mb-2 font-serif">
                        المواصفات الفنية (Technical Specifications)
                    </div>
                    <table className="w-full border-2 border-black text-sm">
                        <thead>
                            <tr className="border-b-2 border-black bg-gray-100">
                                <th className="border-l-2 border-black p-1 w-1/3 text-center">البيان</th>
                                <th className="p-1 w-2/3 text-center">المواصفات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {VEHICLE_SPEC_TEMPLATE.map((group, groupIndex) => {
                                // Find specs for this group
                                const groupSpecs = group.items.map(item => {
                                    const val = quotation.vehicle?.specifications?.find((s: any) => s.key === item.key)?.value;
                                    return val ? { label: item.label, value: val } : null;
                                }).filter(Boolean);

                                if (groupSpecs.length === 0) return null;

                                return (
                                    <>
                                        {/* Category Header */}
                                        <tr key={`cat-${groupIndex}`} className="border-b border-black bg-gray-200">
                                            <td colSpan={2} className="p-1 font-bold text-center">{group.category}</td>
                                        </tr>
                                        {/* Specs */}
                                        {groupSpecs.map((spec, index) => (
                                            <tr key={`${groupIndex}-${index}`} className="border-b border-black">
                                                <td className="border-l-2 border-black p-1 font-bold bg-gray-50 text-center">{spec!.label}</td>
                                                <td className="p-1 text-center" dir="ltr">{spec!.value}</td>
                                            </tr>
                                        ))}
                                    </>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Breaks page if needed, but keeping flow for now */}

                {/* Options Section */}
                {quotation.vehicle?.features && quotation.vehicle.features.length > 0 && (
                    <div className="mb-6 break-inside-avoid">
                        <div className="text-center text-xl font-bold mb-2 font-serif">
                            الكماليات (Options)
                        </div>
                        <table className="w-2/3 mx-auto border-2 border-black text-sm">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th className="border-l-2 border-black p-1 text-center w-3/4">البند</th>
                                    <th className="p-1 text-center w-1/4">متوفر</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotation.vehicle.features.map((feature: string, i: number) => (
                                    <tr key={i} className="border-b border-black">
                                        <td className="border-l-2 border-black p-1 text-center font-bold">{feature}</td>
                                        <td className="p-1 text-center font-serif text-lg">√</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Terms & Conditions Table */}
                <div className="mb-8 break-inside-avoid">
                    <div className="text-center text-xl font-bold mb-2 font-serif">
                        الشروط والأحكام (Terms & Conditions)
                    </div>
                    <table className="w-full border-2 border-black text-sm">
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="border-l-2 border-black p-2 font-bold bg-gray-50 text-center w-1/3">سعر الوحدة (Price per unit)</td>
                                <td className="p-2 text-center font-bold text-xl">
                                    <input
                                        type="text"
                                        value={isEditingPrice ? editablePrice : formatCurrency(editablePrice)}
                                        onFocus={() => {
                                            setIsEditingPrice(true)
                                            setEditablePrice(editablePrice.replace(/[^\d.]/g, ''))
                                        }}
                                        onBlur={() => setIsEditingPrice(false)}
                                        onChange={(e) => setEditablePrice(e.target.value)}
                                        className="w-full text-center bg-transparent border-none focus:ring-0 p-0 font-bold"
                                    />
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="border-l-2 border-black p-2 font-bold bg-gray-50 text-center">مدة التوريد (Delivery period)</td>
                                <td className="p-2 text-center">تسليم فوري (Immediate Delivery)</td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="border-l-2 border-black p-2 font-bold bg-gray-50 text-center">الضمان (Warranty)</td>
                                <td className="p-2 text-center">3 سنوات أو 100,000 كم أيهما أقرب (3 Years or 100,000 km)</td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="border-l-2 border-black p-2 font-bold bg-gray-50 text-center">محطات الخدمة (Service Stations)</td>
                                <td className="p-2 text-center text-xs">
                                    العاشر من رمضان، السلام، أسوان والإسكندرية + ٢٤/٧ سيارة خدمة متنقلة<br />
                                    (10th of Ramadan, El-Salam, Aswan & Alexandria + 24/7 Mobile Service Van)
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="border-l-2 border-black p-2 font-bold bg-gray-50 text-center">نظام الدفع (Payment terms)</td>
                                <td className="p-2 text-center">
                                    نقدا او شيك مصرفى بكامل القيمة عند الاستلام (Cash or Bank check in full amount on delivery)
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
          input {
             border: none !important;
             background: transparent !important;
          }
        }
      `}</style>
        </div>
    )
}
