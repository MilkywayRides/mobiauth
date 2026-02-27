import { NextRequest, NextResponse } from "next/server"

// OAuth Authorization endpoint
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get("client_id")
  const redirectUri = searchParams.get("redirect_uri")
  const state = searchParams.get("state")
  const scope = searchParams.get("scope") || "profile email"

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  // Fetch app details from main app database
  const appRes = await fetch(`http://localhost:3001/api/oauth/apps/verify?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`)
  
  if (!appRes.ok) {
    return NextResponse.json({ error: "Invalid client_id or redirect_uri" }, { status: 400 })
  }

  const app = await appRes.json()

  // Check if user is logged in
  const sessionCookie = req.cookies.get("better-auth.session_token")

  if (!sessionCookie) {
    // Redirect to login with return URL
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("returnTo", req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Show consent page
  const consentUrl = new URL("/oauth/consent", req.url)
  consentUrl.searchParams.set("client_id", clientId)
  consentUrl.searchParams.set("redirect_uri", redirectUri)
  consentUrl.searchParams.set("state", state || "")
  consentUrl.searchParams.set("scope", scope)
  consentUrl.searchParams.set("app_name", app.name)

  return NextResponse.redirect(consentUrl)
}
