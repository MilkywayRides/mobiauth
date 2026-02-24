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

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
  const prompt = searchParams.get("prompt");
  const requestedScopes = parseScopes(searchParams.get("scope"));

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const validated = await validateAuthorizationRequest(clientId, redirectUri, requestedScopes);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const existing = await prisma.oAuthAuthorization.findUnique({
    where: { userId_clientId: { userId: session.user.id, clientId } },
  });

  if (existing && prompt !== "consent") {
    const code = `code_${crypto.randomUUID()}`;
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set("code", code);
    if (state) redirectUrl.searchParams.set("state", state);

    await prisma.oAuthToken.create({
      data: {
        accessToken: code,
        clientId,
        userId: session.user.id,
        scopes: requestedScopes,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return NextResponse.redirect(redirectUrl.toString());
  }

  const consentUrl = new URL("/oauth/consent", req.url);
  consentUrl.searchParams.set("client_id", clientId);
  consentUrl.searchParams.set("redirect_uri", redirectUri);
  consentUrl.searchParams.set("scope", requestedScopes.join(" "));
  if (state) consentUrl.searchParams.set("state", state);
  return NextResponse.redirect(consentUrl.toString());
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";
  let clientId = "";
  let redirectUri = "";
  let scope = "profile email";
  let state: string | null = null;
  let action = "deny";

  if (contentType.includes("application/json")) {
    const payload = (await req.json()) as {
      client_id?: string;
      redirect_uri?: string;
      scope?: string;
      state?: string;
      action?: string;
    };
    clientId = payload.client_id || "";
    redirectUri = payload.redirect_uri || "";
    scope = payload.scope || "profile email";
    state = payload.state || null;
    action = payload.action || "deny";
  } else {
    const formData = await req.formData();
    clientId = String(formData.get("client_id") || "");
    redirectUri = String(formData.get("redirect_uri") || "");
    scope = String(formData.get("scope") || "profile email");
    state = (formData.get("state") as string | null) || null;
    action = String(formData.get("action") || "deny");
  }

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const requestedScopes = parseScopes(scope);
  const validated = await validateAuthorizationRequest(clientId, redirectUri, requestedScopes);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const redirectUrl = new URL(redirectUri);

  if (action !== "allow") {
    redirectUrl.searchParams.set("error", "access_denied");
    if (state) redirectUrl.searchParams.set("state", state);
    return NextResponse.redirect(redirectUrl.toString());
  }

  await prisma.oAuthAuthorization.upsert({
    where: { userId_clientId: { userId: session.user.id, clientId } },
    create: {
      userId: session.user.id,
      clientId,
      scopes: requestedScopes,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    update: {
      scopes: requestedScopes,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  const code = `code_${crypto.randomUUID()}`;
  await prisma.oAuthToken.create({
    data: {
      accessToken: code,
      clientId,
      userId: session.user.id,
      scopes: requestedScopes,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  redirectUrl.searchParams.set("code", code);
  if (state) redirectUrl.searchParams.set("state", state);

  return NextResponse.redirect(redirectUrl.toString());
}
