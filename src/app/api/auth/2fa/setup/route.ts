import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = speakeasy.generateSecret({
    name: `AuthPlatform (${session.user.email})`,
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: secret.base32 },
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  return NextResponse.json({
    secret: secret.base32,
    qrCode,
  });
}
