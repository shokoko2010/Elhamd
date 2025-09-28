const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Check if admin@alhamdcars.com exists
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@alhamdcars.com' }
    });
    
    if (!admin) {
      console.log('ERROR: admin@alhamdcars.com not found in database');
      return;
    }
    
    console.log('Admin user found:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive,
      hasPassword: !!admin.password
    });
    
    // Test password verification
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, admin.password);
    console.log('Password verification for admin@alhamdcars.com:', isPasswordValid ? 'SUCCESS' : 'FAILED');
    
    // Check other admin user
    const admin2 = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (admin2) {
      console.log('Second admin user found:', {
        id: admin2.id,
        email: admin2.email,
        name: admin2.name,
        role: admin2.role,
        isActive: admin2.isActive
      });
      
      const isPasswordValid2 = await bcrypt.compare(testPassword, admin2.password);
      console.log('Password verification for admin@example.com:', isPasswordValid2 ? 'SUCCESS' : 'FAILED');
    }
    
    console.log('Authentication test completed successfully!');
    
  } catch (error) {
    console.error('Error during authentication test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();