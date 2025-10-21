// Debug script to test API endpoints
// Run this in the browser console on the application

async function testAPIs() {
  console.log('=== API DEBUGGING START ===');
  
  // Test 1: No auth endpoint
  try {
    console.log('Testing no-auth endpoint...');
    const noAuthResponse = await fetch('/api/test/no-auth');
    const noAuthData = await noAuthResponse.json();
    console.log('No-auth test:', noAuthData);
  } catch (error) {
    console.error('No-auth test failed:', error);
  }
  
  // Test 2: Database connection
  try {
    console.log('Testing database connection...');
    const dbResponse = await fetch('/api/test/db-simple');
    const dbData = await dbResponse.json();
    console.log('DB test:', dbData);
  } catch (error) {
    console.error('DB test failed:', error);
  }
  
  // Test 3: Authentication
  try {
    console.log('Testing authentication...');
    const authResponse = await fetch('/api/test/auth');
    const authData = await authResponse.json();
    console.log('Auth test:', authData);
  } catch (error) {
    console.error('Auth test failed:', error);
  }
  
  // Test 4: Offline payment (with test data)
  try {
    console.log('Testing offline payment...');
    const paymentResponse = await fetch('/api/test/offline-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invoiceId: 'test-invoice-id',
        amount: '100',
        paymentMethod: 'CASH'
      })
    });
    const paymentData = await paymentResponse.json();
    console.log('Offline payment test:', paymentData);
  } catch (error) {
    console.error('Offline payment test failed:', error);
  }
  
  // Test 5: Invoice status (with test data)
  try {
    console.log('Testing invoice status...');
    const statusResponse = await fetch('/api/test/invoice-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invoiceId: 'test-invoice-id',
        status: 'PAID'
      })
    });
    const statusData = await statusResponse.json();
    console.log('Invoice status test:', statusData);
  } catch (error) {
    console.error('Invoice status test failed:', error);
  }
  
  console.log('=== API DEBUGGING END ===');
}

// Auto-run the test
testAPIs();

// Also make it available globally
window.testAPIs = testAPIs;