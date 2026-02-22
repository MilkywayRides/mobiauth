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
            select: { id: true, status: true, expiresAt: true, userId: true }
        });

        if (!qrToken) {
            return NextResponse.json({ error: "Invalid token" }, { status: 404 });
        }

        if (isTokenExpired(qrToken.expiresAt)) {
            if (qrToken.status === "pending") {
                await prisma.qrLoginToken.update({
                    where: { id: qrToken.id },
                    data: { status: "expired" },
                });
            }
            return NextResponse.json({ status: "expired" }, { 
                headers: { "Cache-Control": "public, max-age=300" }
            });
        }

        if (qrToken.status === "confirmed" && qrToken.userId) {
            return NextResponse.json({ status: "confirmed" }, {
                headers: { "Cache-Control": "public, max-age=60" }
            });
        }

        if (qrToken.status === "used") {
            return NextResponse.json({ status: "used" }, {
                headers: { "Cache-Control": "public, max-age=300" }
            });
        }

        return NextResponse.json({ status: qrToken.status }, {
            headers: { "Cache-Control": "no-cache, must-revalidate" }
        });
    } catch (error) {
        console.error("[QR Status] Error:", error);
        return NextResponse.json({ error: "Failed to check QR status" }, { status: 500 });
    }
}
