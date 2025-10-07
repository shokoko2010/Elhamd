'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InvoicesListPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main finance page with invoices tab active
    router.replace('/admin/finance?tab=invoices');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}