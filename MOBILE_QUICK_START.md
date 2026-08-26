# 📱 Mobile Quick Start Guide

## 🚀 Get Your App Running on Mobile in 5 Minutes

### Step 1: Build Your Web App
```bash
npm run build
```

### Step 2: Add Android Platform
```bash
npx cap add android
```

### Step 3: Open in Android Studio
```bash
npm run android
```

### Step 4: Run on Device
1. Connect your Android phone via USB
2. Enable Developer Options & USB Debugging
3. Click the green **Run** button in Android Studio

**That's it!** Your app is now running on your phone! 🎉

---

## 📋 Commands Cheat Sheet

### Development
```bash
npm run dev                    # Start web dev server
npm run build                  # Build for production
npm run build:mobile           # Build + sync to mobile
```

### Capacitor
```bash
npm run cap:sync               # Sync web code to mobile
npm run android                # Build + open Android Studio
npm run ios                    # Build + open Xcode (macOS only)
```

### Platform Management
```bash
npx cap add android            # Add Android platform
npx cap add ios                # Add iOS platform (macOS only)
npx cap sync                   # Sync all platforms
npx cap update                 # Update Capacitor
```

---

## 🔄 Typical Workflow

1. **Make changes** to your React code
2. **Build:** `npm run build`
3. **Sync:** `npm run cap:sync`
4. **Run** in Android Studio/Xcode

Or use the shortcut:
```bash
npm run build:mobile && npm run android
```

---

## 🎯 Production Builds

### Android APK/AAB
1. Open Android Studio: `npm run android`
2. **Build → Generate Signed Bundle/APK**
3. Select **Android App Bundle (AAB)**
4. Upload to Google Play Console

### iOS IPA
1. Open Xcode: `npm run ios`
2. **Product → Archive**
3. **Distribute App → App Store Connect**
4. Upload to App Store Connect

---

## 🛠️ Prerequisites

### For Android
- ✅ [Android Studio](https://developer.android.com/studio)
- ✅ Java JDK 17+

### For iOS (macOS only)
- ✅ [Xcode 14+](https://apps.apple.com/us/app/xcode/id497799835)
- ✅ CocoaPods: `sudo gem install cocoapods`
- ✅ Apple Developer Account ($99/year)

---

## 🐛 Quick Fixes

### "Command not found: cap"
```bash
npm install
```

### Build fails
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Android: White screen
```bash
npm run build
npx cap sync android
```

### iOS: Module not found
```bash
cd ios/App
pod install
cd ../..
npx cap sync ios
```

---

## 📚 Full Documentation

For detailed instructions, see:
- **[CAPACITOR_DEPLOYMENT.md](./CAPACITOR_DEPLOYMENT.md)** - Complete deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Web deployment checklist

---

## 💡 Pro Tips

- **Test on real devices** - Emulators miss issues
- **Start with Android** - Easier to set up
- **Use live reload** during development (see full guide)
- **Keep signing keys secure** - Never commit to Git
- **Update regularly:** `npm update && npx cap update`

---

**Ready to deploy?** Follow the [CAPACITOR_DEPLOYMENT.md](./CAPACITOR_DEPLOYMENT.md) guide!
