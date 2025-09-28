const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to update (excluding already updated ones)
const filesToUpdate = [
  '/home/z/my-project/src/app/api/warranty-claims/route.ts',
  '/home/z/my-project/src/app/api/search/suggestions/route.ts',
  '/home/z/my-project/src/app/api/search/analytics/route.ts',
  '/home/z/my-project/src/app/api/search/advanced/route.ts',
  '/home/z/my-project/src/app/api/warranties/route.ts',
  '/home/z/my-project/src/app/api/reports/overview/route.ts',
  '/home/z/my-project/src/app/api/reports/financial/route.ts',
  '/home/z/my-project/src/app/api/reports/customers/route.ts',
  '/home/z/my-project/src/app/api/hr/leave-requests/route.ts',
  '/home/z/my-project/src/app/api/hr/payroll/route.ts',
  '/home/z/my-project/src/app/api/hr/employees/route.ts',
  '/home/z/my-project/src/app/api/calendar/route.ts',
  '/home/z/my-project/src/app/api/calendar/data/route.ts',
  '/home/z/my-project/src/app/api/calendar/[id]/route.ts',
  '/home/z/my-project/src/app/api/insurance/payments/route.ts',
  '/home/z/my-project/src/app/api/calendar/available-slots/route.ts',
  '/home/z/my-project/src/app/api/calendar/stats/route.ts',
  '/home/z/my-project/src/app/api/dashboard/notifications/route.ts',
  '/home/z/my-project/src/app/api/dashboard/bookings/route.ts',
  '/home/z/my-project/src/app/api/dashboard/notifications/[id]/route.ts',
  '/home/z/my-project/src/app/api/dashboard/bookings/[id]/route.ts',
  '/home/z/my-project/src/app/api/dashboard/profile/security/route.ts',
  '/home/z/my-project/src/app/api/dashboard/profile/notifications/route.ts',
  '/home/z/my-project/src/app/api/bookings/[id]/cancel/route.ts',
  '/home/z/my-project/src/app/api/contracts/route.ts',
  '/home/z/my-project/src/app/api/finance/consolidated/route.ts',
  '/home/z/my-project/src/app/api/finance/quotations/route.ts',
  '/home/z/my-project/src/app/api/finance/quotations/[id]/route.ts',
  '/home/z/my-project/src/app/api/finance/quotations/[id]/convert-to-invoice/route.ts',
  '/home/z/my-project/src/app/api/finance/quotations/[id]/send/route.ts',
  '/home/z/my-project/src/app/api/performance/achievements/route.ts',
  '/home/z/my-project/src/app/api/performance/route.ts',
  '/home/z/my-project/src/app/api/performance/insights/route.ts',
  '/home/z/my-project/src/app/api/performance/rankings/route.ts',
  '/home/z/my-project/src/app/api/finance/quotations/[id]/download/route.ts',
  '/home/z/my-project/src/app/api/maintenance/schedules/route.ts',
  '/home/z/my-project/src/app/api/about/values/route.ts',
  '/home/z/my-project/src/app/api/about/timeline/route.ts',
  '/home/z/my-project/src/app/api/about/features/route.ts',
  '/home/z/my-project/src/app/api/about/stats/route.ts',
  '/home/z/my-project/src/app/api/employee/users/[id]/status/route.ts',
  '/home/z/my-project/src/app/api/employee/users/[id]/route.ts',
  '/home/z/my-project/src/app/api/maintenance/reminders/route.ts',
  '/home/z/my-project/src/app/api/maintenance/parts/route.ts',
  '/home/z/my-project/src/app/api/maintenance/records/route.ts',
  '/home/z/my-project/src/app/api/employee/orders/route.ts',
  '/home/z/my-project/src/app/api/employee/invoices/route.ts',
  '/home/z/my-project/src/app/api/employee/cars/route.ts',
  '/home/z/my-project/src/app/api/employee/cars/[id]/route.ts',
  '/home/z/my-project/src/app/api/employee/invoices/[id]/route.ts',
  '/home/z/my-project/src/app/api/employee/orders/[id]/route.ts',
  '/home/z/my-project/src/app/api/employee/dashboard/tasks/[id]/route.ts',
  '/home/z/my-project/src/app/api/employee/invoices/[id]/pay/route.ts',
  '/home/z/my-project/src/app/api/employee/invoices/[id]/send/route.ts',
  '/home/z/my-project/src/app/api/employee/orders/[id]/status/route.ts',
  '/home/z/my-project/src/app/api/service-items/route.ts',
  '/home/z/my-project/src/app/api/crm/segments/route.ts',
  '/home/z/my-project/src/app/api/contact-info/route.ts',
  '/home/z/my-project/src/app/api/marketing-sales/leads/route.ts',
  '/home/z/my-project/src/app/api/marketing-sales/targets/route.ts',
  '/home/z/my-project/src/app/api/marketing-sales/campaigns/route.ts',
  '/home/z/my-project/src/app/api/marketing-sales/stats/route.ts',
  '/home/z/my-project/src/app/api/company-info/route.ts',
  '/home/z/my-project/src/app/api/commerce/reviews/route.ts',
  '/home/z/my-project/src/app/api/commerce/orders/route.ts',
  '/home/z/my-project/src/app/api/commerce/products/route.ts',
  '/home/z/my-project/src/app/api/commerce/promotions/route.ts',
  '/home/z/my-project/src/app/api/commerce/reviews/[id]/route.ts',
  '/home/z/my-project/src/app/api/tasks/route.ts',
  '/home/z/my-project/src/app/api/tasks/bulk/route.ts',
  '/home/z/my-project/src/app/api/tasks/[id]/route.ts',
  '/home/z/my-project/src/app/api/tasks/stats/route.ts',
  '/home/z/my-project/src/app/api/commerce/settings/route.ts',
  '/home/z/my-project/src/app/api/branches/transfers/route.ts',
  '/home/z/my-project/src/app/api/branches/transfers/[id]/route.ts',
  '/home/z/my-project/src/app/api/customer-service/stats/route.ts',
  '/home/z/my-project/src/app/api/branches/transfers/approvals/route.ts',
  '/home/z/my-project/src/app/api/branches/budgets/[id]/route.ts',
  '/home/z/my-project/src/app/api/customer-service/complaints/route.ts',
  '/home/z/my-project/src/app/api/branches/budgets/alerts/route.ts',
  '/home/z/my-project/src/app/api/customer-service/tickets/route.ts',
  '/home/z/my-project/src/app/api/customer-service/evaluations/route.ts',
  '/home/z/my-project/src/app/api/tasks/[id]/comments/route.ts',
  '/home/z/my-project/src/app/api/branches/permissions/route.ts',
  '/home/z/my-project/src/app/api/branches/permissions/[id]/route.ts',
  '/home/z/my-project/src/app/api/accounting/journal-entries/route.ts',
  '/home/z/my-project/src/app/api/accounting/accounts/route.ts',
  '/home/z/my-project/src/app/api/admin/settings/route.ts'
];

