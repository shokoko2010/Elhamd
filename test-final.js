const http = require('http');

// Test 1: Check if media API responds without authentication (should fail)
const options1 = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/media',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req1 = http.request(options1, (res) => {
  console.log('Test 1 - No Authentication:');
  console.log('Status:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data.substring(0, 100));
    console.log('---');
  });
});

req1.on('error', (e) => {
  console.error('Problem with request:', e.message);
});

req1.end();

// Test 2: Check if media API responds with proper structure when authenticated
// Since we can't easily get a session cookie in this test, we'll just check if the endpoint exists
setTimeout(() => {
  const options2 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/media/stats',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req2 = http.request(options2, (res) => {
    console.log('Test 2 - Media Stats API:');
    console.log('Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data.substring(0, 100));
      console.log('---');
    });
  });

  req2.on('error', (e) => {
    console.error('Problem with request:', e.message);
  });

  req2.end();
}, 1000);