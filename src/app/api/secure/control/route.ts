import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  decryptEnvelope,
  encryptEnvelope,
  type EncryptedEnvelope,
} from "@/lib/secure-control";

const prisma = new PrismaClient();

type ControlRequest =
  | { action: "health" }
  | { action: "export_full_state"; includeAuditLogs?: boolean; limit?: number };

function isControlRequest(input: unknown): input is ControlRequest {
  if (!input || typeof input !== "object") return false;
  const value = input as Record<string, unknown>;
  return value.action === "health" || value.action === "export_full_state";
}

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const controlToken = req.headers.get("x-control-token");
  const expectedToken = process.env.CONTROL_SERVICE_TOKEN;

  if (!expectedToken || !controlToken || controlToken !== expectedToken) {
    return unauthorized();
  }

  try {
    const envelope = (await req.json()) as EncryptedEnvelope;
    const payload = decryptEnvelope<unknown>(envelope);

    if (!isControlRequest(payload)) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    if (payload.action === "health") {
      return NextResponse.json(
        encryptEnvelope(
          { ok: true, service: "auth-control", timestamp: new Date().toISOString() },
          envelope.nonce
        )
      );
    }

    const limit = Math.min(Math.max(payload.limit ?? 500, 1), 5000);

    const [users, sessions, oauthClients, apiKeys, oauthAuthorizations, oauthTokens, auditLogs] =
      await Promise.all([
        prisma.user.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            banned: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.session.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            userId: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
            expiresAt: true,
          },
        }),
        prisma.oAuthClient.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            clientId: true,
            name: true,
            description: true,
            website: true,
            redirectUris: true,
            scopes: true,
            userId: true,
            active: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.apiKey.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            userId: true,
            scopes: true,
            rateLimit: true,
            active: true,
            lastUsedAt: true,
            expiresAt: true,
            createdAt: true,
          },
        }),
        prisma.oAuthAuthorization.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.oAuthToken.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            clientId: true,
            userId: true,
            scopes: true,
            expiresAt: true,
            createdAt: true,
          },
        }),
        payload.includeAuditLogs
          ? prisma.auditLog.findMany({
              take: limit,
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                userId: true,
                action: true,
                ipAddress: true,
                userAgent: true,
                metadata: true,
                createdAt: true,
              },
            })
          : Promise.resolve([]),
      ]);

    return NextResponse.json(
      encryptEnvelope(
        {
          exportedAt: new Date().toISOString(),
          limit,
          users,
          sessions,
          oauthClients,
          oauthAuthorizations,
          oauthTokens,
          apiKeys,
          auditLogs,
        },
        envelope.nonce
      )
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "invalid_envelope" },
      { status: 400 }
    );
  }
}
