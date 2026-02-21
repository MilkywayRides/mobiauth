import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const QR_TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function generateQrToken(): {
    token: string;
    signature: string;
    nonce: string;
    expiresAt: Date;
} {
    const token = uuidv4();
    const nonce = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + QR_TOKEN_EXPIRY_MS);
    const signature = signToken(token, expiresAt);

    return { token, signature, nonce, expiresAt };
}

export function signToken(token: string, expiresAt: Date): string {
    const secret = process.env.BETTER_AUTH_SECRET || "";
    const data = `${token}:${expiresAt.toISOString()}`;
    return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function verifyTokenSignature(
    token: string,
    expiresAt: Date,
    signature: string
): boolean {
    const expected = signToken(token, expiresAt);
    try {
        return crypto.timingSafeEqual(
            Buffer.from(expected, "hex"),
            Buffer.from(signature, "hex")
        );
    } catch {
        return false;
    }
}

export function isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
}

export function verifyNonce(storedNonce: string, providedNonce: string): boolean {
    try {
        return crypto.timingSafeEqual(
            Buffer.from(storedNonce, "hex"),
            Buffer.from(providedNonce, "hex")
        );
    } catch {
        return false;
    }
}
