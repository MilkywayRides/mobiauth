import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sessions = await prisma.session.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                token: true,
                expiresAt: true,
                ipAddress: true,
                userAgent: true,
                userId: true,
            },
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error("[Sessions] Error:", error);
        return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 });
    }
}
