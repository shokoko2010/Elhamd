#!/usr/bin/env node

const http = require('http');

// Test the new consultation pages
const testPages = [
  { path: '/consultation', name: 'Consultation Page' },
  { path: '/contact-info', name: 'Contact Info Page' }
];

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '',
  method: 'GET'
};

console.log('🧪 Testing new consultation pages...\n');

testPages.forEach((page, index) => {
  options.path = page.path;
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`✅ ${page.name} (${page.path}): ${res.statusCode} OK`);
        
        // Check if the page contains expected content
        if (page.path === '/consultation' && data.includes('هل تريد الاستفسار عن سياراتنا؟')) {
          console.log(`   ✅ Contains expected Arabic content`);
        } else if (page.path === '/contact-info' && data.includes('مرحباً بكم في الحمد للسيارات')) {
          console.log(`   ✅ Contains expected Arabic content`);
        } else {
          console.log(`   ⚠️  May not contain expected content`);
        }
      } else {
        console.log(`❌ ${page.name} (${page.path}): ${res.statusCode}`);
      }
      
      if (index === testPages.length - 1) {
        console.log('\n🎉 Testing completed!');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error(`❌ Error testing ${page.name}:`, error.message);
  });
  
  req.end();
});