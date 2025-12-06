const { execSync } = require('child_process');

const isCI = process.env.CI === 'true' || process.env.VERCEL === '1';

if (isCI) {
  console.log('CI environment detected; running Prisma generate only.');
  execSync('prisma generate', { stdio: 'inherit' });
  console.log('Skipped Prisma db push and seed to avoid database changes during CI builds.');
} else {
  console.log('Local environment detected; running full Prisma setup.');
  execSync('prisma generate', { stdio: 'inherit' });
  execSync('prisma db push --accept-data-loss', { stdio: 'inherit' });
  execSync('prisma db seed', { stdio: 'inherit' });
}
