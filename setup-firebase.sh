#!/bin/bash

# Firebase Setup Script for Auth Platform

echo "🔥 Firebase Setup for Auth Platform"
echo "===================================="
echo ""

# Get SHA-1 fingerprint
echo "📱 Getting SHA-1 fingerprint for debug keystore..."
SHA1=$(keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep "SHA1:" | cut -d' ' -f3)

if [ -z "$SHA1" ]; then
    echo "❌ Could not find debug keystore. Creating one..."
    keytool -genkey -v -keystore ~/.android/debug.keystore -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"
    SHA1=$(keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep "SHA1:" | cut -d' ' -f3)
fi

echo "✅ SHA-1 Fingerprint: $SHA1"
echo ""

echo "📋 Setup Steps:"
echo ""
echo "1. Go to https://console.firebase.google.com/"
echo "2. Create a new project or select existing"
echo "3. Add Android app with package name: com.authplatform.app"
echo "4. Add this SHA-1 certificate: $SHA1"
echo "5. Download google-services.json"
echo "6. Replace: /home/ankit/Desktop/auth/android/app/google-services.json"
echo ""
echo "7. Enable Authentication:"
echo "   - Go to Authentication → Sign-in method"
echo "   - Enable Phone"
echo "   - Enable Google (copy Web client ID)"
echo ""
echo "8. Update .env file with:"
echo "   GOOGLE_CLIENT_ID=<Web client ID from Firebase>"
echo "   GOOGLE_CLIENT_SECRET=<Web client secret>"
echo ""
echo "9. For GitHub OAuth:"
echo "   - Go to https://github.com/settings/developers"
echo "   - Create OAuth App"
echo "   - Callback URL: http://localhost:3000/api/auth/callback/github"
echo "   - Add credentials to .env"
echo ""

read -p "Press Enter when you've completed Firebase setup..."

echo ""
echo "🔄 Rebuilding Android app..."
cd /home/ankit/Desktop/auth/android
./gradlew clean assembleDebug installDebug

echo ""
echo "✅ Setup complete! Launch the app:"
echo "   adb shell am start -n com.authplatform.app/.MainActivity"
