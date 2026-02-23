import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { idToken, phoneNumber } = (await req.json()) as {
      idToken?: string;
      phoneNumber?: string;
    };

    if (!idToken || !phoneNumber) {
      return NextResponse.json(
        { error: "idToken and phoneNumber are required" },
        { status: 400 }
      );
    }

    const session = await auth.api.signInSocial({
      body: {
        provider: "phone",
        idToken: { token: idToken },
      },
    });

    return NextResponse.json(session);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Phone verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
