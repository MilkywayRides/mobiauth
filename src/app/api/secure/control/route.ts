import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  decryptEnvelope,
  encryptEnvelope,
  type EncryptedEnvelope,
} from "@/lib/secure-control";
import { generateApiKey, generateClientCredentials, hashSecret } from "@/lib/oauth";

const prisma = new PrismaClient();

type ControlRequest =
  | { action: "health" }
  | { action: "export_full_state"; includeAuditLogs?: boolean; limit?: number }
  | { action: "list_users"; limit?: number }
  | { action: "set_user_role"; userId: string; role: string }
  | { action: "list_api_keys"; userId?: string; limit?: number }
  | {
      action: "create_api_key";
      userId: string;
      name: string;
      scopes?: string[];
      rateLimit?: number;
      expiresAt?: string;
    }
  | { action: "list_oauth_clients"; userId?: string; limit?: number }
  | {
      action: "create_oauth_client";
      userId: string;
      name: string;
      redirectUris: string[];
      scopes?: string[];
      description?: string;
      logo?: string;
      website?: string;
    };

function isControlRequest(input: unknown): input is ControlRequest {
  if (!input || typeof input !== "object") return false;
  const value = input as Record<string, unknown>;
  return typeof value.action === "string";
}

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function clampLimit(limit: number | undefined, fallback = 500) {
  return Math.min(Math.max(limit ?? fallback, 1), 5000);
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

    if (payload.action === "list_users") {
      const users = await prisma.user.findMany({
        take: clampLimit(payload.limit, 200),
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
      });

      return NextResponse.json(encryptEnvelope({ users }, envelope.nonce));
    }

    if (payload.action === "set_user_role") {
      if (!payload.userId || !payload.role) {
        return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
      }

      const user = await prisma.user.update({
        where: { id: payload.userId },
        data: { role: payload.role },
        select: { id: true, name: true, email: true, role: true, updatedAt: true },
      });

      return NextResponse.json(encryptEnvelope({ success: true, user }, envelope.nonce));
    }

    if (payload.action === "list_api_keys") {
      const apiKeys = await prisma.apiKey.findMany({
        where: payload.userId ? { userId: payload.userId } : undefined,
        take: clampLimit(payload.limit, 200),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          key: true,
          userId: true,
          scopes: true,
          rateLimit: true,
          active: true,
          lastUsedAt: true,
          expiresAt: true,
          createdAt: true,
        },
      });

      const masked = apiKeys.map((item) => ({
        ...item,
        key: `${item.key.slice(0, 12)}...${item.key.slice(-4)}`,
      }));

      return NextResponse.json(encryptEnvelope({ apiKeys: masked }, envelope.nonce));
    }

    if (payload.action === "create_api_key") {
      if (!payload.userId || !payload.name) {
        return NextResponse.json({ error: "userId and name are required" }, { status: 400 });
      }

      const key = generateApiKey();
      const apiKey = await prisma.apiKey.create({
        data: {
          key,
          name: payload.name,
          userId: payload.userId,
          scopes: payload.scopes || ["read:user"],
          rateLimit: payload.rateLimit || 1000,
          expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
        },
        select: { id: true, name: true, userId: true, scopes: true, rateLimit: true, createdAt: true },
      });

      return NextResponse.json(
        encryptEnvelope(
          {
            success: true,
            apiKey,
            plainTextKey: key,
            warning: "Save key now. It will not be returned again.",
          },
          envelope.nonce
        )
      );
    }

    if (payload.action === "list_oauth_clients") {
      const oauthClients = await prisma.oAuthClient.findMany({
        where: payload.userId ? { userId: payload.userId } : undefined,
        take: clampLimit(payload.limit, 200),
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
      });

      return NextResponse.json(encryptEnvelope({ oauthClients }, envelope.nonce));
    }

    if (payload.action === "create_oauth_client") {
      if (!payload.userId || !payload.name || !payload.redirectUris?.length) {
        return NextResponse.json(
          { error: "userId, name, and redirectUris are required" },
          { status: 400 }
        );
      }

      const { clientId, clientSecret } = generateClientCredentials();
      const client = await prisma.oAuthClient.create({
        data: {
          userId: payload.userId,
          clientId,
          clientSecret: hashSecret(clientSecret),
          name: payload.name,
          description: payload.description,
          logo: payload.logo,
          website: payload.website,
          redirectUris: payload.redirectUris,
          scopes: payload.scopes || ["profile", "email"],
        },
        select: {
          id: true,
          userId: true,
          clientId: true,
          name: true,
          redirectUris: true,
          scopes: true,
          createdAt: true,
        },
      });

      return NextResponse.json(
        encryptEnvelope(
          {
            success: true,
            oauthClient: client,
            plainTextClientSecret: clientSecret,
            warning: "Save client secret now. It will not be returned again.",
          },
          envelope.nonce
        )
      );
    }

    const limit = clampLimit(payload.limit);
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
