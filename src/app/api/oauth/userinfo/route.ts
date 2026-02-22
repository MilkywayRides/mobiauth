import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7);

  const oauthToken = await prisma.oAuthToken.findUnique({
    where: { accessToken: token },
    include: { client: true },
  });

  if (!oauthToken || oauthToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: oauthToken.userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const response: Record<string, unknown> = { id: user.id };

  if (oauthToken.scopes.includes("profile")) {
    response.name = user.name;
    response.image = user.image;
  }

  if (oauthToken.scopes.includes("email")) {
    response.email = user.email;
    response.email_verified = user.emailVerified;
  }

  return NextResponse.json(response);
}
