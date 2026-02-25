# AI Integration Guide - BlazeNeuro Auth

## Overview
This is a centralized authentication service built with Next.js and Better Auth. Other applications can integrate with this service for OAuth-based authentication.

## Architecture
- **Auth Service URL**: `https://auth.blazeneuro.com`
- **Framework**: Next.js 15 with App Router
- **Auth Library**: Better Auth
- **Database**: PostgreSQL (Supabase)
- **OAuth Providers**: Google, GitHub

## Environment Variables Required

### Auth Service (This App)
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Better Auth
BETTER_AUTH_SECRET="random-32-char-string"
BETTER_AUTH_URL="https://auth.blazeneuro.com"
NEXT_PUBLIC_APP_URL="https://auth.blazeneuro.com"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email (Optional)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@blazeneuro.com"
```

## OAuth Provider Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/Select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://auth.blazeneuro.com/api/auth/callback/google`
6. Add authorized JavaScript origins:
   - `https://auth.blazeneuro.com`

### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL:
   - `https://auth.blazeneuro.com/api/auth/callback/github`
4. Set Homepage URL:
   - `https://auth.blazeneuro.com`

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/sign-in/social` - Initiate OAuth flow
- `GET /api/auth/callback/{provider}` - OAuth callback handler
- `POST /api/auth/sign-up/email` - Email signup
- `POST /api/auth/sign-in/email` - Email login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

### Password Management
- `POST /api/auth/forget-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

## Integrating OAuth in Another App

### Step 1: Install Better Auth Client
```bash
npm install better-auth
```

### Step 2: Create Auth Client
```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "https://auth.blazeneuro.com",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Step 3: Environment Variables in Client App
```bash
NEXT_PUBLIC_AUTH_URL="https://auth.blazeneuro.com"
```

### Step 4: Implement Social Login Button
```typescript
import { signIn } from "@/lib/auth-client";

function LoginButton() {
    const handleGoogleLogin = async () => {
        await signIn.social({
            provider: "google",
            callbackURL: "/dashboard", // Your app's redirect URL
        });
    };

    return (
        <button onClick={handleGoogleLogin}>
            Sign in with Google
        </button>
    );
}
```

### Step 5: Check Session Status
```typescript
"use client";
import { useSession } from "@/lib/auth-client";

function Profile() {
    const { data: session, isPending } = useSession();

    if (isPending) return <div>Loading...</div>;
    if (!session) return <div>Not logged in</div>;

    return <div>Welcome, {session.user.name}</div>;
}
```

### Step 6: Protected Routes (Middleware)
```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const sessionCookie = req.cookies.get("better-auth.session_token");

    if (!sessionCookie && req.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
```

## CORS Configuration

The auth service has CORS enabled for cross-origin requests. Allowed origins are configured via `NEXT_PUBLIC_APP_URL`.

To allow your app to make requests:
1. Ensure your app's domain is whitelisted in the auth service
2. Requests will include credentials (cookies) automatically

## Session Management

### Cookie-based Sessions
- Session cookie: `better-auth.session_token`
- HttpOnly: Yes
- Secure: Yes (production)
- SameSite: Lax
- Expiry: 7 days

### Session Refresh
Sessions are automatically refreshed when:
- User makes authenticated requests
- Session is older than 1 day

## Common Integration Patterns

### Pattern 1: Redirect-based OAuth
```typescript
// User clicks login → Redirects to auth service → Returns to your app
await signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
});
```

### Pattern 2: Check Authentication Status
```typescript
import { getSession } from "@/lib/auth-client";

// Server-side
const session = await getSession();
if (!session) {
    redirect("/login");
}
```

### Pattern 3: Logout
```typescript
import { signOut } from "@/lib/auth-client";

await signOut();
// Redirects to login page
```

## Troubleshooting

### Issue: CORS Errors
**Solution**: Ensure `NEXT_PUBLIC_APP_URL` is set correctly in auth service environment variables.

### Issue: OAuth Callback Fails
**Solution**: Verify redirect URIs in Google/GitHub OAuth settings match exactly:
- `https://auth.blazeneuro.com/api/auth/callback/google`
- `https://auth.blazeneuro.com/api/auth/callback/github`

### Issue: Session Not Persisting
**Solution**: Check that cookies are being sent with credentials:
```typescript
fetch(url, {
    credentials: "include", // Important!
});
```

### Issue: Rate Limiting (429 Error)
**Solution**: Vercel has rate limits. Implement exponential backoff or reduce request frequency.

## Database Schema

### Users Table
```sql
- id: string (primary key)
- email: string (unique)
- name: string
- emailVerified: boolean
- image: string (nullable)
- createdAt: timestamp
- updatedAt: timestamp
```

### Sessions Table
```sql
- id: string (primary key)
- userId: string (foreign key)
- expiresAt: timestamp
- token: string (unique)
- ipAddress: string
- userAgent: string
```

### Accounts Table (OAuth)
```sql
- id: string (primary key)
- userId: string (foreign key)
- provider: string (google, github)
- providerAccountId: string
- accessToken: string
- refreshToken: string (nullable)
- expiresAt: timestamp (nullable)
```

## Security Best Practices

1. **Always use HTTPS** in production
2. **Validate redirect URLs** to prevent open redirects
3. **Rotate secrets regularly** (BETTER_AUTH_SECRET)
4. **Enable email verification** for email/password signups
5. **Implement rate limiting** on sensitive endpoints
6. **Use secure cookie settings** (HttpOnly, Secure, SameSite)
7. **Keep OAuth credentials secret** - never commit to git

## Deployment Checklist

- [ ] Set all environment variables in deployment platform
- [ ] Configure OAuth redirect URIs for production domain
- [ ] Run database migrations
- [ ] Test OAuth flow end-to-end
- [ ] Verify CORS settings
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and error tracking
- [ ] Configure rate limiting
- [ ] Test session persistence across requests

## Support & Documentation

- Better Auth Docs: https://www.better-auth.com/docs
- Next.js Docs: https://nextjs.org/docs
- OAuth 2.0 Spec: https://oauth.net/2/

## File Structure Reference

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/route.ts    # Main auth handler
│   └── auth/
│       ├── login/page.tsx
│       ├── signup/page.tsx
│       └── forgot-password/page.tsx
├── lib/
│   ├── auth.ts                      # Server-side auth config
│   └── auth-client.ts               # Client-side auth client
└── middleware.ts                    # Route protection
```

## Quick Start for AI

When integrating this auth service into a new app:

1. Install: `npm install better-auth`
2. Create client pointing to `https://auth.blazeneuro.com`
3. Use `signIn.social()` for OAuth
4. Use `useSession()` hook to check auth status
5. Protect routes with middleware checking `better-auth.session_token` cookie
6. Done! Users can authenticate via Google/GitHub

## Notes for AI

- This is a **centralized auth service** - other apps connect to it
- OAuth flow happens on `auth.blazeneuro.com`, then redirects back to client app
- Sessions are shared via cookies (same domain or subdomain recommended)
- For cross-domain, consider JWT tokens instead of cookies
- Rate limiting is active on Vercel - implement retry logic with backoff
