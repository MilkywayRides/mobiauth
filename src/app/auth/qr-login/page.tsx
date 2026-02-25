"use client";

import { QrCodeDisplay } from "@/components/auth/qr-code-display";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function QrLoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Shield className="h-6 w-6" />
                    <span className="text-xl font-bold">BlazeNeuro Auth</span>
                </div>

                <Card>
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl">QR Code Login</CardTitle>
                        <CardDescription>
                            Scan this code with your phone to sign in
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <QrCodeDisplay />
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Prefer email?{" "}
                    <Link
                        href="/auth/login"
                        className="text-foreground underline-offset-4 hover:underline font-medium"
                    >
                        Sign in with credentials
                    </Link>
                </p>
            </div>
        </div>
    );
}
