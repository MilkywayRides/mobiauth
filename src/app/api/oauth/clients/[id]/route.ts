import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { active } = (await req.json()) as { active?: boolean };

  if (typeof active !== "boolean") {
    return NextResponse.json({ error: "Invalid active value" }, { status: 400 });
  }

  const updated = await prisma.oAuthClient.updateMany({
    where: { id, userId: session.user.id },
    data: { active },
  });

  if (!updated.count) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const deleted = await prisma.oAuthClient.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (!deleted.count) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
