const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('=== CREATING ADMIN USER FOR TESTING ===');
    
    const adminEmail = 'admin@elhamdimport.online';
    const adminPassword = 'admin123456';
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      console.log(`✓ Admin user already exists: ${adminEmail}`);
      
      // Update password to be sure
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await prisma.user.update({
        where: { email: adminEmail },
        data: { 
          password: hashedPassword,
          isActive: true,
          emailVerified: true
        }
      });
      console.log('✓ Admin password updated');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin User',
          role: 'SUPER_ADMIN',
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log(`✓ Created admin user: ${adminUser.email}`);
    }
    
    // Verify admin has finance permissions
    const adminWithPermissions = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    
    const financePermissions = adminWithPermissions.permissions.filter(up => 
      up.permission.category === 'FINANCIAL_MANAGEMENT'
    );
    
    console.log(`✓ Admin has ${financePermissions.length} finance permissions`);
    
    // Check for required permissions
    const requiredPermissions = [
      'view_invoices',
      'create_invoices', 
      'access_finance_dashboard',
      'view_financial_overview'
    ];
    
    const userPermissionNames = financePermissions.map(up => up.permission.name);
    const hasAllRequired = requiredPermissions.every(req => userPermissionNames.includes(req));
    
    console.log(`${hasAllRequired ? '✓' : '❌'} Admin has all required finance permissions`);
    
    console.log('\n=== ADMIN LOGIN DETAILS ===');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Login URL: https://elhamdimport.com/login`);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();