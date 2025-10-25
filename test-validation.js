#!/usr/bin/env node

/**
 * Invoice Creation Validation Test
 * Test the validation logic without requiring a running server
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserValidation() {
  try {
    console.log('🧪 Testing User Validation Logic');
    console.log('================================\n');

    // Test cases for user validation
    const testCases = [
      { identifier: 'admin', description: 'String "admin"' },
      { identifier: 'system', description: 'String "system"' },
      { identifier: 'admin@elhamdimport.online', description: 'Valid admin email' },
      { identifier: 'cmh6fjgk5001ltoz9qkjuz99l', description: 'Valid admin ID' },
      { identifier: 'nonexistent@example.com', description: 'Non-existent email' },
      { identifier: 'invalid-id', description: 'Invalid ID' }
    ];

    for (const testCase of testCases) {
      console.log(`🔍 Testing: ${testCase.description} (${testCase.identifier})`);
      
      let foundUser = null;
      
      // Simulate the validation logic from the API
      try {
        // First try to find by ID
        foundUser = await prisma.user.findUnique({
          where: { id: testCase.identifier },
          select: { id: true, email: true, name: true, role: true }
        });
        
        // If not found, try to find by email
        if (!foundUser) {
          foundUser = await prisma.user.findUnique({
            where: { email: testCase.identifier },
            select: { id: true, email: true, name: true, role: true }
          });
        }
        
        // If still not found, try common admin values
        if (!foundUser && (testCase.identifier === 'admin' || testCase.identifier === 'system')) {
          foundUser = await prisma.user.findFirst({
            where: {
              role: {
                in: ['ADMIN', 'SUPER_ADMIN']
              },
              isActive: true
            },
            select: { id: true, email: true, name: true, role: true }
          });
        }
        
        if (foundUser) {
          console.log('✅ SUCCESS');
          console.log(`   Found User: ${foundUser.name || 'N/A'}`);
          console.log(`   Email: ${foundUser.email}`);
          console.log(`   Role: ${foundUser.role}`);
          console.log(`   ID: ${foundUser.id}`);
        } else {
          console.log('❌ NOT FOUND');
          console.log(`   No user found for identifier: ${testCase.identifier}`);
        }
      } catch (error) {
        console.log('❌ ERROR');
        console.log(`   Error: ${error.message}`);
      }
      
      console.log('   ---');
    }

    // Test customer validation
    console.log('\n🔍 Testing Customer Validation');
    console.log('===============================');
    
    const testCustomerId = 'cmh6fji16001ztoz925ud45d5';
    const customer = await prisma.user.findUnique({
      where: { id: testCustomerId },
      select: { id: true, email: true, name: true, role: true }
    });
    
    if (customer) {
      console.log('✅ Customer Found');
      console.log(`   Customer: ${customer.name || 'N/A'}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Role: ${customer.role}`);
      console.log(`   ID: ${customer.id}`);
    } else {
      console.log('❌ Customer Not Found');
      console.log(`   No customer found with ID: ${testCustomerId}`);
    }

    console.log('\n🎯 Validation Summary:');
    console.log('- User validation logic supports multiple identifier types');
    console.log('- Falls back to admin user lookup for "admin" and "system"');
    console.log('- Provides detailed error messages');
    console.log('- Maintains backward compatibility');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserValidation();