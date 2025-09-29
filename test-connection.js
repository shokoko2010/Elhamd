const { Client } = require('pg');

// Test different connection configurations
const connectionConfigs = [
  {
    name: 'Standard Connection',
    connectionString: 'postgresql://bitcstcp_vercel:%40E%5E.RPy%3D9pUM@business126.web-hosting.com:5432/bitcstcp_Elhamd'
  },
  {
    name: 'SSL Required',
    connectionString: 'postgresql://bitcstcp_vercel:%40E%5E.RPy%3D9pUM@business126.web-hosting.com:5432/bitcstcp_Elhamd?sslmode=require'
  },
  {
    name: 'SSL Preferred',
    connectionString: 'postgresql://bitcstcp_vercel:%40E%5E.RPy%3D9pUM@business126.web-hosting.com:5432/bitcstcp_Elhamd?sslmode=prefer'
  },
  {
    name: 'No SSL',
    connectionString: 'postgresql://bitcstcp_vercel:%40E%5E.RPy%3D9pUM@business126.web-hosting.com:5432/bitcstcp_Elhamd?sslmode=disable'
  }
];

async function testConnections() {
  console.log('🔍 Testing PostgreSQL Connections to Namecheap\n');
  
  for (const config of connectionConfigs) {
    console.log(`📡 Testing: ${config.name}`);
    console.log(`🔗 Connection: ${config.connectionString}`);
    
    const client = new Client({
      connectionString: config.connectionString
    });
    
    try {
      await client.connect();
      console.log('✅ Connection successful!');
      
      // Test a simple query
      const result = await client.query('SELECT version()');
      console.log(`📊 PostgreSQL Version: ${result.rows[0].version}`);
      
      await client.end();
      console.log('🔌 Connection closed\n');
      
      // If successful, return the working configuration
      return config;
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('🔌 Connection closed\n');
      await client.end().catch(() => {});
    }
  }
  
  console.log('🚨 All connection attempts failed!');
  console.log('\n💡 Troubleshooting Tips:');
  console.log('1. Check if PostgreSQL is running on Namecheap');
  console.log('2. Verify remote access is enabled');
  console.log('3. Contact Namecheap support to allow Vercel IPs');
  console.log('4. Consider using a different database provider\n');
  
  return null;
}

// Alternative database providers if Namecheap doesn't work
function suggestAlternatives() {
  console.log('🔄 Alternative Database Providers:\n');
  
  console.log('1. Vercel Postgres (Recommended):');
  console.log('   - Seamless Vercel integration');
  console.log('   - Automatic scaling');
  console.log('   - Built-in backups\n');
  
  console.log('2. Supabase (Free Tier Available):');
  console.log('   - postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres');
  console.log('   - Real-time capabilities');
  console.log('   - Great performance\n');
  
  console.log('3. Neon (Serverless PostgreSQL):');
  console.log('   - postgresql://[USER]:[PASSWORD]@[HOST].neon.tech:5432/[DATABASE]');
  console.log('   - Serverless scaling');
  console.log('   - Cost-effective\n');
}

// Run the test
testConnections().then(workingConfig => {
  if (workingConfig) {
    console.log('🎉 Working Configuration Found!');
    console.log('Use this DATABASE_URL in Vercel:');
    console.log(workingConfig.connectionString);
  } else {
    suggestAlternatives();
  }
}).catch(error => {
  console.error('💥 Test failed:', error);
  suggestAlternatives();
});