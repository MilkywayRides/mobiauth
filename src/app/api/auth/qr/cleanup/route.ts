import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
    try {
        const result = await prisma.qrLoginToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { status: "used" },
                    { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
                ]
            }
        });

        return NextResponse.json({ deleted: result.count });
    } catch (error) {
        console.error("[QR Cleanup] Error:", error);
        return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
    }
}
