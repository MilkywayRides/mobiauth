import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isTokenExpired } from "@/lib/qr";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const token = req.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.json({ error: "Missing token" }, { status: 400 });
        }

        const qrToken = await prisma.qrLoginToken.findUnique({
            where: { token },
        });

        if (!qrToken) {
            return NextResponse.json({ error: "Invalid token" }, { status: 404 });
        }

        // Check expiry
        if (isTokenExpired(qrToken.expiresAt) && qrToken.status === "pending") {
            await prisma.qrLoginToken.update({
                where: { id: qrToken.id },
                data: { status: "expired" },
            });
            return NextResponse.json({ status: "expired" });
        }

        if (qrToken.status === "confirmed" && qrToken.userId) {
            // Return confirmed status — but do NOT leak the userId to the poller
            // The /qr/login route will look up the userId from the DB using the token
            return NextResponse.json({
                status: "confirmed",
            });
        }

        if (qrToken.status === "used") {
            return NextResponse.json({ status: "used" });
        }

        return NextResponse.json({
            status: qrToken.status,
            expiresAt: qrToken.expiresAt.toISOString(),
        });
    } catch (error) {
        console.error("[QR Status] Error:", error);
        return NextResponse.json({ error: "Failed to check QR status" }, { status: 500 });
    }
}
