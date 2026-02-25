# Using BlazeNeuro OAuth in Your App

## Quick Start (5 Minutes)

### Step 1: Install Better Auth
```bash
npm install better-auth
```

### Step 2: Create Auth Client
Create `lib/auth-client.ts`:
```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "https://auth.blazeneuro.com",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Step 3: Add Login Button
```typescript
"use client";
import { signIn } from "@/lib/auth-client";

export function LoginButton() {
    return (
        <button onClick={() => signIn.social({ 
            provider: "google",
            callbackURL: "/dashboard" 
        })}>
            Sign in with Google
        </button>
    );
}
```

### Step 4: Check if User is Logged In
```typescript
"use client";
import { useSession } from "@/lib/auth-client";

export function Profile() {
    const { data: session } = useSession();
    
    if (!session) return <div>Not logged in</div>;
    
    return <div>Hello, {session.user.name}!</div>;
}
```

### Step 5: Logout
```typescript
import { signOut } from "@/lib/auth-client";

<button onClick={() => signOut()}>Logout</button>
```

## That's It! 🎉

Your app now has Google and GitHub OAuth authentication.

## Available Providers
- `google` - Google OAuth
- `github` - GitHub OAuth

## Session Data Structure
```typescript
{
    user: {
        id: string;
        name: string;
        email: string;
        image: string;
        emailVerified: boolean;
    },
    session: {
        id: string;
        userId: string;
        expiresAt: Date;
    }
}
```

## Protect Routes (Optional)

Create `middleware.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const session = req.cookies.get("better-auth.session_token");
    
    if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
```

## Server-Side Session Check

```typescript
import { authClient } from "@/lib/auth-client";

export default async function DashboardPage() {
    const session = await authClient.getSession();
    
    if (!session) {
        redirect("/login");
    }
    
    return <div>Welcome {session.user.name}</div>;
}
```

## Complete Example

```typescript
// app/login/page.tsx
"use client";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
    return (
        <div>
            <h1>Login</h1>
            <button onClick={() => signIn.social({ 
                provider: "google",
                callbackURL: "/dashboard" 
            })}>
                Google
            </button>
            <button onClick={() => signIn.social({ 
                provider: "github",
                callbackURL: "/dashboard" 
            })}>
                GitHub
            </button>
        </div>
    );
}

// app/dashboard/page.tsx
"use client";
import { useSession, signOut } from "@/lib/auth-client";

export default function Dashboard() {
    const { data: session, isPending } = useSession();
    
    if (isPending) return <div>Loading...</div>;
    if (!session) return <div>Please login</div>;
    
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome, {session.user.name}</p>
            <img src={session.user.image} alt="avatar" />
            <button onClick={() => signOut()}>Logout</button>
        </div>
    );
}
```

## Need Help?

Check `AI_README.md` for detailed documentation and troubleshooting.
