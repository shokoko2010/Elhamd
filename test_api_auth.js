const fetch = require('node-fetch');

async function testAPIAuth() {
  try {
    console.log('Testing API authentication...');
    
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
    
    const loginData = await loginResponse.json();
    console.log('Login response:', {
      status: loginResponse.status,
      success: loginResponse.ok,
      data: loginData
    });
    
    if (!loginResponse.ok) {
      console.log('Login failed, cannot proceed with API tests');
      return;
    }
    
    // Extract session cookie from response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Session cookie:', setCookieHeader ? 'Found' : 'Not found');
    
    // Test a protected API endpoint
    const apiResponse = await fetch('http://localhost:3000/api/inventory/items', {
      method: 'GET',
      headers: {
        'Cookie': setCookieHeader || '',
        'Content-Type': 'application/json',
      }
    });
    
    const apiData = await apiResponse.json();
    console.log('API response:', {
      endpoint: '/api/inventory/items',
      status: apiResponse.status,
      success: apiResponse.ok,
      data: apiData
    });
    
    // Test branches API
    const branchesResponse = await fetch('http://localhost:3000/api/branches', {
      method: 'GET',
      headers: {
        'Cookie': setCookieHeader || '',
        'Content-Type': 'application/json',
      }
    });
    
    const branchesData = await branchesResponse.json();
    console.log('Branches API response:', {
      endpoint: '/api/branches',
      status: branchesResponse.status,
      success: branchesResponse.ok,
      data: branchesData
    });
    
    console.log('API authentication test completed!');
    
  } catch (error) {
    console.error('Error during API authentication test:', error.message);
  }
}

testAPIAuth();