# How to Use BlazeNeuro Auth as an OAuth Provider

## Overview
This guide shows how to integrate "Sign in with BlazeNeuro" into your application, allowing users to authenticate using their BlazeNeuro account.

## What You're Building
Users will see a "Sign in with BlazeNeuro" button in your app, which redirects them to `auth.blazeneuro.com` to login, then returns them to your app with their authentication.

## Prerequisites
1. Your app must be registered with BlazeNeuro Auth
2. You need OAuth credentials (Client ID & Client Secret)
3. You need to configure callback URLs

---

## Step 1: Register Your Application

Contact BlazeNeuro to register your application and receive:
- **Client ID**: `your-app-client-id`
- **Client Secret**: `your-app-client-secret`
- **Authorized Redirect URI**: `https://yourapp.com/api/auth/callback/blazeneuro`

---

## Step 2: Install Dependencies

```bash
npm install better-auth
```

---

## Step 3: Configure BlazeNeuro as OAuth Provider

Create `lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
    database: {
        // Your database config
    },
    socialProviders: {
        // Add BlazeNeuro as a custom OAuth provider
        blazeneuro: {
            clientId: process.env.BLAZENEURO_CLIENT_ID!,
            clientSecret: process.env.BLAZENEURO_CLIENT_SECRET!,
            authorizationUrl: "https://auth.blazeneuro.com/oauth/authorize",
            tokenUrl: "https://auth.blazeneuro.com/oauth/token",
            userInfoUrl: "https://auth.blazeneuro.com/oauth/userinfo",
            scopes: ["openid", "profile", "email"],
        },
    },
});
```

---

## Step 4: Environment Variables

Add to `.env`:
```bash
BLAZENEURO_CLIENT_ID="your-client-id"
BLAZENEURO_CLIENT_SECRET="your-client-secret"
```

---

## Step 5: Create Auth API Route

Create `app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

---

## Step 6: Create Auth Client

Create `lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signOut, useSession } = authClient;
```

---

## Step 7: Add "Sign in with BlazeNeuro" Button

```typescript
"use client";
import { signIn } from "@/lib/auth-client";

export function LoginPage() {
    return (
        <button onClick={() => signIn.social({
            provider: "blazeneuro",
            callbackURL: "/dashboard"
        })}>
            Sign in with BlazeNeuro
        </button>
    );
}
```

---

## Step 8: Handle User Session

```typescript
"use client";
import { useSession, signOut } from "@/lib/auth-client";

export function Dashboard() {
    const { data: session } = useSession();
    
    if (!session) return <div>Please login</div>;
    
    return (
        <div>
            <h1>Welcome, {session.user.name}</h1>
            <p>Email: {session.user.email}</p>
            <button onClick={() => signOut()}>Logout</button>
        </div>
    );
}
```

---

## OAuth Flow Diagram

```
1. User clicks "Sign in with BlazeNeuro"
   ↓
2. Redirect to: https://auth.blazeneuro.com/oauth/authorize
   ↓
3. User logs in on BlazeNeuro
   ↓
4. BlazeNeuro redirects back: https://yourapp.com/api/auth/callback/blazeneuro?code=xxx
   ↓
5. Your app exchanges code for access token
   ↓
6. Your app fetches user info from BlazeNeuro
   ↓
7. User is logged into your app
```

---

## BlazeNeuro OAuth Endpoints

| Endpoint | URL |
|----------|-----|
| Authorization | `https://auth.blazeneuro.com/oauth/authorize` |
| Token Exchange | `https://auth.blazeneuro.com/oauth/token` |
| User Info | `https://auth.blazeneuro.com/oauth/userinfo` |
| Logout | `https://auth.blazeneuro.com/oauth/logout` |

---

## User Data Structure

After successful authentication, you'll receive:

```typescript
{
    id: "user-id",
    email: "user@example.com",
    name: "John Doe",
    image: "https://...",
    emailVerified: true
}
```

---

## Required Scopes

- `openid` - Basic authentication
- `profile` - User's name and profile info
- `email` - User's email address

---

## Security Best Practices

1. **Never expose Client Secret** - Keep it server-side only
2. **Validate redirect URIs** - Only allow registered callback URLs
3. **Use HTTPS** - Always in production
4. **Store tokens securely** - Use httpOnly cookies
5. **Implement CSRF protection** - Use state parameter

---

## Testing Locally

1. Set callback URL to: `http://localhost:3000/api/auth/callback/blazeneuro`
2. Register this URL with BlazeNeuro
3. Test the OAuth flow

---

## Production Deployment

1. Update callback URL to production domain
2. Re-register with BlazeNeuro
3. Update environment variables
4. Test end-to-end flow

---

## Troubleshooting

### Error: Invalid Redirect URI
**Solution**: Ensure your callback URL is registered with BlazeNeuro exactly as configured.

### Error: Invalid Client
**Solution**: Check your Client ID and Client Secret are correct.

### Error: Access Denied
**Solution**: User declined authorization or scopes are incorrect.

---

## Complete Example

```typescript
// app/login/page.tsx
"use client";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="space-y-4">
                <h1>Login to MyApp</h1>
                <button 
                    onClick={() => signIn.social({
                        provider: "blazeneuro",
                        callbackURL: "/dashboard"
                    })}
                    className="btn btn-primary"
                >
                    <img src="/blazeneuro-icon.svg" alt="" />
                    Sign in with BlazeNeuro
                </button>
            </div>
        </div>
    );
}

// app/dashboard/page.tsx
"use client";
import { useSession, signOut } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function Dashboard() {
    const { data: session, isPending } = useSession();
    
    if (isPending) return <div>Loading...</div>;
    if (!session) redirect("/login");
    
    return (
        <div>
            <nav>
                <h1>Dashboard</h1>
                <button onClick={() => signOut()}>Logout</button>
            </nav>
            <main>
                <h2>Welcome, {session.user.name}!</h2>
                <p>Email: {session.user.email}</p>
                {session.user.image && (
                    <img src={session.user.image} alt="Profile" />
                )}
            </main>
        </div>
    );
}
```

---

## Support

For OAuth credentials and registration, contact: support@blazeneuro.com

For technical issues, see: https://github.com/MilkywayRides/mobiauth
