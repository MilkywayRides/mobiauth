import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const sessions = await prisma.session.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
    },
  });

  const loginsByDay = await prisma.session.groupBy({
    by: ["createdAt"],
    where: {
      userId: session.user.id,
      createdAt: { gte: since },
    },
    _count: true,
  });

  return NextResponse.json({
    totalLogins: sessions.length,
    sessions: sessions.slice(0, 10),
    loginsByDay: loginsByDay.map(d => ({
      date: d.createdAt.toISOString().split("T")[0],
      count: d._count,
    })),
  });
}
