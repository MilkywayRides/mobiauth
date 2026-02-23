import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { decryptPayload } from "@/lib/oauth";

const prisma = new PrismaClient();
const MASTER_KEY = process.env.CROSS_APP_MASTER_KEY;

type SyncPayload =
  | { action: "createUser"; email: string; name?: string; image?: string; emailVerified?: boolean }
  | { action: "updateUser"; userId: string; name?: string; image?: string }
  | { action: "getUser"; userId?: string; email?: string };

function isSyncPayload(value: unknown): value is SyncPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return typeof payload.action === "string";
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("x-master-key");

  if (!MASTER_KEY || authHeader !== MASTER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { encryptedData } = (await req.json()) as { encryptedData?: string };

  if (!encryptedData) {
    return NextResponse.json({ error: "Encrypted data required" }, { status: 400 });
  }

  try {
    const data = decryptPayload(encryptedData);

    if (!isSyncPayload(data)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (data.action === "createUser") {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name ?? data.email,
          image: data.image,
          emailVerified: data.emailVerified || false,
        },
      });

      return NextResponse.json({ success: true, user });
    }

    if (data.action === "updateUser") {
      const user = await prisma.user.update({
        where: { id: data.userId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.image ? { image: data.image } : {}),
        },
      });

      return NextResponse.json({ success: true, user });
    }

    if (data.action === "getUser") {
      const user = await prisma.user.findUnique({
        where: data.userId ? { id: data.userId } : { email: data.email },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          emailVerified: true,
          role: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid encrypted data" }, { status: 400 });
  }
}
