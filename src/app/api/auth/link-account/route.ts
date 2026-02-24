import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, phoneNumber } = (await req.json()) as {
      email?: string;
      password?: string;
      phoneNumber?: string;
    };

    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { error: "Either email or phone number is required" },
        { status: 400 }
      );
    }

    if (email && !password) {
      return NextResponse.json(
        { error: "Password is required when linking an email" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, user: session.user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Account linking failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
