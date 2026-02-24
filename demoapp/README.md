# MobiAuth Demo App

This is a demo application that demonstrates OAuth 2.0 authentication with your MobiAuth server.

## Setup Complete ✅

The OAuth client has been configured and is ready to use!

### Configuration

Your `.env.local` file has been configured with:
- **Client ID**: `client_aa6f2b458788b6246e9dc69d831953fc`
- **Auth Server**: `http://localhost:3000`
- **Demo App**: `http://localhost:3001`

## How to Run

### Option 1: Using the startup script (Recommended)

From the main auth directory:
```bash
./start-demoapp.sh
```

### Option 2: Manual start

1. Make sure the main auth server is running on port 3000:
```bash
# In the main auth directory
npm run dev
```

2. Start the demo app on port 3001:
```bash
cd demoapp
npm run dev
```

## Testing the OAuth Flow

1. Open http://localhost:3001 in your browser
2. You'll be redirected to the sign-in page
3. Click "Sign in with MobiAuth"
4. You'll be redirected to http://localhost:3000 (your auth server)
5. If not logged in, log in to your auth server
6. Approve the OAuth consent (first time only)
7. You'll be redirected back to the demo app dashboard

## OAuth Endpoints Used

- **Authorization**: `http://localhost:3000/api/oauth/authorize`
- **Token**: `http://localhost:3000/api/oauth/token`
- **UserInfo**: `http://localhost:3000/api/oauth/userinfo`

## Features

- ✅ OAuth 2.0 Authorization Code Flow
- ✅ OpenID Connect support
- ✅ Automatic token refresh
- ✅ Session management with NextAuth
- ✅ Protected dashboard route

## Troubleshooting

### "Invalid client" error
- Make sure the main auth server is running
- Verify the OAuth client exists in the database

### Redirect URI mismatch
- Check that the redirect URI in `.env.local` matches the one registered in the OAuth client

### Port conflicts
- Main auth server must run on port 3000
- Demo app must run on port 3001

## Next Steps

You can now:
- Customize the demo app UI
- Add more protected routes
- Integrate with your own applications
- Test different OAuth scopes
