import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateCrossAppToken, decryptPayload } from "@/lib/oauth";

const prisma = new PrismaClient();
const MASTER_KEY = process.env.CROSS_APP_MASTER_KEY;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("x-master-key");
  
  if (!MASTER_KEY || authHeader !== MASTER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, appId } = await req.json();

  if (!email || !appId) {
    return NextResponse.json({ error: "Email and appId required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, image: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = generateCrossAppToken(user.id, appId);

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    },
    expiresIn: 300,
  });
}
