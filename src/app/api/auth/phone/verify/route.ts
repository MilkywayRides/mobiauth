import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { idToken, phoneNumber } = await req.json();
    
    // Verify Firebase token would happen here
    // For now, create/login user with phone
    
    const session = await auth.api.signInSocial({
      body: {
        provider: "phone",
        idToken,
      },
    });

    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Phone verification failed" },
      { status: 400 }
    );
  }
}
