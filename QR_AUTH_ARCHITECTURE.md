# QR Authentication Architecture

## Overview
QR-based authentication allows users to log into the web app by scanning a QR code with their mobile app.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        WEB APPLICATION                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. User clicks "Login with QR"
                              ▼
                    ┌──────────────────┐
                    │  Generate Token  │
                    │  + Signature     │
                    └──────────────────┘
                              │
                              │ 2. Display QR Code
                              ▼
                    ┌──────────────────┐
                    │   QR Code with   │
                    │  {token, sig,    │
                    │   expiresAt}     │
                    └──────────────────┘
                              │
                              │ 3. Poll for status
                              ▼
                    ┌──────────────────┐
                    │ GET /api/auth/   │
                    │ qr/status?token  │
                    └──────────────────┘
                              │
                              │ Status: pending/confirmed/expired
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      MOBILE APPLICATION                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 4. User taps "Scan QR"
                              ▼
                    ┌──────────────────┐
                    │  Open Camera     │
                    │  QR Scanner      │
                    └──────────────────┘
                              │
                              │ 5. Scan QR Code
                              ▼
                    ┌──────────────────┐
                    │  Parse QR Data   │
                    │  {token, sig}    │
                    └──────────────────┘
                              │
                              │ 6. Confirm with user session
                              ▼
                    ┌──────────────────┐
                    │ POST /api/auth/  │
                    │ qr/confirm       │
                    │ + session_token  │
                    └──────────────────┘
                              │
                              │ 7. Link QR token to user
                              ▼
                    ┌──────────────────┐
                    │  Update DB:      │
                    │  status=confirmed│
                    │  userId=current  │
                    └──────────────────┘
                              │
                              │ 8. Return success
                              │
┌─────────────────────────────────────────────────────────────────┐
│                        WEB APPLICATION                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 9. Poll detects confirmed
                              ▼
                    ┌──────────────────┐
                    │  Create Session  │
                    │  for user        │
                    └──────────────────┘
                              │
                              │ 10. Redirect to dashboard
                              ▼
                    ┌──────────────────┐
                    │   User Logged    │
                    │      In!         │
                    └──────────────────┘
```

## API Endpoints

### 1. Generate QR Token (Web)
**Endpoint:** `POST /api/auth/qr/generate`
**Response:**
```json
{
  "token": "unique-token-id",
  "signature": "hmac-signature",
  "expiresAt": "2026-02-20T20:30:00Z"
}
```

### 2. Check QR Status (Web - Polling)
**Endpoint:** `GET /api/auth/qr/status?token=xxx`
**Response:**
```json
{
  "status": "pending|confirmed|expired",
  "userId": "user-id-if-confirmed",
  "userName": "User Name",
  "expiresAt": "2026-02-20T20:30:00Z"
}
```

### 3. Confirm QR (Mobile)
**Endpoint:** `POST /api/auth/qr/confirm`
**Headers:** `Cookie: auth.session_token=xxx`
**Body:**
```json
{
  "token": "unique-token-id",
  "signature": "hmac-signature"
}
```
**Response:**
```json
{
  "success": true,
  "message": "QR code confirmed"
}
```

## Database Schema

```prisma
model QrLoginToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String?
  expiresAt DateTime
  status    String   @default("pending") // pending | confirmed | expired
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([token])
  @@index([status, expiresAt])
}
```

## Security Considerations

1. **Token Expiration:** QR codes expire after 5 minutes
2. **HMAC Signature:** Prevents QR code tampering
3. **One-time Use:** Token becomes invalid after confirmation
4. **Session Required:** Mobile app must be logged in to confirm
5. **Rate Limiting:** Prevent brute force attacks
6. **HTTPS Only:** All communication encrypted

## Mobile App Components

### 1. Dashboard Screen
- Shows user info
- "Scan QR to Login on Web" button
- Navigates to QR Scanner

### 2. QR Scanner Screen
- Camera preview with viewfinder
- ML Kit barcode scanning
- Parses QR data (token + signature)
- Calls API to confirm
- Shows success/error feedback

### 3. Auth Repository
- `confirmQr(token, signature)` - Confirms QR with user session
- Sends authenticated request with session cookie

### 4. Auth ViewModel
- `confirmQr()` - Handles QR confirmation logic
- Updates UI state (loading, success, error)

## Web App Components

### 1. QR Login Page
- Generates QR token on load
- Displays QR code
- Polls status every 2 seconds
- Redirects on confirmation

### 2. QR Generation API
- Creates unique token
- Generates HMAC signature
- Stores in database with "pending" status
- Returns QR data

### 3. QR Status API
- Checks token status in database
- Returns user info if confirmed
- Cleans up expired tokens

### 4. QR Confirm API
- Validates signature
- Checks user session
- Updates token with userId
- Sets status to "confirmed"

## Implementation Status

✅ Database schema (QrLoginToken model)
✅ Mobile QR scanner with camera
✅ Mobile QR confirmation API call
✅ Dashboard with "Scan QR" button
✅ Navigation flow
✅ Backend API endpoints
✅ Web QR display and polling

## Usage Flow

1. **Web:** User visits login page, clicks "Login with QR"
2. **Web:** QR code is generated and displayed
3. **Mobile:** User opens app, goes to Dashboard
4. **Mobile:** Taps "Scan QR to Login on Web"
5. **Mobile:** Camera opens, scans QR code
6. **Mobile:** App confirms QR with backend
7. **Web:** Polling detects confirmation
8. **Web:** Creates session and logs user in
9. **Both:** Success! User is logged in on web

## Error Handling

- **Expired QR:** Show "QR code expired, please refresh"
- **Invalid QR:** Show "Invalid QR code"
- **Network Error:** Show "Connection failed, try again"
- **Not Logged In:** Redirect to login on mobile
- **Already Used:** Show "QR code already used"
