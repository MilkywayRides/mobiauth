const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function generateClientId() {
  return `client_${crypto.randomBytes(16).toString('hex')}`;
}

function generateClientSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function hashSecret(secret) {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

async function setupOAuthClient() {
  try {
    const adminUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' }
    });

    if (!adminUser) {
      console.error('No user found. Please create a user first.');
      process.exit(1);
    }

    const clientId = generateClientId();
    const clientSecret = generateClientSecret();
    const hashedSecret = hashSecret(clientSecret);

    const client = await prisma.oAuthClient.create({
      data: {
        clientId,
        clientSecret: hashedSecret,
        name: 'Demo App',
        description: 'OAuth client for the demo application',
        redirectUris: ['http://localhost:3001/api/auth/callback/mobiauth'],
        scopes: ['openid', 'profile', 'email'],
        userId: adminUser.id,
        active: true
      }
    });

    console.log('\n✅ OAuth Client Created Successfully!\n');
    console.log('Client ID:', clientId);
    console.log('Client Secret:', clientSecret);
    console.log('\nUpdate your demoapp/.env.local with:');
    console.log(`OAUTH_CLIENT_ID=${clientId}`);
    console.log(`OAUTH_CLIENT_SECRET=${clientSecret}`);
    console.log('\n⚠️  Save the client secret now. You won\'t be able to see it again.');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupOAuthClient();
