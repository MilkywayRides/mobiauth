# Complete OAuth & Phone Auth Setup Guide

## 🎯 Overview

This guide will help you set up:
1. **Firebase Phone Authentication** - OTP-based login
2. **Google OAuth** - Native Google Sign-In
3. **GitHub OAuth** - GitHub authentication
4. **Account Linking** - Link phone number with email/password

## 📱 Phone-First Flow

The app now starts with phone authentication:
1. User enters phone number
2. Receives OTP via SMS
3. Verifies OTP
4. Can optionally link email/password to account

## 🔧 Setup Instructions

### Step 1: Get SHA-1 Fingerprint

Run the setup script:
```bash
cd /home/ankit/Desktop/auth
./setup-firebase.sh
```

Or manually:
```bash
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

Copy the SHA-1 fingerprint (format: `XX:XX:XX:...`)

### Step 2: Firebase Console Setup

1. **Create/Select Project**
   - Go to https://console.firebase.google.com/
   - Create new project: "Auth Platform" (or use existing)

2. **Add Android App**
   - Click Android icon
   - Package name: `com.authplatform.app`
   - App nickname: `Auth Platform`
   - **Paste your SHA-1 fingerprint**
   - Click "Register app"

3. **Download google-services.json**
   - Download the file
   - Replace: `/home/ankit/Desktop/auth/android/app/google-services.json`

4. **Enable Phone Authentication**
   - Go to **Authentication** → **Sign-in method**
   - Click **Phone** → Enable → Save

5. **Enable Google Sign-In**
   - Click **Google** → Enable
   - Enter support email
   - Save
   - **Copy the Web client ID** (you'll need this)

### Step 3: Google Cloud Console (for OAuth)

1. Go to https://console.cloud.google.com/
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Find your **Web client** OAuth 2.0 Client ID
5. Copy:
   - Client ID (ends with `.apps.googleusercontent.com`)
   - Client secret (click to reveal)

### Step 4: GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: `Auth Platform`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy **Client ID**
6. Click **Generate a new client secret**
7. Copy **Client Secret**

### Step 5: Update Environment Variables

Edit `/home/ankit/Desktop/auth/.env`:

```env
# Database
DATABASE_URL="postgresql://ankit:ankit@localhost:5432/authdb"

# Better Auth
BETTER_AUTH_SECRET="k8s2Fj9xLq3mNp7Rv1Ty5Wz0AeChGiKoQu4XbDfHjMl"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (use Web client from Firebase/Google Cloud)
GOOGLE_CLIENT_ID="YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_WEB_CLIENT_SECRET"

# GitHub OAuth
GITHUB_CLIENT_ID="YOUR_GITHUB_CLIENT_ID"
GITHUB_CLIENT_SECRET="YOUR_GITHUB_CLIENT_SECRET"

# Email (optional - for email verification)
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"
```

### Step 6: Rebuild and Deploy

```bash
# Restart Next.js server
cd /home/ankit/Desktop/auth
npm run dev

# Rebuild Android app
cd android
./gradlew clean assembleDebug installDebug

# Setup port forwarding
adb reverse tcp:3000 tcp:3000

# Launch app
adb shell am start -n com.authplatform.app/.MainActivity
```

## 🔐 How OAuth Works in the App

### Google/GitHub Sign-In Flow:

1. User taps "Continue with Google/GitHub"
2. App opens Chrome Custom Tab with OAuth URL
3. User authenticates in browser
4. Browser redirects to callback URL
5. Backend creates session
6. User is redirected back to app

### Deep Link Setup (for seamless OAuth):

Add to `AndroidManifest.xml`:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="authplatform"
        android:host="callback" />
</intent-filter>
```

Update OAuth callback URLs:
- Google: `authplatform://callback/google`
- GitHub: `authplatform://callback/github`

## 📲 Phone Authentication

### How it works:

1. **Firebase handles SMS sending** - No backend code needed
2. **Automatic verification** - If SMS is detected automatically
3. **Manual OTP entry** - User can enter 6-digit code
4. **Backend verification** - Firebase token verified on server

### Test Phone Numbers (for development):

Add test numbers in Firebase Console:
- Go to **Authentication** → **Sign-in method** → **Phone**
- Scroll to "Phone numbers for testing"
- Add: `+1 650-555-1234` with code `123456`

## 🔗 Account Linking

After phone authentication, users can link email/password:

```kotlin
// In your app
viewModel.linkAccount(
    email = "user@example.com",
    password = "SecurePass123!",
    phoneNumber = "+1234567890"
)
```

Backend will:
1. Verify user is authenticated
2. Add email/password to existing account
3. User can now login with either phone OR email

## 🧪 Testing

### Test Phone Auth:
```bash
# Use test number in Firebase Console
Phone: +1 650-555-1234
OTP: 123456
```

### Test OAuth:
1. Make sure OAuth consent screen has test users added
2. Use test user email for Google/GitHub
3. Check browser console for any errors

### Test Account Linking:
1. Login with phone
2. Go to profile/settings
3. Add email/password
4. Logout and login with email

## 🚀 Production Checklist

- [ ] Add production SHA-1 certificate to Firebase
- [ ] Update OAuth redirect URLs to production domain
- [ ] Enable OAuth consent screen for public use
- [ ] Set up proper email provider (Resend/SendGrid)
- [ ] Configure rate limiting for phone auth
- [ ] Add phone number verification for sensitive operations
- [ ] Implement 2FA for admin accounts
- [ ] Set up monitoring and logging

## 🐛 Troubleshooting

### Phone auth not working:
```bash
# Check SHA-1 is correct
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android

# Verify google-services.json is correct
cat android/app/google-services.json | grep project_id

# Check Firebase logs
adb logcat | grep -i firebase
```

### OAuth not working:
- Verify redirect URIs match exactly
- Check OAuth consent screen is configured
- Ensure test users are added (for testing phase)
- Check browser console for errors

### SMS not received:
- Verify phone number format: `+[country code][number]`
- Check Firebase quota (free tier: 10k/month)
- Use test phone numbers for development
- Check spam folder

## 📚 API Endpoints

### Phone Auth:
```
POST /api/auth/phone/verify
Body: { firebaseIdToken, phoneNumber }
```

### Account Linking:
```
POST /api/auth/link-account
Body: { email, password, phoneNumber }
Headers: { Cookie: session_token }
```

### OAuth:
```
GET /api/auth/sign-in/social/google
GET /api/auth/sign-in/social/github
GET /api/auth/callback/google?code=...
GET /api/auth/callback/github?code=...
```

## 💡 Tips

1. **Use test phone numbers** during development to avoid SMS costs
2. **Add deep links** for seamless OAuth flow
3. **Implement biometric auth** after phone verification
4. **Cache OAuth tokens** to avoid repeated logins
5. **Add phone number verification** before sensitive operations

## 🔒 Security Best Practices

1. **Never store passwords** in plain text
2. **Use HTTPS** in production
3. **Implement rate limiting** on auth endpoints
4. **Validate phone numbers** on backend
5. **Use secure session tokens**
6. **Implement CSRF protection**
7. **Add device fingerprinting** for suspicious activity
8. **Log all authentication attempts**

## 📞 Support

If you encounter issues:
1. Check Firebase Console logs
2. Check Android logcat: `adb logcat | grep -i auth`
3. Check Next.js server logs
4. Verify all environment variables are set
5. Ensure port forwarding is active: `adb reverse tcp:3000 tcp:3000`
