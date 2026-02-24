import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

function parseScopes(scope: string | null): string[] {
  return (scope || "profile email")
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function validateAuthorizationRequest(
  clientId: string,
  redirectUri: string,
  requestedScopes: string[]
) {
  const client = await prisma.oAuthClient.findUnique({
    where: { clientId },
    select: {
      clientId: true,
      name: true,
      logo: true,
      website: true,
      redirectUris: true,
      scopes: true,
      active: true,
    },
  });

  if (!client || !client.active) {
    return { error: "invalid_client" as const };
  }

  if (!client.redirectUris.includes(redirectUri)) {
    return { error: "invalid_redirect_uri" as const };
  }

  const invalidScopes = requestedScopes.filter((s) => !client.scopes.includes(s));
  if (invalidScopes.length > 0) {
    return { error: "invalid_scope" as const };
  }

  return { client };
}

async function issueAuthorizationCode(userId: string, clientId: string, redirectUri: string, state: string | null, scopes: string[]) {
  const code = `code_${crypto.randomUUID()}`;
  
  await prisma.oAuthToken.create({
    data: {
      accessToken: code,
      clientId,
      userId,
      scopes,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const redirectUrl = new URL(redirectUri);
  redirectUrl.searchParams.set("code", code);
  if (state) redirectUrl.searchParams.set("state", state);
  return NextResponse.redirect(redirectUrl);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
  const scope = searchParams.get("scope") || "openid profile email";
  
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: req.headers });
  
  // Not logged in - redirect to login with return URL
  if (!session?.user) {
    const loginUrl = new URL("/auth/login", req.url);
    const returnUrl = `/api/oauth/authorize?${searchParams.toString()}`;
    loginUrl.searchParams.set("returnTo", returnUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Validate client
  const validated = await validateAuthorizationRequest(clientId, redirectUri, parseScopes(scope));
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  // Check existing authorization
  const existing = await prisma.oAuthAuthorization.findUnique({
    where: { userId_clientId: { userId: session.user.id, clientId } },
  });

  // Auto-approve if already authorized
  if (existing) {
    return await issueAuthorizationCode(session.user.id, clientId, redirectUri, state, parseScopes(scope));
  }

  // Show consent
  const consentUrl = new URL("/oauth/consent", req.url);
  consentUrl.searchParams.set("client_id", clientId);
  consentUrl.searchParams.set("redirect_uri", redirectUri);
  consentUrl.searchParams.set("scope", scope);
  if (state) consentUrl.searchParams.set("state", state);
  return NextResponse.redirect(consentUrl);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const clientId = String(formData.get("client_id") || "");
  const redirectUri = String(formData.get("redirect_uri") || "");
  const scope = String(formData.get("scope") || "openid profile email");
  const state = formData.get("state") as string | null;
  const action = String(formData.get("action") || "deny");

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const validated = await validateAuthorizationRequest(clientId, redirectUri, parseScopes(scope));
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const redirectUrl = new URL(redirectUri);

  if (action !== "allow") {
    redirectUrl.searchParams.set("error", "access_denied");
    if (state) redirectUrl.searchParams.set("state", state);
    return NextResponse.redirect(redirectUrl);
  }

  // Save authorization
  await prisma.oAuthAuthorization.upsert({
    where: { userId_clientId: { userId: session.user.id, clientId } },
    create: {
      userId: session.user.id,
      clientId,
      scopes: parseScopes(scope),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    update: {
      scopes: parseScopes(scope),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  return await issueAuthorizationCode(session.user.id, clientId, redirectUri, state, parseScopes(scope));
}
