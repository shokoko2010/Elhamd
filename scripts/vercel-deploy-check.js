// Vercel Deployment Health Check Script
// Run this after deployment to check if everything is working

const healthChecks = [
  {
    name: 'Basic Health Check',
    url: 'https://elhamdimport.com/api/health',
    expectedStatus: 200
  },
  {
    name: 'Database Connection',
    url: 'https://elhamdimport.com/api/debug/database',
    expectedStatus: 200
  },
  {
    name: 'Vercel Health Check',
    url: 'https://elhamdimport.com/api/debug/vercel-health',
    expectedStatus: 200
  },
  {
    name: 'Public API Test',
    url: 'https://elhamdimport.com/api/public/site-settings',
    expectedStatus: 200
  },
  {
    name: 'Vehicles API Test',
    url: 'https://elhamdimport.com/api/vehicles?limit=1',
    expectedStatus: 200
  }
]

async function runHealthChecks() {
  console.log('🔍 Running Vercel deployment health checks...\n')
  
  let allPassed = true
  
  for (const check of healthChecks) {
    try {
      console.log(`📡 Testing ${check.name}...`)
      
      const response = await fetch(check.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Vercel-Health-Check/1.0'
        }
      })
      
      const status = response.status === check.expectedStatus ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${check.name} - Status: ${response.status}`)
      
      if (response.status !== check.expectedStatus) {
        allPassed = false
        try {
          const errorText = await response.text()
          console.log(`   Error: ${errorText.substring(0, 200)}...`)
        } catch (e) {
          console.log('   Could not read error response')
        }
      } else {
        try {
          const data = await response.json()
          if (data.status || data.message) {
            console.log(`   Response: ${data.status || data.message}`)
          }
        } catch (e) {
          // Not JSON, that's okay
        }
      }
      
    } catch (error) {
      console.log(`❌ FAIL ${check.name} - Network Error: ${error.message}`)
      allPassed = false
    }
    
    console.log('') // Empty line for readability
  }
  
  if (allPassed) {
    console.log('🎉 All health checks passed! Your deployment is healthy.')
  } else {
    console.log('⚠️  Some health checks failed. Please check the errors above.')
    console.log('\n🔧 Common fixes:')
    console.log('1. Check environment variables in Vercel dashboard')
    console.log('2. Ensure DATABASE_URL is correctly set')
    console.log('3. Run database migrations if needed')
    console.log('4. Check Vercel function logs for detailed errors')
  }
}

// Run if called directly
if (require.main === module) {
  runHealthChecks().catch(console.error)
}

module.exports = { runHealthChecks }