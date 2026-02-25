const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySetup() {
  try {
    const client = await prisma.oAuthClient.findUnique({
      where: { clientId: 'client_aa6f2b458788b6246e9dc69d831953fc' },
      select: {
        clientId: true,
        name: true,
        active: true,
        redirectUris: true,
        scopes: true
      }
    });

    if (client) {
      console.log('✅ OAuth Client Found in Database:\n');
      console.log('Name:', client.name);
      console.log('Client ID:', client.clientId);
      console.log('Active:', client.active);
      console.log('Redirect URIs:', client.redirectUris);
      console.log('Scopes:', client.scopes);
      console.log('\n✅ Setup is complete and ready to use!');
    } else {
      console.log('❌ OAuth client not found. Please run setup-demoapp-oauth.js again.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifySetup();
