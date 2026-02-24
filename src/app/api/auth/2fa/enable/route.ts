import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import speakeasy from "speakeasy";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = (await req.json()) as { token?: string };
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const userRows = await prisma.$queryRaw<Array<{ twoFactorSecret: string | null }>>`
    SELECT "twoFactorSecret"
    FROM "user"
    WHERE "id" = ${session.user.id}
    LIMIT 1
  `;

  const twoFactorSecret = userRows[0]?.twoFactorSecret;
  if (!twoFactorSecret) {
    return NextResponse.json({ error: "2FA not set up" }, { status: 400 });
  }

  const verified = speakeasy.totp.verify({
    secret: twoFactorSecret,
    encoding: "base32",
    token,
  });

  if (!verified) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const backupCodes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );

  await prisma.$executeRaw`
    UPDATE "user"
    SET
      "twoFactorEnabled" = TRUE,
      "backupCodes" = ${backupCodes}::text[]
    WHERE "id" = ${session.user.id}
  `;

  return NextResponse.json({
    success: true,
    backupCodes,
  });
}
