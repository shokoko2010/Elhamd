import { redirect } from 'next/navigation'

export default function FinanceQuotationCreateRedirectPage() {
  redirect('/admin/finance/quotations?mode=create')
}
