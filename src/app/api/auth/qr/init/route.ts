import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateQrToken } from "@/lib/qr";
import { checkRateLimit, qrRateLimiter } from "@/lib/rate-limit";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        const { allowed, retryAfter } = await checkRateLimit(qrRateLimiter, ip);
        if (!allowed) {
            return NextResponse.json(
                { error: "Too many requests", retryAfter },
                { status: 429 }
            );
        }

        const { token, signature, nonce, expiresAt } = generateQrToken();

        await prisma.qrLoginToken.create({
            data: {
                token,
                nonce,
                expiresAt,
                status: "pending",
                ipAddress: ip,
                userAgent: req.headers.get("user-agent") || undefined,
            },
        });

        return NextResponse.json({
            token,
            signature,
            nonce,
            expiresAt: expiresAt.toISOString(),
            qrData: JSON.stringify({ token, signature, expiresAt: expiresAt.toISOString() }),
        });
    } catch (error) {
        console.error("[QR Init] Error:", error);
        return NextResponse.json({ error: "Failed to initialize QR login" }, { status: 500 });
    }
}
