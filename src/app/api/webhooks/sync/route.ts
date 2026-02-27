import { NextRequest, NextResponse } from "next/server"

const MAIN_APP_URL = process.env.MAIN_APP_URL || "http://localhost:3001"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, user } = body

    // Sync user to main app on login/signup
    if (event === "user.signedIn" || event === "user.created") {
      await fetch(`${MAIN_APP_URL}/api/webhooks/user-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": process.env.WEBHOOK_SECRET || "secret",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}
