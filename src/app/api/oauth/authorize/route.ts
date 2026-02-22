import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope") || "profile email";
  const state = searchParams.get("state");

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const client = await prisma.oAuthClient.findUnique({
    where: { clientId },
    select: { name: true, logo: true, redirectUris: true, scopes: true, active: true },
  });

  if (!client || !client.active) {
    return NextResponse.json({ error: "Invalid client" }, { status: 400 });
  }

  if (!client.redirectUris.includes(redirectUri)) {
    return NextResponse.json({ error: "Invalid redirect URI" }, { status: 400 });
  }

  const requestedScopes = scope.split(" ");
  const invalidScopes = requestedScopes.filter(s => !client.scopes.includes(s));
  if (invalidScopes.length > 0) {
    return NextResponse.json({ error: "Invalid scopes" }, { status: 400 });
  }

  const existing = await prisma.oAuthAuthorization.findUnique({
    where: { userId_clientId: { userId: session.user.id, clientId } },
  });

  if (existing) {
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

  return new NextResponse(
    `<!DOCTYPE html>
    <html>
    <head><title>Authorize ${client.name}</title></head>
    <body>
      <h1>Authorize ${client.name}</h1>
      <p>${client.name} wants to access your account</p>
      <p>Scopes: ${requestedScopes.join(", ")}</p>
      <form method="POST" action="/api/oauth/authorize">
        <input type="hidden" name="client_id" value="${clientId}" />
        <input type="hidden" name="redirect_uri" value="${redirectUri}" />
        <input type="hidden" name="scope" value="${scope}" />
        ${state ? `<input type="hidden" name="state" value="${state}" />` : ""}
        <button type="submit" name="action" value="allow">Allow</button>
        <button type="submit" name="action" value="deny">Deny</button>
      </form>
    </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const clientId = formData.get("client_id") as string;
  const redirectUri = formData.get("redirect_uri") as string;
  const scope = formData.get("scope") as string;
  const state = formData.get("state") as string | null;
  const action = formData.get("action") as string;

  if (action === "deny") {
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set("error", "access_denied");
    if (state) redirectUrl.searchParams.set("state", state);
    return NextResponse.redirect(redirectUrl.toString());
  }

  const requestedScopes = scope.split(" ");

  await prisma.oAuthAuthorization.upsert({
    where: { userId_clientId: { userId: session.user.id, clientId } },
    create: {
      userId: session.user.id,
      clientId,
      scopes: requestedScopes,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    update: { scopes: requestedScopes },
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

  const redirectUrl = new URL(redirectUri);
  redirectUrl.searchParams.set("code", code);
  if (state) redirectUrl.searchParams.set("state", state);

  return NextResponse.redirect(redirectUrl.toString());
}
