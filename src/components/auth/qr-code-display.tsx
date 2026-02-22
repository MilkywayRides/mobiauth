"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, RefreshCw, CheckCircle, Smartphone, ShieldCheck } from "lucide-react";

export function QrCodeDisplay() {
    const [qrData, setQrData] = useState<string | null>(null);
    const [status, setStatus] = useState<"loading" | "pending" | "confirmed" | "logging-in" | "expired" | "error">("loading");
    const [token, setToken] = useState<string | null>(null);
    const [nonce, setNonce] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateQr = useCallback(async () => {
        setStatus("loading");
        setErrorMessage(null);
        try {
            const res = await fetch("/api/auth/qr/init", { method: "POST" });
            if (!res.ok) {
                if (res.status === 429) {
                    setErrorMessage("Too many requests. Please wait a moment.");
                    setStatus("error");
                    return;
                }
                throw new Error("Failed to generate QR code");
            }

            const data = await res.json();
            setToken(data.token);
            setNonce(data.nonce); // Store nonce for browser-binding
            setQrData(data.qrData);
            setStatus("pending");

            // Render QR code
            const QRCode = (await import("qrcode")).default;
            if (canvasRef.current) {
                await QRCode.toCanvas(canvasRef.current, data.qrData, {
                    width: 240,
                    margin: 2,
                    color: {
                        dark: "#ffffff",
                        light: "#00000000",
                    },
                });
            }
        } catch {
            setStatus("error");
            setErrorMessage("Failed to generate QR code");
        }
    }, []);

    const pollStatus = useCallback(async () => {
        if (!token || !nonce) return;

        try {
            const res = await fetch(`/api/auth/qr/status?token=${token}`);
            const data = await res.json();

            if (data.status === "confirmed") {
                setStatus("confirmed");
                if (pollRef.current) clearInterval(pollRef.current);

                // Small delay for visual feedback
                await new Promise(resolve => setTimeout(resolve, 800));
                setStatus("logging-in");

                // Create session — pass nonce to prove we're the original browser
                const loginRes = await fetch("/api/auth/qr/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, nonce }),
                    credentials: "include",
                });

                if (loginRes.ok) {
                    // Wait for cookie to be set, then redirect
                    await new Promise(resolve => setTimeout(resolve, 300));
                    window.location.href = "/dashboard";
                } else {
                    const errorData = await loginRes.json().catch(() => ({}));
                    console.error("QR login failed:", errorData);
                    setErrorMessage(errorData.error || "Login failed");
                    setStatus("error");
                }
            } else if (data.status === "expired") {
                setStatus("expired");
                if (pollRef.current) clearInterval(pollRef.current);
            } else if (data.status === "used") {
                setStatus("expired");
                setErrorMessage("This QR code has already been used");
                if (pollRef.current) clearInterval(pollRef.current);
            }
        } catch {
            // Silent poll failure — don't break the UI
        }
    }, [token, nonce]);

    useEffect(() => {
        generateQr();
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [generateQr]);

    useEffect(() => {
        if (status === "pending" && token) {
            pollRef.current = setInterval(pollStatus, 3000);
            return () => {
                if (pollRef.current) clearInterval(pollRef.current);
            };
        }
    }, [status, token, pollStatus]);

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative">
                {/* QR Code Container */}
                <div className="relative p-4 rounded-lg border bg-card">
                    {status === "loading" && (
                        <div className="w-60 h-60 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {status === "pending" && (
                        <>
                            <canvas ref={canvasRef} className="rounded-md" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="p-2 rounded-md bg-background/80">
                                    <QrCode className="h-6 w-6 text-muted-foreground" />
                                </div>
                            </div>
                        </>
                    )}

                    {status === "confirmed" && (
                        <div className="w-60 h-60 flex flex-col items-center justify-center space-y-3">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                            <p className="text-sm font-medium text-green-500">
                                Scan confirmed!
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Authenticating...
                            </p>
                        </div>
                    )}

                    {status === "logging-in" && (
                        <div className="w-60 h-60 flex flex-col items-center justify-center space-y-3">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm font-medium">
                                Signing you in...
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Redirecting to dashboard
                            </p>
                        </div>
                    )}

                    {(status === "expired" || status === "error") && (
                        <div className="w-60 h-60 flex flex-col items-center justify-center space-y-3">
                            <QrCode className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground text-center">
                                {errorMessage || (status === "expired" ? "QR code expired" : "Failed to generate")}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={generateQr}
                                className="gap-2"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Generate new code
                            </Button>
                        </div>
                    )}
                </div>

                {/* Scanning indicator */}
                {status === "pending" && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Waiting for scan...
                        </span>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="pt-4 space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-sm">
                    <Smartphone className="h-4 w-4" />
                    <span className="font-medium">Scan with your phone</span>
                </div>
                <ol className="text-xs text-muted-foreground space-y-1 text-left">
                    <li>1. Open the app on your phone</li>
                    <li>2. Go to Settings → Scan QR Code</li>
                    <li>3. Point your camera at this code</li>
                </ol>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70 pt-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>End-to-end secured</span>
                </div>
            </div>
        </div>
    );
}
