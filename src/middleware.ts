import { NextRequest, NextResponse } from "next/server";

const publicRoutes = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/auth/qr-login",
    "/oauth/consent",
];

const TRUSTED_ORIGINS = process.env.TRUSTED_ORIGINS?.split(",") || [];
const ALLOWED_API_KEYS = process.env.ALLOWED_API_KEYS?.split(",") || [];

function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // For API routes - allow all for now, auth handles its own validation
    if (pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // Allow static assets
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    const sessionCookie = req.cookies.get("better-auth.session_token");

    // Redirect root to appropriate page
    if (pathname === "/") {
        if (sessionCookie) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // If accessing auth pages while logged in, redirect to dashboard
    if (isPublicRoute(pathname) && sessionCookie) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If accessing protected routes without session, redirect to login
    if (!isPublicRoute(pathname) && !sessionCookie) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("returnTo", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)",],
};
