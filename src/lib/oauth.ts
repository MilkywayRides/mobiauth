import crypto from "crypto";

const ENCRYPTION_KEY = process.env.CROSS_APP_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const ALGORITHM = "aes-256-gcm";

export function generateClientCredentials() {
  const clientId = `client_${crypto.randomBytes(16).toString("hex")}`;
  const clientSecret = `secret_${crypto.randomBytes(32).toString("hex")}`;
  return { clientId, clientSecret };
}

export function generateApiKey() {
  return `sk_${crypto.randomBytes(32).toString("hex")}`;
}

export function generateAccessToken() {
  return `at_${crypto.randomBytes(32).toString("hex")}`;
}

export function generateRefreshToken() {
  return `rt_${crypto.randomBytes(32).toString("hex")}`;
}

export function hashSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export function verifySecret(secret: string, hash: string): boolean {
  return hashSecret(secret) === hash;
}

export function encryptPayload(data: object): string {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), "hex");
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptPayload(encrypted: string): unknown {
  const buffer = Buffer.from(encrypted, "base64");
  const iv = buffer.subarray(0, 16);
  const authTag = buffer.subarray(16, 32);
  const data = buffer.subarray(32);
  
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(data),
    decipher.final(),
  ]);
  
  return JSON.parse(decrypted.toString("utf8"));
}

export function generateCrossAppToken(userId: string, appId: string): string {
  const payload = {
    userId,
    appId,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString("hex"),
  };
  return encryptPayload(payload);
}

export function verifyCrossAppToken(token: string): { userId: string; appId: string } | null {
  try {
    const payload = decryptPayload(token);

    if (!payload || typeof payload !== "object") return null;

    const tokenData = payload as { userId?: unknown; appId?: unknown; timestamp?: unknown };
    if (typeof tokenData.userId !== "string" || typeof tokenData.appId !== "string" || typeof tokenData.timestamp !== "number") {
      return null;
    }

    const age = Date.now() - tokenData.timestamp;
    if (age > 5 * 60 * 1000) return null; // 5 min expiry

    return { userId: tokenData.userId, appId: tokenData.appId };
  } catch {
    return null;
  }
}

export const AVAILABLE_SCOPES = {
  "openid": "OpenID Connect",
  "profile": "Access basic profile information",
  "email": "Access email address",
  "read:user": "Read user data",
  "write:user": "Update user data",
  "admin:users": "Access all users (admin only)",
} as const;

export type Scope = keyof typeof AVAILABLE_SCOPES;