console.log('Starting to update API files to use Unified Auth...');

filesToUpdate.forEach((filePath, index) => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace NextAuth imports with Unified Auth imports
      content = content.replace(
        /import.*getServerSession.*from\s+['"]next-auth['"]\s*\n/g, ''
      );
      content = content.replace(
        /import.*authOptions.*from\s+['"]@\/lib\/auth[^'"]*['"]\s*\n/g, ''
      );
      
      // Add Unified Auth import
      if (!content.includes('from \'@/lib/unified-auth\'')) {
        content = content.replace(
          /import.*db.*from\s+['"]@\/lib\/db['"]\s*\n/,
          `import { requireUnifiedAuth } from '@/lib/unified-auth'\n$&`
        );
      }
      
      // Replace authentication pattern - simpler approach
      content = content.replace(
        /const session = await getServerSession\(authOptions\)/g,
        'const user = await requireUnifiedAuth(request)'
      );
      
      content = content.replace(
        /if \(!session\)/g,
        'if (!user)'
      );
      
      content = content.replace(
        /session\.user\.id/g,
        'user.id'
      );
      
      content = content.replace(
        /session\.user\?\.id/g,
        'user.id'
      );
      
      content = content.replace(
        /const user = await db\.user\.findUnique\(\{\s*where: \{ email: session\.user\?\.email as string \}\s*\}\)/g,
        '// User already available from requireUnifiedAuth'
      );
      
      // Write back the updated content
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`❌ File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log('✅ API files update completed!');