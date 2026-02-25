# Auth Service API Documentation

This document describes all HTTP APIs currently implemented by this service.

## Base URL

- Local: `http://localhost:3000`
- Production: your deployed origin

## Authentication Models

This service exposes several API families with different auth models:

1. **Session-authenticated APIs**
   - Browser session cookie (`auth.session_token` or `__Secure-auth.session_token`).
   - Used for most `/api/auth/*`, `/api/keys`, `/api/oauth/clients` routes.

2. **OAuth client credentials + tokens**
   - Used by `/api/oauth/token`, `/api/oauth/userinfo`.

3. **API key bearer auth**
   - Used by `/api/v1/user`.
   - Header: `Authorization: Bearer <api_key>`

4. **Cross-app shared master key**
   - Used by `/api/cross-app/*`.
   - Header: `x-master-key: <CROSS_APP_MASTER_KEY>`

5. **Encrypted secure control plane**
   - Used by `/api/secure/control`.
   - Header: `x-control-token: <CONTROL_SERVICE_TOKEN>`
   - Payload envelope uses AES-256-GCM + HMAC-SHA256.

6. **Webhook shared secret**
   - Used by `/api/webhooks/auth`.
   - Header: `x-webhook-signature: <WEBHOOK_SECRET>`

---

## 1) Core Better Auth Handler

### `GET|POST /api/auth/[...all]`
Main Better Auth endpoint handler. Includes standard Better Auth operations (sign in, sign up, session, sign out, etc.) according to Better Auth SDK usage.

---

## 2) Session & Activity APIs

### `GET /api/auth/sessions`
Return all sessions for the currently authenticated user.

**Auth:** session cookie required.

**Response**
```json
{
  "sessions": [
    {
      "id": "...",
      "token": "...",
      "expiresAt": "...",
      "ipAddress": "...",
      "userAgent": "...",
      "userId": "..."
    }
  ]
}
```

### `POST /api/auth/sessions/revoke`
Revoke one session by `sessionId`.

**Body**
```json
{ "sessionId": "<session_id>" }
```

### `POST /api/auth/sessions/revoke-all`
Revoke all sessions except current cookie session.

### `DELETE /api/auth/sessions/:sessionId`
Alternative route to delete one session.

### `GET /api/auth/activity?days=30`
Get recent login activity for current user.

**Response**
```json
{
  "totalLogins": 12,
  "sessions": [ ... up to 10 recent sessions ... ],
  "loginsByDay": [
    { "date": "2026-02-23", "count": { "_all": 2 } }
  ]
}
```

---

## 3) Two-Factor Authentication (TOTP)

### `POST /api/auth/2fa/setup`
Create TOTP secret + QR code for current user.

**Response**
```json
{
  "secret": "BASE32SECRET",
  "qrCode": "data:image/png;base64,..."
}
```

### `POST /api/auth/2fa/enable`
Enable 2FA after verifying TOTP token.

**Body**
```json
{ "token": "123456" }
```

**Response**
```json
{
  "success": true,
  "backupCodes": ["AB12CD34", "..."]
}
```

### `POST /api/auth/2fa/disable`
Disable 2FA and clear secret + backup codes.

---

## 4) QR Login Flow

### `POST /api/auth/qr/init`
Initialize QR login token and return QR payload.

**Rate limited:** yes.

**Response**
```json
{
  "token": "...",
  "signature": "...",
  "nonce": "...",
  "expiresAt": "...",
  "qrData": "{\"token\":...,\"signature\":...,\"expiresAt\":...}"
}
```

### `GET /api/auth/qr/status?token=<token>`
Get QR status (`pending`, `confirmed`, `used`, `expired`).

### `POST /api/auth/qr/confirm`
Confirm QR token from authenticated mobile user.

**Body**
```json
{ "token": "...", "signature": "..." }
```

### `POST /api/auth/qr/login`
Finalize login from browser with nonce proof and create signed session cookie.

**Body**
```json
{ "token": "...", "nonce": "..." }
```

### `POST /api/auth/qr/cleanup`
Cleanup expired QR tokens.

---

## 5) Account Linking & Phone Verify

### `POST /api/auth/link-account`
Validate link-account request shape for current user.

**Body**
```json
{
  "email": "user@example.com",
  "password": "optional unless email provided",
  "phoneNumber": "+1234567890"
}
```

### `POST /api/auth/phone/verify`
Verify phone login with social provider flow.

**Body**
```json
{
  "idToken": "firebase_or_provider_token",
  "phoneNumber": "+1234567890"
}
```

---

## 6) OAuth Provider APIs

### `GET /api/oauth/authorize`
Validate OAuth auth request, optionally skip consent if prior authorization exists (unless `prompt=consent`), or redirect to `/oauth/consent`.

**Query params**
- `client_id` (required)
- `redirect_uri` (required)
- `scope` (optional, default `profile email`)
- `state` (optional)
- `prompt` (optional, set to `consent` to force consent)

### `POST /api/oauth/authorize`
Handle allow/deny from consent UI (supports `form-data` and JSON).

**Fields**
- `client_id`, `redirect_uri`, `scope`, `state?`, `action=allow|deny`

If allowed, redirects with authorization code in query (`code`).

### `POST /api/oauth/token`
Exchange authorization code or refresh token.

**Body (authorization code grant)**
```json
{
  "grant_type": "authorization_code",
  "code": "code_xxx",
  "client_id": "client_xxx",
  "client_secret": "secret_xxx"
}
```

**Body (refresh token grant)**
```json
{
  "grant_type": "refresh_token",
  "refresh_token": "rt_xxx",
  "client_id": "client_xxx",
  "client_secret": "secret_xxx"
}
```

