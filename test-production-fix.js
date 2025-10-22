#!/usr/bin/env node

/**
 * Test script to verify the production fix
 * Run this after deployment to ensure everything works
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testEndpoint(endpoint, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`📡 Endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const status = response.status;
    const contentType = response.headers.get('content-type');
    
    console.log(`📊 Status: ${status}`);
    console.log(`📄 Content-Type: ${contentType}`);
    
    if (status === 200) {
      console.log(`✅ SUCCESS: ${description}`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED: ${description}`);
      console.log(`📝 Error: ${errorText.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${description}`);
    console.log(`📝 Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Production Fix Tests');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('=' .repeat(50));

  const tests = [
    {
      endpoint: '/api/health',
      description: 'Health Check API'
    },
    {
      endpoint: '/api/finance/payments/offline',
      description: 'Offline Payments API (GET)'
    },
    {
      endpoint: '/api/finance/invoices',
      description: 'Invoices API (GET)'
    },
    {
      endpoint: '/api/fix-database-schema',
      description: 'Database Schema Fix API (POST)',
      method: 'POST'
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const success = await testEndpoint(
      test.endpoint, 
      test.description
    );
    if (success) passed++;
  }

  console.log('\n' + '=' .repeat(50));
  console.log(`📈 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Production fix is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
    console.log('💡 You may need to run the database schema fix API.');
  }
}

// Run the tests
runTests().catch(console.error);