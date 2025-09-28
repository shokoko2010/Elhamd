// Development authentication helper
// This script automatically logs in the user for development purposes

const https = require('https');
const http = require('http');

async function devLogin() {
  try {
    console.log('Attempting development login...');
    
    const postData = JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/simple-auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log('✅ Development login successful!');
            console.log('User:', response.user.name);
            console.log('Role:', response.user.role);
            console.log('Token:', response.token);
            
            // Extract the cookie from the response headers
            const setCookieHeader = res.headers['set-cookie'];
            if (setCookieHeader) {
              console.log('Cookie set:', setCookieHeader[0]);
            }
          } catch (parseError) {
            console.error('❌ Error parsing response:', parseError.message);
          }
        } else {
          try {
            const error = JSON.parse(data);
            console.error('❌ Login failed:', error.message);
          } catch (parseError) {
            console.error('❌ Login failed with status:', res.statusCode);
            console.error('Response:', data);
          }
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
    });

    req.write(postData);
    req.end();
  } catch (error) {
    console.error('❌ Error during development login:', error.message);
  }
}

// Run the login
devLogin();