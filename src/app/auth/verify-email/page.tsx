"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading"
    );

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        async function verify() {
            try {
                const res = await authClient.verifyEmail({ query: { token: token! } });
                if (res.error) {
                    setStatus("error");
                } else {
                    setStatus("success");
                }
            } catch {
                setStatus("error");
            }
        }

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Email Verification</CardTitle>
                        <CardDescription>
                            Verifying your email address
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="text-center space-y-4 py-4">
                            {status === "loading" && (
                                <>
                                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                        Verifying your email...
                                    </p>
                                </>
                            )}

                            {status === "success" && (
                                <>
                                    <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                                    <div>
                                        <h3 className="text-lg font-semibold">Email verified!</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Your email has been successfully verified.
                                        </p>
                                    </div>
                                    <Link href="/dashboard">
                                        <Button>Go to Dashboard</Button>
                                    </Link>
                                </>
                            )}

                            {status === "error" && (
                                <>
                                    <XCircle className="h-12 w-12 mx-auto text-destructive" />
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Verification failed
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            The verification link is invalid or has expired.
                                        </p>
                                    </div>
                                    <Link href="/auth/login">
                                        <Button variant="outline">Back to Login</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
