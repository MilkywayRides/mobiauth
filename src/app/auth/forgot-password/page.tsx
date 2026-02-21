"use client";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Forgot password?</CardTitle>
                        <CardDescription>
                            No worries, we&apos;ll send you reset instructions
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <ForgotPasswordForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
