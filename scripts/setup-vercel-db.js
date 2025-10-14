const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗄️  Vercel Database Setup for Elhamd Imports');
console.log('==========================================\n');

console.log('Choose your database option:');
console.log('1. Vercel Postgres (Recommended)');
console.log('2. Supabase');
console.log('3. Neon');
console.log('4. PlanetScale');
console.log('5. Custom PostgreSQL');

rl.question('Enter your choice (1-5): ', (choice) => {
  let setupCommand;
  
  switch(choice) {
    case '1':
      console.log('\n📋 Setting up Vercel Postgres...');
      console.log('1. Go to your Vercel Dashboard');
      console.log('2. Navigate to Storage > Create Database');
      console.log('3. Select PostgreSQL');
      console.log('4. Copy the connection string');
      console.log('\n📝 After creating the database, run:');
      console.log('vercel env add DATABASE_URL');
      break;
      
    case '2':
      console.log('\n📋 Setting up Supabase...');
      console.log('1. Go to https://supabase.com');
      console.log('2. Create a new project');
      console.log('3. Go to Settings > Database');
      console.log('4. Copy the Connection string');
      console.log('\n📝 Database URL format:');
      console.log('postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres');
      break;
      
    case '3':
      console.log('\n📋 Setting up Neon...');
      console.log('1. Go to https://neon.tech');
      console.log('2. Create a new project');
      console.log('3. Copy the connection string');
      console.log('\n📝 Database URL format:');
      console.log('postgresql://[USERNAME]:[PASSWORD]@[HOSTNAME]/[DBNAME]?sslmode=require');
      break;
      
    case '4':
      console.log('\n📋 Setting up PlanetScale...');
      console.log('1. Go to https://planetscale.com');
      console.log('2. Create a new database');
      console.log('3. Create a password for the database');
      console.log('4. Copy the connection string');
      console.log('\n📝 Database URL format:');
      console.log('mysql://USERNAME:PASSWORD@HOSTNAME/DATABASE?ssl={"rejectUnauthorized":true}');
      break;
      
    case '5':
      console.log('\n📋 Custom PostgreSQL setup...');
      console.log('Make sure your PostgreSQL server is accessible from Vercel');
      console.log('Database URL format:');
      console.log('postgresql://USERNAME:PASSWORD@HOSTNAME:PORT/DATABASE?sslmode=require');
      break;
      
    default:
      console.log('❌ Invalid choice. Please run the script again.');
      rl.close();
      return;
  }
  
  console.log('\n🔧 Next steps:');
  console.log('1. Add the DATABASE_URL to Vercel environment variables:');
  console.log('   vercel env add DATABASE_URL');
  console.log('2. Generate Prisma client:');
  console.log('   npm run db:generate');
  console.log('3. Push the schema:');
  console.log('   npx prisma db push');
  console.log('4. Deploy to Vercel:');
  console.log('   vercel --prod');
  
  rl.close();
});