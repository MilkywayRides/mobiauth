# Demo App (External Controller)

This demo app shows advanced OAuth/API-key/user management from another app via the encrypted secure-control endpoint.

## Features

- List users and update user roles
- List API keys and create API keys
- List OAuth clients and create OAuth clients with advanced setup:
  - callback/redirect URIs
  - scopes
  - description / website / logo metadata
- Uses encrypted envelopes for every control request

## Setup

```bash
cp .env.example .env
npm run dev
```

Open: `http://localhost:4100`

## Environment

- `AUTH_SERVICE_URL`
- `CONTROL_SERVICE_TOKEN`
- `CONTROL_ENCRYPTION_KEY`
- `CONTROL_HMAC_KEY`
- `PORT`

## DevOps recommendations

- Put auth service + demo/controller behind private networking.
- Use mTLS between services.
- Rotate control keys with KMS/HSM and short rollout windows.
- Add centralized replay cache (Redis) and SIEM alerts for control actions.
