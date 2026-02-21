import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyTokenSignature, isTokenExpired } from "@/lib/qr";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRateLimit, qrRateLimiter } from "@/lib/rate-limit";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        // Rate limit confirm attempts
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        const { allowed, retryAfter } = await checkRateLimit(qrRateLimiter, ip);
        if (!allowed) {
            return NextResponse.json(
                { error: "Too many requests", retryAfter },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { token, signature } = body;

        if (!token || !signature) {
            return NextResponse.json({ error: "Missing token or signature" }, { status: 400 });
        }

        // Get current session (mobile user must be authenticated)
        const headersList = await headers();
        const session = await auth.api.getSession({ headers: headersList });

        if (!session) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // Find the QR token
        const qrToken = await prisma.qrLoginToken.findUnique({ where: { token } });

        if (!qrToken) {
            return NextResponse.json({ error: "Invalid token" }, { status: 404 });
        }

        if (qrToken.status !== "pending") {
            return NextResponse.json({ error: "Token already used" }, { status: 409 });
        }

        if (isTokenExpired(qrToken.expiresAt)) {
            await prisma.qrLoginToken.update({
                where: { id: qrToken.id },
                data: { status: "expired" },
            });
            return NextResponse.json({ error: "Token expired" }, { status: 410 });
        }

        // Verify signature
        if (!verifyTokenSignature(token, qrToken.expiresAt, signature)) {
            return NextResponse.json({ error: "Invalid token signature" }, { status: 403 });
        }

        // Atomically mark as confirmed and link the user (prevents race conditions)
        const updated = await prisma.qrLoginToken.updateMany({
            where: {
                id: qrToken.id,
                status: "pending", // Only confirm if still pending (atomic check)
            },
            data: {
                status: "confirmed",
                userId: session.user.id,
            },
        });

        if (updated.count === 0) {
            return NextResponse.json({ error: "Token already processed" }, { status: 409 });
        }

        return NextResponse.json({ success: true, message: "QR login confirmed" });
    } catch (error) {
        console.error("[QR Confirm] Error:", error);
        return NextResponse.json({ error: "Failed to confirm QR login" }, { status: 500 });
    }
}
