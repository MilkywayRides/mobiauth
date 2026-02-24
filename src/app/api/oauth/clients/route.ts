import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { generateClientCredentials, hashSecret } from "@/lib/oauth";
import {
  buildAdvancedConfig,
  normalizeRedirectUris,
  normalizeScopes,
  normalizeWebsite,
} from "@/lib/oauth-config";

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

  try {
    const { name, description, logo, website, redirectUris, scopes, advanced } = await req.json();

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const normalizedRedirectUris = normalizeRedirectUris(redirectUris);
    const normalizedScopes = normalizeScopes(scopes);
    const normalizedWebsite = normalizeWebsite(website);
    const advancedConfig = buildAdvancedConfig(advanced, normalizedRedirectUris);

    const { clientId, clientSecret } = generateClientCredentials();

    const client = await prisma.oAuthClient.create({
      data: {
        clientId,
        clientSecret: hashSecret(clientSecret),
        name: name.trim(),
        description: typeof description === "string" ? description.trim() : null,
        logo: typeof logo === "string" ? logo.trim() : null,
        website: normalizedWebsite,
        redirectUris: normalizedRedirectUris,
        scopes: normalizedScopes,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      client: {
        id: client.id,
        clientId: client.clientId,
        clientSecret,
        name: client.name,
        redirectUris: client.redirectUris,
        scopes: client.scopes,
        advanced: advancedConfig,
      },
      warning: "Save the client secret now. You won't be able to see it again.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create client" },
      { status: 400 }
    );
  }
}
