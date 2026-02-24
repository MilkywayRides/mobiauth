import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      service: "auth-system"
    });
  } catch {
    return NextResponse.json({ 
      status: "error",
      message: "Database connection failed"
    }, { status: 500 });
  }
}
