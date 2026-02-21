import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, phoneNumber } = await req.json();
    
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Link email/password to existing phone account
    // Update user with email and password
    
    return NextResponse.json({ success: true, user: session.user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Account linking failed" },
      { status: 400 }
    );
  }
}
