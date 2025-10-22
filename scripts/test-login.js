const axios = require('axios');

async function testLogin() {
  try {
    console.log('=== TESTING LOGIN ===');
    
    const loginData = {
      email: 'admin@elhamdimport.online',
      password: 'admin123456'
    };
    
    // Test login to the actual site
    const response = await axios.post('https://elhamdimport.com/api/auth/callback/credentials', loginData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      maxRedirects: 5,
      validateStatus: () => true // Accept any status code
    });
    
    console.log('Login response status:', response.status);
    console.log('Login response headers:', response.headers['set-cookie']);
    
    // Test finance page access
    const cookies = response.headers['set-cookie'] || [];
    const cookieString = cookies.join('; ');
    
    const financeResponse = await axios.get('https://elhamdimport.com/admin/finance', {
      headers: {
        'Cookie': cookieString
      },
      validateStatus: () => true
    });
    
    console.log('Finance page status:', financeResponse.status);
    
    if (financeResponse.status === 200) {
      console.log('✅ SUCCESS: Finance page is accessible!');
    } else {
      console.log('❌ FAILED: Finance page returned', financeResponse.status);
      console.log('Response content:', financeResponse.data.substring(0, 200));
    }
    
  } catch (error) {
    console.error('Login test failed:', error.message);
  }
}

testLogin();