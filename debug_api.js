const fetch = require('node-fetch');

async function debugAPI() {
  try {
    console.log('Debugging API...');
    
    // Test login first
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@alhamdcars.com',
        password: 'admin123'
      })
    });
    
    const loginText = await loginResponse.text();
    console.log('Login response status:', loginResponse.status);
    console.log('Login response text:', loginText.substring(0, 200));
    
    if (!loginResponse.ok) {
      console.log('Login failed');
      return;
    }
    
    const loginData = JSON.parse(loginText);
    
    // Test with curl-like debugging
    console.log('\nTesting with Bearer token...');
    
    const testResponse = await fetch('http://localhost:3000/api/inventory/items', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const testText = await testResponse.text();
    console.log('Test response status:', testResponse.status);
    console.log('Test response headers:', Object.fromEntries(testResponse.headers));
    console.log('Test response text (first 500 chars):', testText.substring(0, 500));
    
  } catch (error) {
    console.error('Debug error:', error.message);
  }
}

debugAPI();