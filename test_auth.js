const fetch = require('node-fetch');

async function testAuth() {
  try {
    // Test login with admin user
    const loginResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123' // Assuming this is the password
      })
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', Object.fromEntries(loginResponse.headers));
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login response data:', loginData);
    } else {
      const errorText = await loginResponse.text();
      console.log('Login error:', errorText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuth();