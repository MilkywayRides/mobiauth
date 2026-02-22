import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { RateLimiterMemory } from "rate-limiter-flexible";

const prisma = new PrismaClient();
const rateLimiters = new Map<string, RateLimiterMemory>();

async function authenticateApiKey(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Missing API key" }, { status: 401 }) };
  }

  const key = authHeader.substring(7);

  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!apiKey || !apiKey.active) {
    return { error: NextResponse.json({ error: "Invalid API key" }, { status: 401 }) };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { error: NextResponse.json({ error: "API key expired" }, { status: 401 }) };
  }

  let limiter = rateLimiters.get(key);
  if (!limiter) {
    limiter = new RateLimiterMemory({
      points: apiKey.rateLimit,
      duration: 3600,
    });
    rateLimiters.set(key, limiter);
  }

  try {
    await limiter.consume(key);
  } catch {
    return { error: NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 }) };
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return { apiKey, user: apiKey.user };
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if ('error' in auth) return auth.error;

  const { user, apiKey } = auth;

  const response: Record<string, unknown> = { id: user.id };

  if (apiKey.scopes.includes("read:user") || apiKey.scopes.includes("profile")) {
    response.name = user.name;
  }

  if (apiKey.scopes.includes("read:user") || apiKey.scopes.includes("email")) {
    response.email = user.email;
  }

  return NextResponse.json(response);
}
