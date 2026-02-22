import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentSessionToken = req.cookies.get("better-auth.session_token")?.value;

  await prisma.session.deleteMany({
    where: {
      userId: session.user.id,
      token: { not: currentSessionToken },
    },
  });

  return NextResponse.json({ success: true, message: "All other sessions revoked" });
}
