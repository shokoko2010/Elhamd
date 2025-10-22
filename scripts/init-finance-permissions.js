const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeFinancePermissions() {
  try {
    console.log('=== INITIALIZING FINANCE PERMISSIONS ===');
    
    // Define all finance permissions
    const financePermissions = [
      // Invoice permissions
      'finance.invoices.view',
      'finance.invoices.create',
      'finance.invoices.edit',
      'finance.invoices.delete',
      'finance.invoices.approve',
      'finance.invoices.send',
      'finance.invoices.download',
      
      // Quote permissions
      'finance.quotes.manage',
      'finance.quotes.approve',
      'finance.quotes.convert',
      
      // Payment permissions
      'finance.payments.manage',
      'finance.payments.process_offline',
      'finance.payments.view_history',
      'finance.payments.refund',
      
      // Tax settings permissions
      'finance.tax.manage',
      
      // Reports permissions
      'finance.reports.view',
      'finance.export.data',
      
      // Dashboard permissions
      'finance.dashboard.access',
      'finance.overview.view'
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
      !p.name.includes('tax.manage') &&
      !p.name.includes('refund')
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
      p.name.includes('dashboard') ||
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

    console.log('\n=== FINANCE PERMISSIONS INITIALIZATION COMPLETE ===');
    
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
initializeFinancePermissions()
  .then(() => {
    console.log('Finance permissions initialization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });