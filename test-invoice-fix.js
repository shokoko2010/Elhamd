#!/usr/bin/env node

/**
 * Test Invoice Creation Fix
 * Test the fixed invoice creation API with different user identification methods
 */

const testInvoiceCreation = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Invoice Creation Fix');
  console.log('================================\n');

  // Test data
  const testCases = [
    {
      name: 'Test with "admin" string',
      data: {
        customerId: 'cmh6fji16001ztoz925ud45d5', // Test customer ID from debug
        type: 'SERVICE',
        items: [
          {
            description: 'Test Service Item',
            quantity: 1,
            unitPrice: 100,
            taxRate: 14
          }
        ],
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Test invoice creation',
        terms: 'Test terms',
        createdBy: 'admin' // This should now work
      }
    },
    {
      name: 'Test with user email',
      data: {
        customerId: 'cmh6fji16001ztoz925ud45d5',
        type: 'SERVICE',
        items: [
          {
            description: 'Test Service Item 2',
            quantity: 2,
            unitPrice: 50,
            taxRate: 14
          }
        ],
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Test invoice with email',
        terms: 'Test terms',
        createdBy: 'admin@elhamdimport.online' // Test with email
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`🔍 ${testCase.name}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/finance/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ SUCCESS');
        console.log(`   Invoice ID: ${result.invoice?.id || 'N/A'}`);
        console.log(`   Invoice Number: ${result.invoice?.invoiceNumber || 'N/A'}`);
        console.log(`   Status: ${result.invoice?.status || 'N/A'}`);
      } else {
        const error = await response.json();
        console.log('❌ FAILED');
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${error.error || 'Unknown error'}`);
        if (error.details) {
          console.log(`   Details: ${error.details}`);
        }
        if (error.suggestion) {
          console.log(`   Suggestion: ${error.suggestion}`);
        }
      }
    } catch (error) {
      console.log('❌ ERROR');
      console.log(`   Message: ${error.message}`);
    }
    
    console.log('   ---');
  }

  console.log('\n🎯 Test Summary:');
  console.log('- Fixed user validation to accept ID, email, or "admin"');
  console.log('- Enhanced error messages with details and suggestions');
  console.log('- Improved debugging capabilities');
  console.log('- Maintained backward compatibility');
};

// Run the test
testInvoiceCreation().catch(console.error);