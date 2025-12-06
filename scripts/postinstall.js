const { execSync } = require('child_process');

const isCI = process.env.CI === 'true' || process.env.VERCEL === '1';
const shouldSkip = process.env.PRISMA_SKIP_POSTINSTALL === 'true';

const run = (command) => execSync(command, { stdio: 'inherit' });
const prisma = (args) => run(`npx prisma ${args}`);

if (shouldSkip) {
  console.log('PRISMA_SKIP_POSTINSTALL is set; skipping Prisma setup.');
  process.exit(0);
}

if (isCI) {
  console.log('CI environment detected; running Prisma generate only.');
  prisma('generate');
  console.log('Skipped Prisma db push and seed to avoid database changes during CI builds.');
} else {
  console.log('Local environment detected; running full Prisma setup.');
  prisma('generate');
  prisma('db push --accept-data-loss');
  prisma('db seed');
}
