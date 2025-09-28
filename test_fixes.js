const http = require('http');

// Test functions
function testFavicon() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/favicon.ico',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log('✅ Favicon test:');
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      resolve();
    });

    req.on('error', (err) => {
      console.log('❌ Favicon test failed:', err.message);
      resolve();
    });

    req.end();
  });
}

function testPublicAPIs() {
  const publicEndpoints = [
    '/api/health',
    '/api/vehicles',
    '/api/service-types',
    '/api/company-info',
    '/api/service-items',
    '/api/about/stats',
    '/api/sliders'
  ];

  return Promise.all(publicEndpoints.map(endpoint => {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: 'GET'
      };

      const req = http.request(options, (res) => {
        console.log(`✅ ${endpoint}: ${res.statusCode}`);
        resolve();
      });

      req.on('error', (err) => {
        console.log(`❌ ${endpoint}: ${err.message}`);
        resolve();
      });

      req.end();
    });
  }));
}

async function runTests() {
  console.log('🧪 Testing fixes...\n');
  
  await testFavicon();
  console.log('');
  
  await testPublicAPIs();
  console.log('');
  
  console.log('✅ All tests completed!');
}

runTests();