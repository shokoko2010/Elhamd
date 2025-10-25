#!/usr/bin/env node

/**
 * Database Debug Script
 * Check users and invoices data to understand the "user not found" error
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugDatabase() {
  try {
    console.log('🔍 Database Debug - Checking Users and Invoices');
    console.log('==============================================\n');

    // Check all users
    console.log('📋 All Users in Database:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    users.forEach(user => {
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name || 'N/A'}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.isActive}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log('  ---');
    });

    console.log(`\nTotal users found: ${users.length}\n`);

    // Check recent invoices
    console.log('📄 Recent Invoices:');
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        customerId: true,
        createdBy: true,
        status: true,
        issueDate: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    invoices.forEach(invoice => {
      console.log(`  Invoice ID: ${invoice.id}`);
      console.log(`  Number: ${invoice.invoiceNumber}`);
      console.log(`  Customer ID: ${invoice.customerId}`);
      console.log(`  Created By: ${invoice.createdBy}`);
      console.log(`  Status: ${invoice.status}`);
      console.log(`  Created: ${invoice.createdAt}`);
      console.log('  ---');
    });

    console.log(`\nTotal invoices found: ${invoices.length}\n`);

    // Check if createdBy users exist
    console.log('🔍 Checking createdBy users existence:');
    for (const invoice of invoices) {
      if (invoice.createdBy) {
        const creator = await prisma.user.findUnique({
          where: { id: invoice.createdBy },
          select: { id: true, email: true, name: true, role: true }
        });
        
        console.log(`  Invoice ${invoice.invoiceNumber}:`);
        console.log(`    Creator ID: ${invoice.createdBy}`);
        console.log(`    Creator exists: ${creator ? 'YES' : 'NO'}`);
        if (creator) {
          console.log(`    Creator email: ${creator.email}`);
          console.log(`    Creator name: ${creator.name || 'N/A'}`);
          console.log(`    Creator role: ${creator.role}`);
        }
        console.log('  ---');
      }
    }

    // Check admin users specifically
    console.log('\n👑 Admin Users:');
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true
      }
    });

    adminUsers.forEach(admin => {
      console.log(`  Admin ID: ${admin.id}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Name: ${admin.name || 'N/A'}`);
      console.log(`  Active: ${admin.isActive}`);
      console.log('  ---');
    });

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found! Creating default admin...');
      
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const defaultAdmin = await prisma.user.create({
        data: {
          email: 'admin@elhamdimport.com',
          password: hashedPassword,
          name: 'Default Admin',
          role: 'ADMIN',
          isActive: true,
          segment: 'CUSTOMER',
          status: 'active'
        }
      });

      console.log('✅ Default admin created:');
      console.log(`  ID: ${defaultAdmin.id}`);
      console.log(`  Email: ${defaultAdmin.email}`);
      console.log(`  Password: admin123`);
    }

    console.log('\n🎯 Debug Summary:');
    console.log(`- Total users: ${users.length}`);
    console.log(`- Admin users: ${adminUsers.length}`);
    console.log(`- Recent invoices: ${invoices.length}`);
    console.log('- All createdBy users checked');

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase();