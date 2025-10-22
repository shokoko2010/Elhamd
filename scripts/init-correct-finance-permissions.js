const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeCorrectFinancePermissions() {
  try {
    console.log('=== INITIALIZING CORRECT FINANCE PERMISSIONS ===');
    
    // Define finance permissions using the correct naming convention
    const financePermissions = [
      // Basic financial permissions
      'view_financials',
      
      // Invoice permissions
      'view_invoices',
      'create_invoices',
      'edit_invoices',
      'delete_invoices',
      'approve_invoices',
      'send_invoices',
      'download_invoices',
      
      // Quote permissions
      'manage_quotations',
      'approve_quotations',
      'convert_quotations',
      
      // Payment permissions
      'manage_payments',
      'process_offline_payments',
      'view_payment_history',
      'refund_payments',
      
      // Tax settings permissions
      'manage_tax_settings',
      
      // Reports permissions
      'view_reports',
      'export_financial_data',
      
      // Dashboard permissions
      'access_finance_dashboard',
      'view_financial_overview'
    ];

    // Get or create permissions
    const createdPermissions = [];
    for (const permissionName of financePermissions) {
      const permission = await prisma.permission.upsert({
        where: { name: permissionName },
        update: {},
        create: {
          name: permissionName,
          description: `Finance permission: ${permissionName}`,
          category: 'FINANCIAL_MANAGEMENT'
        }
      });
      createdPermissions.push(permission);
      console.log(`✓ Created permission: ${permissionName}`);
    }

    // Get admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'SUPER_ADMIN' },
          { email: { contains: 'admin' } }
        ]
      }
    });

    const branchManagerUsers = await prisma.user.findMany({
      where: { role: 'BRANCH_MANAGER' }
    });

    const staffUsers = await prisma.user.findMany({
      where: { role: 'STAFF' }
    });

    console.log(`\n=== FOUND USERS ===`);
    console.log(`- Admin/Super Admin users: ${adminUsers.length}`);
    console.log(`- Branch Manager users: ${branchManagerUsers.length}`);
    console.log(`- Staff users: ${staffUsers.length}`);

    // Assign permissions to admin users (all permissions)
    console.log('\n=== ASSIGNING PERMISSIONS TO ADMIN USERS ===');
    for (const user of adminUsers) {
      for (const permission of createdPermissions) {
        await prisma.userPermission.upsert({
          where: {
            userId_permissionId: {
              userId: user.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            userId: user.id,
            permissionId: permission.id
          }
        });
      }
      console.log(`✓ Admin user ${user.email} assigned all finance permissions`);
    }

    // Assign limited permissions to branch managers
    console.log('\n=== ASSIGNING PERMISSIONS TO BRANCH MANAGERS ===');
    const branchManagerPermissions = createdPermissions.filter(p => 
      !p.name.includes('delete') && 
      !p.name.includes('manage_tax_settings') &&
      !p.name.includes('refund_payments')
    );

    for (const user of branchManagerUsers) {
      for (const permission of branchManagerPermissions) {
        await prisma.userPermission.upsert({
          where: {
            userId_permissionId: {
              userId: user.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            userId: user.id,
            permissionId: permission.id
          }
        });
      }
      console.log(`✓ Branch manager ${user.email} assigned limited finance permissions`);
    }

    // Assign read-only permissions to staff
    console.log('\n=== ASSIGNING PERMISSIONS TO STAFF ===');
    const staffPermissions = createdPermissions.filter(p => 
      p.name.includes('view') || 
      p.name.includes('download') ||
      p.name.includes('access') ||
      p.name.includes('overview')
    );

    for (const user of staffUsers) {
      for (const permission of staffPermissions) {
        await prisma.userPermission.upsert({
          where: {
            userId_permissionId: {
              userId: user.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            userId: user.id,
            permissionId: permission.id
          }
        });
      }
      console.log(`✓ Staff ${user.email} assigned read-only finance permissions`);
    }

    console.log('\n=== CORRECT FINANCE PERMISSIONS INITIALIZATION COMPLETE ===');
    
    // Summary
    const totalPermissions = await prisma.permission.count({
      where: { category: 'FINANCIAL_MANAGEMENT' }
    });
    
    const totalUserPermissions = await prisma.userPermission.count({
      where: {
        permission: {
          category: 'FINANCIAL_MANAGEMENT'
        }
      }
    });

    console.log(`Summary:`);
    console.log(`- Total finance permissions: ${totalPermissions}`);
    console.log(`- Total user-permission assignments: ${totalUserPermissions}`);
    console.log(`- Admin users with finance access: ${adminUsers.length}`);
    console.log(`- Branch managers with finance access: ${branchManagerUsers.length}`);
    console.log(`- Staff with finance access: ${staffUsers.length}`);

  } catch (error) {
    console.error('Error initializing finance permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeCorrectFinancePermissions()
  .then(() => {
    console.log('Correct finance permissions initialization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });