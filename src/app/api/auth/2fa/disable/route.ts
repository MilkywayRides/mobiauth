import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$executeRaw`
    UPDATE "user"
    SET
      "twoFactorEnabled" = FALSE,
      "twoFactorSecret" = NULL,
      "backupCodes" = ARRAY[]::text[]
    WHERE "id" = ${session.user.id}
  `;

  return NextResponse.json({ success: true });
}
