import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { generateApiKey } from "@/lib/oauth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      key: true,
      scopes: true,
      rateLimit: true,
      active: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    keys: keys.map(k => ({
      ...k,
      key: `${k.key.substring(0, 12)}...${k.key.substring(k.key.length - 4)}`,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, scopes, rateLimit, expiresAt } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const key = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      key,
      name,
      userId: session.user.id,
      scopes: scopes || ["read:user"],
      rateLimit: rateLimit || 1000,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json({
    apiKey: {
      id: apiKey.id,
      key,
      name: apiKey.name,
    },
    warning: "Save this key now. You won't be able to see it again.",
  });
}
