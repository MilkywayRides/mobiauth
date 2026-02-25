import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateClient() {
  const client = await prisma.oAuthClient.findFirst({
    where: { name: "Demo App" },
  });

  if (client) {
    await prisma.oAuthClient.update({
      where: { id: client.id },
      data: {
        scopes: ["openid", "profile", "email", "admin:users"],
      },
    });
    console.log("✅ Updated Demo App with admin:users scope");
  } else {
    console.log("❌ Demo App client not found");
  }

  await prisma.$disconnect();
}

updateClient();
