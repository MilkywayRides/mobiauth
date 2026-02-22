import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { generateClientCredentials, hashSecret } from "@/lib/oauth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await prisma.oAuthClient.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      clientId: true,
      name: true,
      description: true,
      logo: true,
      website: true,
      redirectUris: true,
      scopes: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, logo, website, redirectUris, scopes } = await req.json();

  if (!name || !redirectUris || redirectUris.length === 0) {
    return NextResponse.json({ error: "Name and redirect URIs required" }, { status: 400 });
  }

  const { clientId, clientSecret } = generateClientCredentials();

  const client = await prisma.oAuthClient.create({
    data: {
      clientId,
      clientSecret: hashSecret(clientSecret),
      name,
      description,
      logo,
      website,
      redirectUris,
      scopes: scopes || ["profile", "email"],
      userId: session.user.id,
    },
  });

  return NextResponse.json({
    client: {
      id: client.id,
      clientId: client.clientId,
      clientSecret,
      name: client.name,
    },
    warning: "Save the client secret now. You won't be able to see it again.",
  });
}
