const { execSync } = require('child_process');

const isCI = process.env.CI === 'true' || process.env.VERCEL === '1';
const shouldSkip = process.env.PRISMA_SKIP_POSTINSTALL === 'true';

const run = (command) => execSync(command, { stdio: 'inherit' });
const prisma = (args, { allowFailure = false } = {}) => {
  try {
    run(`npx prisma ${args}`);
    return true;
  } catch (error) {
    if (allowFailure) {
      console.warn(`Prisma command failed but was skipped in CI: ${error.message}`);
      return false;
    }

    throw error;
  }
};

if (shouldSkip) {
  console.log('PRISMA_SKIP_POSTINSTALL is set; skipping Prisma setup.');
  process.exit(0);
}

if (isCI) {
  console.log('CI environment detected; running Prisma generate only.');

  const generated = prisma('generate', { allowFailure: true });

  if (generated) {
    console.log('Skipped Prisma db push and seed to avoid database changes during CI builds.');
  } else {
    console.warn('Prisma generate failed in CI; continuing without blocking the build.');
  }
} else {
  console.log('Local environment detected; running full Prisma setup.');
  prisma('generate');
  prisma('db push --accept-data-loss');
  prisma('db seed');
}
