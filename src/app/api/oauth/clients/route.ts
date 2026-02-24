import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { generateClientCredentials, hashSecret } from "@/lib/oauth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const clients = await prisma.oAuthClient.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { name, website, description, redirectUris } = await req.json();

  if (!name || !website || !redirectUris || redirectUris.length === 0) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { clientId, clientSecret } = generateClientCredentials();

  const client = await prisma.oAuthClient.create({
    data: {
      clientId,
      clientSecret: hashSecret(clientSecret),
      name,
      description,
      website,
      redirectUris,
      scopes: ["openid", "profile", "email"],
      userId: session.user.id,
    },
  });

  return NextResponse.json({
    id: client.id,
    clientId,
    clientSecret, // Only returned once
  });
}
