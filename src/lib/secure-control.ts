import crypto from "node:crypto";

const NONCE_TTL_MS = 5 * 60 * 1000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;

const usedNonces = new Map<string, number>();

function cleanupNonces(now: number) {
  for (const [nonce, expiresAt] of usedNonces.entries()) {
    if (expiresAt <= now) {
      usedNonces.delete(nonce);
    }
  }
}

function decodeKey(input: string | undefined, expectedBytes: number, keyName: string): Buffer {
  if (!input) {
    throw new Error(`${keyName} is not configured`);
  }

  const trimmed = input.trim();
  const hexBuffer = /^[0-9a-fA-F]+$/.test(trimmed) ? Buffer.from(trimmed, "hex") : null;
  if (hexBuffer && hexBuffer.length === expectedBytes) {
    return hexBuffer;
  }

  const base64Buffer = Buffer.from(trimmed, "base64");
  if (base64Buffer.length === expectedBytes) {
    return base64Buffer;
  }

  throw new Error(`${keyName} must be ${expectedBytes} bytes in hex or base64 format`);
}

function getEncryptionKey() {
  return decodeKey(process.env.CONTROL_ENCRYPTION_KEY, 32, "CONTROL_ENCRYPTION_KEY");
}

function getHmacKey() {
  return decodeKey(process.env.CONTROL_HMAC_KEY, 32, "CONTROL_HMAC_KEY");
}

export interface EncryptedEnvelope {
  timestamp: number;
  nonce: string;
  iv: string;
  tag: string;
  ciphertext: string;
  signature: string;
}

function canonicalPayload(envelope: Omit<EncryptedEnvelope, "signature">): string {
  return `${envelope.timestamp}.${envelope.nonce}.${envelope.iv}.${envelope.tag}.${envelope.ciphertext}`;
}

function signPayload(payload: string): string {
  return crypto.createHmac("sha256", getHmacKey()).update(payload).digest("hex");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyEnvelope(envelope: EncryptedEnvelope) {
  const now = Date.now();
  cleanupNonces(now);

  if (!Number.isFinite(envelope.timestamp) || Math.abs(now - envelope.timestamp) > CLOCK_SKEW_MS) {
    throw new Error("Stale or invalid timestamp");
  }

  if (!/^[a-zA-Z0-9_-]{16,128}$/.test(envelope.nonce)) {
    throw new Error("Invalid nonce format");
  }

  if (usedNonces.has(envelope.nonce)) {
    throw new Error("Replay detected");
  }

  const unsigned: Omit<EncryptedEnvelope, "signature"> = {
    timestamp: envelope.timestamp,
    nonce: envelope.nonce,
    iv: envelope.iv,
    tag: envelope.tag,
    ciphertext: envelope.ciphertext,
  };

  const expectedSignature = signPayload(canonicalPayload(unsigned));
  if (!timingSafeEqualHex(expectedSignature, envelope.signature)) {
    throw new Error("Invalid signature");
  }

  usedNonces.set(envelope.nonce, now + NONCE_TTL_MS);
}

export function decryptEnvelope<T = unknown>(envelope: EncryptedEnvelope): T {
  verifyEnvelope(envelope);

  const iv = Buffer.from(envelope.iv, "base64");
  const tag = Buffer.from(envelope.tag, "base64");
  const ciphertext = Buffer.from(envelope.ciphertext, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}

export function encryptEnvelope(data: unknown, nonce: string): EncryptedEnvelope {
  const timestamp = Date.now();
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  const unsigned: Omit<EncryptedEnvelope, "signature"> = {
    timestamp,
    nonce,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };

  return {
    ...unsigned,
    signature: signPayload(canonicalPayload(unsigned)),
  };
}
