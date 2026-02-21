# 🚀 Quick Start: OAuth & Phone Auth

## Your SHA-1 Fingerprint
```
CF:12:7E:87:ED:3B:F5:B1:F7:7C:8F:79:CD:3D:DC:5E:6F:AB:CB:92
```

## ⚡ 5-Minute Setup

### 1. Firebase Setup (2 minutes)
1. Go to https://console.firebase.google.com/
2. Create project → Add Android app
3. Package: `com.authplatform.app`
4. **Add SHA-1**: `CF:12:7E:87:ED:3B:F5:B1:F7:7C:8F:79:CD:3D:DC:5E:6F:AB:CB:92`
5. Download `google-services.json` → Replace in `android/app/`
6. Enable **Phone** auth in Authentication
7. Enable **Google** auth → Copy Web client ID

### 2. Update .env (1 minute)
```bash
cd /home/ankit/Desktop/auth
nano .env
```

Add:
```env
GOOGLE_CLIENT_ID="<Web client ID from Firebase>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<Web client secret>"
```

### 3. GitHub OAuth (1 minute)
1. https://github.com/settings/developers → New OAuth App
2. Callback: `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID & Secret to .env

### 4. Rebuild & Run (1 minute)
```bash
# Terminal 1: Start server
cd /home/ankit/Desktop/auth
npm run dev

# Terminal 2: Build & install app
cd /home/ankit/Desktop/auth/android
./gradlew clean assembleDebug installDebug

# Setup port forwarding
adb reverse tcp:3000 tcp:3000

# Launch
adb shell am start -n com.authplatform.app/.MainActivity
```

## 🎯 What You Get

### Phone-First Flow
- App opens → Phone number screen
- Enter phone → Receive OTP
- Verify → Logged in!

### OAuth Integration
- "Continue with Google" → Opens Chrome
- Authenticate → Redirected back
- Seamless login experience

### Account Linking
- Login with phone
- Add email/password later
- Use either method to login

## 🧪 Test Without Real Phone

Add test number in Firebase:
1. Firebase Console → Authentication → Phone
2. "Phone numbers for testing"
3. Add: `+1 650-555-1234` → Code: `123456`

Use this in app for testing!

## 📱 App Flow

```
App Start
    ↓
Phone Auth Screen
    ↓
Enter Phone Number
    ↓
Receive OTP (SMS)
    ↓
Verify OTP
    ↓
✅ Logged In
    ↓
[Optional] Link Email/Password
    ↓
Dashboard
```

## 🔗 OAuth Flow

```
Tap "Continue with Google"
    ↓
Chrome Custom Tab Opens
    ↓
Google Login Page
    ↓
Authorize App
    ↓
Redirect to Backend
    ↓
Session Created
    ↓
✅ Logged In
```

## 🐛 Quick Fixes

**Phone auth fails?**
```bash
# Check SHA-1 in Firebase matches
echo "CF:12:7E:87:ED:3B:F5:B1:F7:7C:8F:79:CD:3D:DC:5E:6F:AB:CB:92"
```

**OAuth not working?**
- Check .env has correct credentials
- Restart Next.js server
- Verify redirect URLs match

**Can't connect to server?**
```bash
adb reverse tcp:3000 tcp:3000
```

## 📚 Full Documentation

- Complete setup: `OAUTH_PHONE_SETUP.md`
- Firebase guide: `FIREBASE_SETUP.md`
- API reference: `SETUP_COMPLETE.md`

## 💡 Pro Tips

1. Use test phone numbers during development
2. Add deep links for better OAuth UX
3. Implement biometric auth after phone verification
4. Cache sessions to avoid repeated logins

## ✅ Checklist

- [ ] Firebase project created
- [ ] SHA-1 added to Firebase
- [ ] google-services.json downloaded
- [ ] Phone auth enabled
- [ ] Google auth enabled
- [ ] .env updated with credentials
- [ ] GitHub OAuth configured
- [ ] App rebuilt and installed
- [ ] Port forwarding active
- [ ] Test phone number added (optional)

## 🎉 You're Ready!

Launch the app and test:
```bash
adb shell am start -n com.authplatform.app/.MainActivity
```

The app will open with phone authentication screen. Enter a phone number and start testing!
