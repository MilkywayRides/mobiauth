# Firebase Phone Auth Setup Guide

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project" or select existing project
3. Enter project name: `authplatform` (or your choice)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Add Android App to Firebase

1. In Firebase Console, click the Android icon
2. Enter package name: `com.authplatform.app`
3. Enter app nickname: `Auth Platform`
4. Enter SHA-1 certificate fingerprint:

### Get SHA-1 for Debug:
```bash
cd /home/ankit/Desktop/auth/android
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

### Get SHA-1 for Release (if needed):
```bash
keytool -list -v -keystore /path/to/your/release.keystore -alias your-alias
```

5. Click "Register app"
6. Download `google-services.json`
7. Replace the file at: `/home/ankit/Desktop/auth/android/app/google-services.json`

## Step 3: Enable Phone Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Phone** provider
3. Click **Enable**
4. Save

## Step 4: Enable Google Sign-In (for OAuth)

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Click **Enable**
4. Enter support email
5. Save
6. Copy the **Web client ID** (you'll need this)

## Step 5: Configure OAuth Consent Screen (Google Cloud)

1. Go to https://console.cloud.google.com/
2. Select your Firebase project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Choose **External** user type
5. Fill in:
   - App name: `Auth Platform`
   - User support email: your email
   - Developer contact: your email
6. Add scopes: `email`, `profile`, `openid`
7. Add test users (your email)
8. Save

## Step 6: Get OAuth Credentials

### For Google Sign-In:
1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client IDs
3. You should see:
   - **Web client** (for your Next.js backend)
   - **Android client** (auto-created by Firebase)
4. Copy the **Web client ID** and **Web client secret**

### For GitHub OAuth:
1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:
   - Application name: `Auth Platform`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy **Client ID**
6. Generate and copy **Client Secret**

## Step 7: Update Environment Variables

Update `/home/ankit/Desktop/auth/.env`:

```env
# Existing
DATABASE_URL="postgresql://ankit:ankit@localhost:5432/authdb"
BETTER_AUTH_SECRET="k8s2Fj9xLq3mNp7Rv1Ty5Wz0AeChGiKoQu4XbDfHjMl"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (use Web client credentials from Firebase)
GOOGLE_CLIENT_ID="YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_WEB_CLIENT_SECRET"

# GitHub OAuth
GITHUB_CLIENT_ID="YOUR_GITHUB_CLIENT_ID"
GITHUB_CLIENT_SECRET="YOUR_GITHUB_CLIENT_SECRET"

# Email (optional)
RESEND_API_KEY=""
EMAIL_FROM="noreply@blazeneuro.com"
```

## Step 8: Test Phone Auth

Run this command to get your SHA-1:
```bash
cd /home/ankit/Desktop/auth/android
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the SHA-1 and add it to Firebase project settings.

## Step 9: Rebuild and Test

```bash
# Rebuild Android app
cd /home/ankit/Desktop/auth/android
./gradlew clean assembleDebug installDebug

# Restart Next.js server
cd /home/ankit/Desktop/auth
npm run dev

# Launch app
adb shell am start -n com.authplatform.app/.MainActivity
```

## Important Notes

1. **For production**: Add your production SHA-1 certificate
2. **For OAuth**: The Android app will use Chrome Custom Tabs for OAuth flow
3. **Deep linking**: Configure deep links for OAuth callbacks
4. **Phone verification**: Firebase handles SMS sending automatically
5. **Rate limiting**: Firebase has built-in rate limiting for phone auth

## Troubleshooting

### Phone auth not working:
- Check SHA-1 is added to Firebase
- Verify google-services.json is correct
- Check Firebase project has Phone auth enabled

### OAuth not working:
- Verify OAuth consent screen is configured
- Check redirect URIs are correct
- Ensure test users are added (for testing phase)

### SMS not received:
- Check phone number format (+1234567890)
- Verify Firebase quota not exceeded
- Check spam folder
- Use test phone numbers in Firebase Console for testing
