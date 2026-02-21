import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify session belongs to user
        const targetSession = await prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!targetSession || targetSession.userId !== session.user.id) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Delete session
        await prisma.session.delete({
            where: { id: sessionId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Terminate Session] Error:", error);
        return NextResponse.json({ error: "Failed to terminate session" }, { status: 500 });
    }
}
