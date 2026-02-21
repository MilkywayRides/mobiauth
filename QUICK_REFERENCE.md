# 🎯 Quick Reference Card

## Your SHA-1 Fingerprint
```
CF:12:7E:87:ED:3B:F5:B1:F7:7C:8F:79:CD:3D:DC:5E:6F:AB:CB:92
```

## Firebase Setup URLs
- Console: https://console.firebase.google.com/
- Google Cloud: https://console.cloud.google.com/
- GitHub OAuth: https://github.com/settings/developers

## Package Name
```
com.authplatform.app
```

## OAuth Callback URLs
```
Google: http://localhost:3000/api/auth/callback/google
GitHub: http://localhost:3000/api/auth/callback/github
```

## Test Phone Number (Add in Firebase)
```
Phone: +1 650-555-1234
Code: 123456
```

## Quick Commands
```bash
# Build & Install
cd /home/ankit/Desktop/auth/android
./gradlew installDebug

# Port Forwarding
adb reverse tcp:3000 tcp:3000

# Launch App
adb shell am start -n com.authplatform.app/.MainActivity

# View Logs
adb logcat | grep -i auth

# Restart Server
cd /home/ankit/Desktop/auth
npm run dev
```

## .env Template
```env
DATABASE_URL="postgresql://ankit:ankit@localhost:5432/authdb"
BETTER_AUTH_SECRET="k8s2Fj9xLq3mNp7Rv1Ty5Wz0AeChGiKoQu4XbDfHjMl"
BETTER_AUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="<YOUR_WEB_CLIENT_ID>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<YOUR_WEB_CLIENT_SECRET>"

GITHUB_CLIENT_ID="<YOUR_GITHUB_CLIENT_ID>"
GITHUB_CLIENT_SECRET="<YOUR_GITHUB_CLIENT_SECRET>"
```

## Setup Checklist
- [ ] Firebase project created
- [ ] SHA-1 added to Firebase
- [ ] google-services.json downloaded & replaced
- [ ] Phone auth enabled in Firebase
- [ ] Google auth enabled in Firebase
- [ ] Web client ID copied
- [ ] GitHub OAuth app created
- [ ] .env file updated
- [ ] Next.js server running
- [ ] App rebuilt & installed
- [ ] Port forwarding active

## Documentation Files
- `QUICK_START.md` - 5-minute setup
- `OAUTH_PHONE_SETUP.md` - Complete guide
- `FIREBASE_SETUP.md` - Firebase details
- `IMPLEMENTATION_COMPLETE.md` - What's been done
- `SETUP_COMPLETE.md` - Original setup

## App Features
✅ Phone authentication (Firebase)
✅ Google OAuth (Chrome Custom Tabs)
✅ GitHub OAuth (Chrome Custom Tabs)
✅ Account linking (phone + email)
✅ Session management
✅ Secure token storage

## Support
Run setup script: `./setup-firebase.sh`
Check logs: `adb logcat | grep -i auth`
