const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const user = await prisma.user.update({
      where: { email: 'admin@alhamdcars.com' },
      data: {
        password: hashedPassword,
        isActive: true
      }
    });
    
    console.log('Admin password reset successfully:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    });
    
    console.log('You can now login with:');
    console.log('Email: admin@alhamdcars.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();