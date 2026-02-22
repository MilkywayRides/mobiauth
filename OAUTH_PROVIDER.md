# OAuth Provider & API Documentation

## Your Auth System is Now a Full OAuth Provider

### Base URL
```
https://your-domain.com
```

## 🔐 Cross-App Authentication (Encrypted)

### Setup
Add to `.env`:
```env
CROSS_APP_MASTER_KEY=your-secret-master-key-min-32-chars
CROSS_APP_ENCRYPTION_KEY=64-char-hex-string
```

Generate keys:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1. Authenticate User from Another App
```bash
POST /api/cross-app/auth
X-Master-Key: YOUR_MASTER_KEY
Content-Type: application/json

{
  "email": "user@example.com",
  "appId": "my-other-app"
}
```

Response:
```json
{
  "token": "encrypted-token-string",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://..."
  },
  "expiresIn": 300
}
```

### 2. Verify Token in Your App
```bash
POST /api/cross-app/verify
Content-Type: application/json

{
  "token": "encrypted-token-string"
}
```

Response:
```json
{
  "valid": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true,
    "role": "user"
  },
  "appId": "my-other-app"
}
```

### 3. Sync User Data (Encrypted)
```bash
POST /api/cross-app/sync
X-Master-Key: YOUR_MASTER_KEY
Content-Type: application/json

{
  "encryptedData": "base64-encrypted-payload"
}
```

Supported actions:
- `createUser` - Create new user
- `updateUser` - Update existing user
- `getUser` - Retrieve user data

## OAuth 2.0 Flow

### 1. Register OAuth Application
```bash
POST /api/oauth/clients
Authorization: Bearer <your-session-token>
Content-Type: application/json

{
  "name": "My App",
  "description": "My awesome application",
  "website": "https://myapp.com",
  "redirectUris": ["https://myapp.com/callback"],
  "scopes": ["profile", "email"]
}
```

Response:
```json
{
  "client": {
    "id": "...",
    "clientId": "client_abc123...",
    "clientSecret": "secret_xyz789...",
    "name": "My App"
  },
  "warning": "Save the client secret now. You won't be able to see it again."
}
```

### 2. Authorization URL
Redirect users to:
```
GET /api/oauth/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=profile email&state=RANDOM_STATE
```

### 3. Exchange Code for Token
```bash
POST /api/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "code_...",
  "client_id": "client_...",
  "client_secret": "secret_..."
}
```

Response:
```json
{
  "access_token": "at_...",
  "refresh_token": "rt_...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "profile email"
}
```

### 4. Get User Info
```bash
GET /api/oauth/userinfo
Authorization: Bearer at_...
```

Response:
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "image": "https://...",
  "email_verified": true
}
```

### 5. Refresh Token
```bash
POST /api/oauth/token
Content-Type: application/json

{
  "grant_type": "refresh_token",
  "refresh_token": "rt_...",
  "client_id": "client_...",
  "client_secret": "secret_..."
}
```

## API Keys

### Create API Key
```bash
POST /api/keys
Authorization: Bearer <your-session-token>
Content-Type: application/json

{
  "name": "Production Key",
  "scopes": ["read:user"],
  "rateLimit": 1000,
  "expiresAt": "2027-12-31T23:59:59Z"
}
```

Response:
```json
{
  "apiKey": {
    "id": "...",
    "key": "sk_abc123...",
    "name": "Production Key"
  },
  "warning": "Save this key now. You won't be able to see it again."
}
```

### Use API Key
```bash
GET /api/v1/user
Authorization: Bearer sk_abc123...
```

Response:
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Available Scopes

- `profile` - Basic profile information (name, image)
- `email` - Email address and verification status
- `read:user` - Read user data (API keys)
- `write:user` - Update user data (API keys)

## Rate Limits

- OAuth clients: Based on token usage
- API keys: Configurable per key (default: 1000/hour)
- Cross-app: Protected by master key

## Integration Examples

### Node.js - Cross-App Auth
```javascript
const crypto = require('crypto');

// Encrypt payload
function encryptPayload(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key.slice(0, 64), 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

// Authenticate user
const response = await fetch('https://your-domain.com/api/cross-app/auth', {
  method: 'POST',
  headers: {
    'X-Master-Key': process.env.MASTER_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    appId: 'my-app'
  })
});

const { token, user } = await response.json();

// Verify token
const verifyRes = await fetch('https://your-domain.com/api/cross-app/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
});
```

### Python
```python
import requests
response = requests.get('https://your-domain.com/api/v1/user', 
    headers={'Authorization': 'Bearer sk_...'})
```

### cURL
```bash
curl -H "Authorization: Bearer sk_..." https://your-domain.com/api/v1/user
```

## Security Features

✅ AES-256-GCM encryption for cross-app tokens
✅ Master key authentication
✅ 5-minute token expiry
✅ Client secret hashing (SHA-256)
✅ Session validation for OAuth/API key creation
✅ Rate limiting per API key
✅ Scope-based access control

## Next Steps

1. Run migrations: `npx prisma migrate dev`
2. Deploy to production
3. Update CORS settings for your domains
4. Set up monitoring and logging
5. Create developer documentation portal
