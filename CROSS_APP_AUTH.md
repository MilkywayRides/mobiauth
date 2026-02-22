# Cross-App Authentication Guide

## 🔐 Secure Cross-App Integration

Use encrypted tokens to authenticate users from other applications without exposing credentials.

## Setup

### 1. Add to `.env`
```env
CROSS_APP_MASTER_KEY=7e7ebc1f8ef27dc9c561f346ccd960be560dbbf683c4ae44b2c06a6816a90276
CROSS_APP_ENCRYPTION_KEY=4737214227d7e263c5d4a383f8c7d909359aa247643cf0aeb7e5735c0b96d02a
```

### 2. Share Keys Securely
- Share `CROSS_APP_MASTER_KEY` with your other apps (keep secret!)
- Share `CROSS_APP_ENCRYPTION_KEY` with your other apps (keep secret!)
- Never commit these to git

## Usage from Another App

### Authenticate User
```javascript
// In your other app
const response = await fetch('https://auth.yourdomain.com/api/cross-app/auth', {
  method: 'POST',
  headers: {
    'X-Master-Key': process.env.CROSS_APP_MASTER_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    appId: 'my-mobile-app'
  })
});

const { token, user } = await response.json();
// token is encrypted and expires in 5 minutes
// Store token temporarily for verification
```

### Verify Token
```javascript
// When user makes request to your app
const verifyRes = await fetch('https://auth.yourdomain.com/api/cross-app/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: userProvidedToken })
});

const { valid, user, appId } = await verifyRes.json();

if (valid) {
  // User is authenticated
  // Create session in your app
}
```

### Sync User Data (Encrypted)
```javascript
const crypto = require('crypto');

function encryptPayload(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm', 
    Buffer.from(key.slice(0, 64), 'hex'), 
    iv
  );
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data)),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

// Create user
const payload = encryptPayload({
  action: 'createUser',
  email: 'newuser@example.com',
  name: 'New User',
  emailVerified: true
}, process.env.CROSS_APP_ENCRYPTION_KEY);

const response = await fetch('https://auth.yourdomain.com/api/cross-app/sync', {
  method: 'POST',
  headers: {
    'X-Master-Key': process.env.CROSS_APP_MASTER_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ encryptedData: payload })
});

const { success, user } = await response.json();
```

## Available Actions

### createUser
```javascript
{
  action: 'createUser',
  email: 'user@example.com',
  name: 'John Doe',
  image: 'https://...',
  emailVerified: true
}
```

### updateUser
```javascript
{
  action: 'updateUser',
  userId: 'user_123',
  name: 'Updated Name',
  image: 'https://...'
}
```

### getUser
```javascript
{
  action: 'getUser',
  email: 'user@example.com'  // or userId: 'user_123'
}
```

## Security Features

✅ **AES-256-GCM Encryption** - Military-grade encryption
✅ **Master Key Auth** - Only authorized apps can access
✅ **5-Minute Expiry** - Tokens expire quickly
✅ **Nonce Protection** - Prevents replay attacks
✅ **No Password Exposure** - Never transmit passwords

## Flow Diagram

```
Your App                Auth Server              Other App
   |                         |                        |
   |  1. Request Auth        |                        |
   |------------------------>|                        |
   |  (email + appId)        |                        |
   |                         |                        |
   |  2. Encrypted Token     |                        |
   |<------------------------|                        |
   |  (expires in 5 min)     |                        |
   |                         |                        |
   |  3. Send Token to User  |                        |
   |------------------------------------------------->|
   |                         |                        |
   |                         |  4. Verify Token       |
   |                         |<-----------------------|
   |                         |                        |
   |                         |  5. User Data          |
   |                         |----------------------->|
   |                         |                        |
```

## Use Cases

1. **Mobile App Login** - Authenticate mobile users via main auth server
2. **Microservices** - Share authentication across services
3. **Admin Panels** - Separate admin app using same user base
4. **Partner Integrations** - Allow trusted partners to authenticate users
5. **SSO Implementation** - Single sign-on across multiple apps

## Best Practices

1. **Rotate Keys Regularly** - Change encryption keys periodically
2. **Use HTTPS Only** - Never send tokens over HTTP
3. **Short Token Lifetime** - Keep 5-minute expiry
4. **Log Access** - Monitor cross-app authentication attempts
5. **IP Whitelist** - Restrict master key usage to known IPs (optional)

## Error Handling

```javascript
try {
  const response = await fetch('https://auth.yourdomain.com/api/cross-app/auth', {
    method: 'POST',
    headers: {
      'X-Master-Key': process.env.CROSS_APP_MASTER_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, appId })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid master key');
    }
    if (response.status === 404) {
      throw new Error('User not found');
    }
    throw new Error('Authentication failed');
  }

  const { token, user } = await response.json();
  return { token, user };
} catch (error) {
  console.error('Cross-app auth error:', error);
  throw error;
}
```

## Testing

```bash
# Test authentication
curl -X POST http://localhost:3000/api/cross-app/auth \
  -H "X-Master-Key: YOUR_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","appId":"test-app"}'

# Test verification
curl -X POST http://localhost:3000/api/cross-app/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"ENCRYPTED_TOKEN"}'
```

## Production Checklist

- [ ] Generate strong random keys
- [ ] Store keys in secure environment variables
- [ ] Enable HTTPS only
- [ ] Set up monitoring for failed auth attempts
- [ ] Implement IP whitelisting (optional)
- [ ] Add rate limiting to cross-app endpoints
- [ ] Document key rotation procedure
- [ ] Set up alerts for suspicious activity
