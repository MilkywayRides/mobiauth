import { Shield } from "lucide-react";
import { SignupForm } from "@/components/signup-form";
import { Suspense } from "react";
import Link from "next/link";

export default function SignupPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Link href="/" className="flex items-center gap-2 self-center font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <Shield className="size-4" />
                    </div>
                    AuthPlatform
                </Link>
                <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
                    <SignupForm />
                </Suspense>
            </div>
        </div>
    );
}
