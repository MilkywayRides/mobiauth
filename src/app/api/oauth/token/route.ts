import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifySecret, generateAccessToken, generateRefreshToken } from "@/lib/oauth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { grant_type, code, client_id, client_secret, refresh_token } = await req.json();

  if (!client_id || !client_secret) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  const client = await prisma.oAuthClient.findUnique({
    where: { clientId: client_id },
  });

  if (!client || !client.active || !verifySecret(client_secret, client.clientSecret)) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  if (grant_type === "authorization_code") {
    if (!code) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const authCode = await prisma.oAuthToken.findUnique({
      where: { accessToken: code },
    });

    if (!authCode || authCode.clientId !== client_id || authCode.expiresAt < new Date()) {
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }

    await prisma.oAuthToken.delete({ where: { accessToken: code } });

    const accessToken = generateAccessToken();
    const refreshTokenValue = generateRefreshToken();

    await prisma.oAuthToken.create({
      data: {
        accessToken,
        refreshToken: refreshTokenValue,
        clientId: client_id,
        userId: authCode.userId,
        scopes: authCode.scopes,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      token_type: "Bearer",
      expires_in: 3600,
      scope: authCode.scopes.join(" "),
    });
  }

  if (grant_type === "refresh_token") {
    if (!refresh_token) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const token = await prisma.oAuthToken.findUnique({
      where: { refreshToken: refresh_token },
    });

    if (!token || token.clientId !== client_id) {
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }

    await prisma.oAuthToken.delete({ where: { refreshToken: refresh_token } });

    const accessToken = generateAccessToken();
    const newRefreshToken = generateRefreshToken();

    await prisma.oAuthToken.create({
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        clientId: client_id,
        userId: token.userId,
        scopes: token.scopes,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      access_token: accessToken,
      refresh_token: newRefreshToken,
      token_type: "Bearer",
      expires_in: 3600,
    });
  }

  return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
}
