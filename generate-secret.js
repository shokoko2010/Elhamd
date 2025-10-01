#!/usr/bin/env node

// Generate a secure secret for NextAuth
const crypto = require('crypto');

function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

console.log('🔐 Generated NextAuth Secret:');
console.log(generateSecret());
console.log('\n📝 Copy this secret and use it for your NEXTAUTH_SECRET environment variable');