### `GET /api/oauth/userinfo`
Return user claims from OAuth access token.

**Header**
`Authorization: Bearer <access_token>`

**Scopes impact**
- `profile` => `name`, `image`
- `email` => `email`, `email_verified`

### `GET /api/oauth/clients`
List OAuth apps owned by current user.

### `POST /api/oauth/clients`
Create OAuth app for current user.

**Body**
```json
{
  "name": "My App",
  "description": "optional",
  "logo": "optional",
  "website": "optional",
  "redirectUris": ["https://app.example.com/callback"],
  "scopes": ["profile", "email"]
}
```

Returns `clientSecret` one time.

### `PATCH /api/oauth/clients/:id`
Toggle app `active` status.

**Body**
```json
{ "active": true }
```

### `DELETE /api/oauth/clients/:id`
Delete OAuth app by ID (owner-scoped).

---

## 7) API Key Management & User Data API

### `GET /api/keys`
List API keys for current user.

### `POST /api/keys`
Create API key for current user.

**Body**
```json
{
  "name": "Production key",
  "scopes": ["read:user"],
  "rateLimit": 1000,
  "expiresAt": "2026-12-31T00:00:00.000Z"
}
```

### `GET /api/v1/user`
Public API-key protected user profile endpoint.

**Header**
`Authorization: Bearer <api_key>`

**Scope behavior**
- `read:user` or `profile` => includes `name`
- `read:user` or `email` => includes `email`

Rate limited by per-key `rateLimit` per hour.

---

## 8) Cross-App APIs

### `POST /api/cross-app/auth`
Issue short-lived encrypted cross-app token for user by email.

**Header**
`x-master-key: <CROSS_APP_MASTER_KEY>`

**Body**
```json
{ "email": "user@example.com", "appId": "my-app" }
```

### `POST /api/cross-app/verify`
Verify cross-app token and return user + `appId`.

**Body**
```json
{ "token": "..." }
```

### `POST /api/cross-app/sync`
Encrypted sync channel with actions:
- `createUser`
- `updateUser`
- `getUser`

**Header**
`x-master-key: <CROSS_APP_MASTER_KEY>`

**Body**
```json
{ "encryptedData": "..." }
```

---

## 9) Secure External Control Plane

### `POST /api/secure/control`
High-security external control endpoint intended for your controller app.

**Header**
- `x-control-token: <CONTROL_SERVICE_TOKEN>`

**Body shape (`EncryptedEnvelope`)**
```json
{
  "timestamp": 1730000000000,
  "nonce": "random_nonce_16_to_128_chars",
  "iv": "base64",
  "tag": "base64",
  "ciphertext": "base64",
  "signature": "hex_hmac_sha256"
}
```

**Security checks performed**
- service token match
- timestamp skew window
- nonce replay detection (in-memory)
- HMAC signature verification (timing-safe compare)
- AES-256-GCM decrypt

**Supported actions inside decrypted payload**
1. `health`
2. `export_full_state`
   - options: `includeAuditLogs?: boolean`, `limit?: number` (clamped 1..5000)

**`export_full_state` returns**
- users (includes role)
- sessions (metadata)
- oauthClients
- oauthAuthorizations
- oauthTokens (metadata)
- apiKeys (metadata)
- auditLogs (optional)




### Advanced OAuth client setup (recommended)

When creating OAuth clients (`/api/oauth/clients` or `create_oauth_client` in secure-control):

- Use **exact HTTPS callback URLs** (no wildcards).
- Keep callback list small (principle of least exposure).
- Use least-privilege scopes only.
- Prefer PKCE + exact redirect matching + refresh-token rotation (returned in advanced profile).
- Separate clients per environment (dev/staging/prod).

### Additional secure-control actions

The control plane also supports admin-style management actions for external apps:

- `list_users`
- `set_user_role` (`userId`, `role`)
- `list_api_keys` (`userId?`, `limit?`)
- `create_api_key` (`userId`, `name`, `scopes?`, `rateLimit?`, `expiresAt?`)
- `list_oauth_clients` (`userId?`, `limit?`)
- `create_oauth_client` (`userId`, `name`, `redirectUris`, optional metadata/scopes)

These are intended for your external controller app and return encrypted responses.

---

## 10) Health & Webhooks

### `GET /api/health`
Simple DB health probe (`SELECT 1`).

### `POST /api/webhooks/auth`
Webhook receiver with shared secret verification.

**Header**
`x-webhook-signature: <WEBHOOK_SECRET>`

---

## Error Conventions

Common patterns used across endpoints:
- `401` Unauthorized / invalid credential
- `400` invalid request shape
- `404` not found
- `409` conflict (already used token, etc.)
- `410` gone/expired token
- `429` rate limit
- `500` internal server error

---

## Environment Variables (API-relevant)

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DATABASE_URL`
- `CROSS_APP_MASTER_KEY`
- `CROSS_APP_ENCRYPTION_KEY`
- `CONTROL_SERVICE_TOKEN`
- `CONTROL_ENCRYPTION_KEY` (32-byte hex/base64)
- `CONTROL_HMAC_KEY` (32-byte hex/base64)
- `WEBHOOK_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (optional)

---

## Security Recommendations for Controller Integration

To maximize practical security for your “external-control only” architecture:

1. Use **mTLS** between controller and auth service.
2. Store keys in **KMS/HSM** and rotate on a schedule.
3. Move nonce replay cache from in-memory map to **Redis/DB** for multi-instance deployments.
4. Add strict IP allowlist and WAF rules for `/api/secure/control`.
5. Add per-endpoint and per-token rate limits.
6. Add immutable audit trail and alerting for control-plane actions.

