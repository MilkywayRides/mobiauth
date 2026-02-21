# Firebase Phone Authentication Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enter project name: `mobiauth` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Add Android App to Firebase

1. In Firebase Console, click the Android icon
2. Enter package name: `com.authplatform.app`
3. Enter app nickname: `MobiAuth`
4. Download `google-services.json`
5. Place it in: `android/app/google-services.json`

## Step 3: Enable Phone Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Phone** provider
3. Click **Enable** toggle
4. Click **Save**

## Step 4: Add SHA-1 Certificate (Required for Phone Auth)

### Get Debug SHA-1:
```bash
cd android
./gradlew signingReport
```

Look for `SHA1:` under `Variant: debug` and copy it.

### Add to Firebase:
1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps" section
3. Click on your Android app
4. Click "Add fingerprint"
5. Paste the SHA-1 certificate
6. Click "Save"

## Step 5: Update build.gradle Files

### android/build.gradle (Project level)
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### android/app/build.gradle (App level)
Add at the bottom:
```gradle
apply plugin: 'com.google.gms.google-services'
```

## Step 6: Verify google-services.json

Make sure `android/app/google-services.json` exists and contains:
- `project_id`
- `client` array with your package name
- `api_key` array

## Step 7: Test Phone Auth

1. Build and run the app
2. Go to Phone Verification screen
3. Enter phone number with country code
4. Click "Send OTP"
5. Check your phone for SMS
6. Enter OTP code
7. Click "Verify OTP"

## Troubleshooting

### "Firebase Phone Auth not configured" error
- Verify `google-services.json` is in `android/app/`
- Check SHA-1 is added to Firebase Console
- Rebuild the app: `./gradlew clean build`

### SMS not received
- Check phone number format: `+1234567890`
- Verify Phone Auth is enabled in Firebase Console
- Check Firebase Console → Authentication → Users for test numbers

### SHA-1 Issues
- Make sure you added the debug SHA-1
- For release builds, add release SHA-1 too
- Restart Android Studio after adding SHA-1

## Test Phone Numbers (Optional)

For testing without real SMS:

1. Firebase Console → Authentication → Sign-in method
2. Scroll to "Phone numbers for testing"
3. Add test numbers like:
   - Phone: `+1 650-555-1234`
   - Code: `123456`

Now you can test without receiving real SMS!

## Current Status

The app is already configured with Firebase dependencies. You just need to:
1. ✅ Add `google-services.json` file
2. ✅ Enable Phone Auth in Firebase Console
3. ✅ Add SHA-1 certificate
4. ✅ Test the flow

That's it! Phone authentication will work after these steps.
