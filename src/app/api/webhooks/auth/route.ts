import { NextRequest, NextResponse } from "next/server";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-webhook-signature");
  
  if (!WEBHOOK_SECRET || signature !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { event, data } = await req.json();

  switch (event) {
    case "user.created":
      console.log("User created:", data.userId);
      break;
    case "user.login":
      console.log("User logged in:", data.userId);
      break;
    case "session.created":
      console.log("Session created:", data.sessionId);
      break;
    default:
      console.log("Unknown event:", event);
  }

  return NextResponse.json({ received: true });
}
