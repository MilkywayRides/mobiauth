import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyNonce, isTokenExpired } from "@/lib/qr";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Sign a cookie value the same way Better Auth / better-call does,
 * so that `ctx.getSignedCookie()` will recognize it.
 *
 * Format: encodeURIComponent(value + "." + base64(HMAC-SHA-256(value, secret)))
 */
async function signCookieValue(value: string, secret: string): Promise<string> {
    const key = await globalThis.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signature = await globalThis.crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(value)
    );
    const base64Sig = btoa(String.fromCharCode(...new Uint8Array(signature)));
    return encodeURIComponent(`${value}.${base64Sig}`);
}

export async function POST(req: NextRequest) {
    try {
        const { token, nonce } = await req.json();

        if (!token || !nonce) {
            return NextResponse.json({ error: "Missing token or nonce" }, { status: 400 });
        }

        // Find the QR token — must be in "confirmed" status
        const qrToken = await prisma.qrLoginToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!qrToken) {
            return NextResponse.json({ error: "Invalid token" }, { status: 404 });
        }

        if (qrToken.status !== "confirmed") {
            return NextResponse.json({ error: "Token not confirmed" }, { status: 400 });
        }

        if (!qrToken.userId || !qrToken.user) {
            return NextResponse.json({ error: "No user linked to token" }, { status: 400 });
        }

        if (isTokenExpired(qrToken.expiresAt)) {
            await prisma.qrLoginToken.update({
                where: { id: qrToken.id },
                data: { status: "expired" },
            });
            return NextResponse.json({ error: "Token expired" }, { status: 410 });
        }

        // Verify browser nonce — ensures only the browser that initiated the QR can complete login
        if (!verifyNonce(qrToken.nonce, nonce)) {
            return NextResponse.json({ error: "Invalid nonce" }, { status: 403 });
        }

        // Atomically mark as used (prevents replay)
        const updated = await prisma.qrLoginToken.updateMany({
            where: {
                id: qrToken.id,
                status: "confirmed",
            },
            data: { status: "used" },
        });

        if (updated.count === 0) {
            return NextResponse.json({ error: "Token already used" }, { status: 409 });
        }

        // Create session in the database
        const sessionToken = crypto.randomBytes(32).toString("hex");
        const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await prisma.session.create({
            data: {
                userId: qrToken.userId,
                token: sessionToken,
                expiresAt: sessionExpiresAt,
                ipAddress: req.headers.get("x-forwarded-for") || "unknown",
                userAgent: req.headers.get("user-agent") || "unknown",
            },
        });

        const response = NextResponse.json({
            success: true,
            user: {
                id: qrToken.user.id,
                name: qrToken.user.name,
                email: qrToken.user.email,
            },
        });

        // Sign the cookie value using the EXACT same HMAC-SHA-256 method that Better Auth uses
        // (via better-call's setSignedCookie). Without this signing, getSignedCookie() returns null.
        const secret = process.env.BETTER_AUTH_SECRET || "";
        const isProduction = process.env.NODE_ENV === "production";
        const cookieName = isProduction ? "__Secure-auth.session_token" : "auth.session_token";
        const signedValue = await signCookieValue(sessionToken, secret);

        // Set the cookie manually via Set-Cookie header (since NextResponse.cookies.set
        // doesn't support the signed cookie format Better Auth expects)
        const maxAge = 60 * 60 * 24 * 7; // 7 days in seconds
        let cookieStr = `${cookieName}=${signedValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
        if (isProduction) {
            cookieStr += "; Secure";
        }
        response.headers.append("Set-Cookie", cookieStr);

        return response;
    } catch (error) {
        console.error("[QR Login] Error:", error);
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
}
