const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFinanceAccess() {
  try {
    console.log('=== TESTING FINANCE ACCESS ===');
    
    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    console.log(`✓ Found admin user: ${adminUser.email}`);
    
    // Check finance permissions
    const financePermissions = adminUser.permissions.filter(up => 
      up.permission.category === 'FINANCIAL_MANAGEMENT'
    );

    console.log(`✓ Admin user has ${financePermissions.length} finance permissions:`);
    financePermissions.forEach(up => {
      console.log(`  - ${up.permission.name}`);
    });

    // Check specific required permissions
    const requiredPermissions = [
      'view_invoices',
      'create_invoices',
      'edit_invoices',
      'delete_invoices',
      'manage_quotations',
      'manage_payments',
      'view_payment_history',
      'access_finance_dashboard',
      'view_financial_overview'
    ];

    console.log('\n=== CHECKING REQUIRED PERMISSIONS ===');
    const userPermissionNames = financePermissions.map(up => up.permission.name);
    
    for (const required of requiredPermissions) {
      const hasPermission = userPermissionNames.includes(required);
      console.log(`${hasPermission ? '✓' : '❌'} ${required}`);
    }

    // Test branch manager access
    const branchManager = await prisma.user.findFirst({
      where: { role: 'BRANCH_MANAGER' },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (branchManager) {
      console.log(`\n✓ Found branch manager: ${branchManager.email}`);
      
      const managerFinancePermissions = branchManager.permissions.filter(up => 
        up.permission.category === 'FINANCIAL_MANAGEMENT'
      );

      console.log(`✓ Branch manager has ${managerFinancePermissions.length} finance permissions`);
      
      // Check if branch manager has limited access (no delete permissions)
      const hasDeletePermissions = managerFinancePermissions.some(up => 
        up.permission.name.includes('delete')
      );
      
      console.log(`${!hasDeletePermissions ? '✓' : '❌'} Branch manager correctly limited (no delete permissions)`);
    }

    // Test staff access
    const staffUser = await prisma.user.findFirst({
      where: { role: 'STAFF' },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (staffUser) {
      console.log(`\n✓ Found staff user: ${staffUser.email}`);
      
      const staffFinancePermissions = staffUser.permissions.filter(up => 
        up.permission.category === 'FINANCIAL_MANAGEMENT'
      );

      console.log(`✓ Staff user has ${staffFinancePermissions.length} finance permissions`);
      
      // Check if staff has only view permissions
      const hasEditPermissions = staffFinancePermissions.some(up => 
        up.permission.name.includes('create') || 
        up.permission.name.includes('edit') || 
        up.permission.name.includes('delete')
      );
      
      console.log(`${!hasEditPermissions ? '✓' : '❌'} Staff correctly limited (view-only permissions)`);
    }

    console.log('\n=== FINANCE ACCESS TEST COMPLETE ===');

  } catch (error) {
    console.error('Error testing finance access:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFinanceAccess();