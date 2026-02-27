import { NextRequest, NextResponse } from "next/server"

const ALLOWED_API_KEYS = process.env.ALLOWED_API_KEYS?.split(",") || []

export function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get("X-API-Key")
  
  if (!apiKey) return false
  
  return ALLOWED_API_KEYS.includes(apiKey)
}

export function apiKeyMiddleware(req: NextRequest) {
  // Skip API key check for browser requests (they use cookies)
  const userAgent = req.headers.get("user-agent") || ""
  const isBrowser = userAgent.includes("Mozilla")
  
  if (isBrowser) {
    return NextResponse.next()
  }
  
  // For API requests, validate API key
  if (!validateApiKey(req)) {
    return NextResponse.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    )
  }
  
  return NextResponse.next()
}
