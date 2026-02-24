import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Delete all OAuth authorizations for this user
  await prisma.oAuthAuthorization.deleteMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
