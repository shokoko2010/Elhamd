import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@elhamd.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true
      }
    });

    console.log('Admin user created successfully:', admin.email);
    console.log('Login credentials:');
    console.log('Email: admin@elhamd.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Setup admin error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();