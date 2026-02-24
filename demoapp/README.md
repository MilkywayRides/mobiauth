# Demo App (External Controller)

This demo app shows how to control this auth service from another application using the encrypted control plane.

## Features in demoapp

- List users
- Set user role
- List API keys
- Create API key
- List OAuth clients
- Create OAuth client

All operations call `POST /api/secure/control` using encrypted envelopes.

## Setup

1. Copy env template:

```bash
cp .env.example .env
```

2. Fill `.env` values to match your auth service env:

- `AUTH_SERVICE_URL`
- `CONTROL_SERVICE_TOKEN`
- `CONTROL_ENCRYPTION_KEY`
- `CONTROL_HMAC_KEY`

3. Install + run:

```bash
npm install
npm run dev
```

Open: `http://localhost:4100`

## Notes

- This is a demo controller app for development/testing.
- Use mTLS, key rotation, and centralized nonce replay storage for production.
