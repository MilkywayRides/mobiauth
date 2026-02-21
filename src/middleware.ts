import { NextRequest, NextResponse } from "next/server";

const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/auth/qr-login",
];

const adminRoutes = ["/admin"];

function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );
}

function isApiAuthRoute(pathname: string): boolean {
    return pathname.startsWith("/api/auth");
}

/*
function isAdminRoute(pathname: string): boolean {
    return adminRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );
}
*/

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow API auth routes and public routes through
    if (isApiAuthRoute(pathname) || isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // Allow static assets and Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Connect to Better Auth via cookies (Optimistic check for Edge)
    // We cannot use the database adapter here because it's not Edge compatible.
    // Real validation happens in the Server Components (Layouts/Pages).
    const sessionCookie = req.cookies.get("auth.session_token") || req.cookies.get("__Secure-auth.session_token");

    // Not authenticated → redirect to login
    if (!sessionCookie) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Admin route protection must be handled in Layout/Page (Server Components)
    // because we can't reliably fetch the user role here without DB access in Edge Runtime.

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
