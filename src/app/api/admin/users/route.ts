import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
  });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7);

  // Verify access token
  const oauthToken = await prisma.oAuthToken.findUnique({
    where: { accessToken: token },
    include: { client: true },
  });

  if (!oauthToken || oauthToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  // Check if token has admin scope
  if (!oauthToken.scopes.includes("admin:users")) {
    return NextResponse.json({ error: "insufficient_scope" }, { status: 403 });
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      role: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
