# 📱 XSEVEN Mobile Deployment

Your XSEVEN app is now ready for mobile deployment with **Capacitor**! This guide will help you deploy to iOS and Android app stores.

---

## 🎯 What's Been Set Up

✅ **Capacitor installed and configured**
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`
- `@capacitor/splash-screen` for native splash screens

✅ **Configuration files created**
- `capacitor.config.ts` - Main Capacitor configuration
- Updated `vite.config.ts` for mobile builds
- Updated `package.json` with mobile scripts

✅ **Build scripts added**
- `npm run build:mobile` - Build web + sync to mobile
- `npm run android` - Open Android Studio
- `npm run ios` - Open Xcode (macOS only)

✅ **Documentation created**
- `MOBILE_QUICK_START.md` - Get started in 5 minutes
- `CAPACITOR_DEPLOYMENT.md` - Complete deployment guide
- `ASSETS_GUIDE.md` - Icon and splash screen setup

---

## 🚀 Quick Start (5 Minutes)

### 1. Build Your App
```bash
npm run build
```

### 2. Add Android Platform
```bash
npx cap add android
```

### 3. Open in Android Studio
```bash
npm run android
```

### 4. Run on Your Phone
1. Connect Android device via USB
2. Enable USB Debugging
3. Click **Run** in Android Studio

**Done!** Your app is running on mobile! 🎉

---

## 📚 Documentation

| Guide | Purpose |
|-------|---------|
| **[MOBILE_QUICK_START.md](./MOBILE_QUICK_START.md)** | 5-minute setup guide |
| **[CAPACITOR_DEPLOYMENT.md](./CAPACITOR_DEPLOYMENT.md)** | Complete deployment instructions |
| **[ASSETS_GUIDE.md](./ASSETS_GUIDE.md)** | Icon & splash screen setup |
| **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** | Web deployment checklist |

---

## 📋 Available Commands

### Web Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Mobile Development
```bash
npm run build:mobile     # Build web + sync to mobile
npm run cap:sync         # Sync web code to mobile platforms
npm run android          # Build + open Android Studio
npm run ios              # Build + open Xcode (macOS only)
```

### Platform Management
```bash
npx cap add android      # Add Android platform
npx cap add ios          # Add iOS platform (macOS only)
npx cap sync             # Sync all platforms
npx cap open android     # Open Android Studio
npx cap open ios         # Open Xcode
```

---

## 🛠️ Prerequisites

### For Android Development
- ✅ [Android Studio](https://developer.android.com/studio) (includes Android SDK)
- ✅ Java Development Kit (JDK) 17 or higher
- ✅ USB cable for device testing

### For iOS Development (macOS only)
- ✅ [Xcode 14+](https://apps.apple.com/us/app/xcode/id497799835)
- ✅ CocoaPods: `sudo gem install cocoapods`
- ✅ Apple Developer Account ($99/year for App Store)

---

## 🔄 Development Workflow

### Making Changes

1. **Edit your React code** in `src/`
2. **Build:** `npm run build`
3. **Sync:** `npm run cap:sync`
4. **Run** in Android Studio/Xcode

### Quick Rebuild
```bash
npm run build:mobile && npm run android
```

### Live Reload (Development)

For faster development, you can use live reload:

1. Start dev server: `npm run dev`
2. Note your local IP (e.g., `192.168.1.X`)
3. Update `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://192.168.1.X:8080',
     cleartext: true
   }
   ```
4. Sync: `npx cap sync`
5. Run app - it will connect to your dev server

**⚠️ Remember to remove `server.url` before production builds!**

---

## 🎨 Branding & Assets

### App Icon & Splash Screen

1. **Create source images:**
   - Icon: `resources/icon.png` (1024x1024)
   - Splash: `resources/splash.png` (2732x2732)

2. **Generate all sizes:**
   ```bash
   npm install -g @capacitor/assets
   npx capacitor-assets generate
   ```

See **[ASSETS_GUIDE.md](./ASSETS_GUIDE.md)** for detailed instructions.

---

## 📲 Deploying to App Stores

### Google Play Store (Android)

1. **Build signed AAB:**
   - Open Android Studio
   - Build → Generate Signed Bundle/APK
   - Select Android App Bundle (AAB)

2. **Upload to Play Console:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create app listing
   - Upload AAB
   - Submit for review

**Review time:** 1-3 days

### Apple App Store (iOS)

1. **Archive in Xcode:**
   - Open Xcode
   - Product → Archive
   - Distribute App → App Store Connect

2. **Submit in App Store Connect:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Create app listing
   - Select build
   - Submit for review

**Review time:** 1-3 days

See **[CAPACITOR_DEPLOYMENT.md](./CAPACITOR_DEPLOYMENT.md)** for complete instructions.

---

## 🔐 Environment Variables

Your app uses Supabase. Ensure these are set:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** These are bundled into the app during build. The anon key is safe to expose (use RLS in Supabase for security).

---

## ✅ Pre-Deployment Checklist

### Before Building

- [ ] Test all features on physical devices
- [ ] Verify environment variables are correct
- [ ] Remove development server URLs from config
- [ ] Update version numbers
- [ ] Create app icons (1024x1024)
- [ ] Create splash screen (2732x2732)
- [ ] Test on multiple device sizes
- [ ] Check app permissions

### Android Specific

- [ ] Generate signing key
- [ ] Configure signing in `build.gradle`
- [ ] Test on Android 8.0+
- [ ] Prepare store listing (screenshots, description)
- [ ] Create feature graphic (1024x500)

### iOS Specific

- [ ] Configure signing in Xcode
- [ ] Test on iOS 13.0+
- [ ] Prepare store listing (screenshots, description)
- [ ] Add privacy policy URL
- [ ] Test on multiple iPhone/iPad sizes

---

## 🐛 Troubleshooting

### Common Issues

**"Command not found: cap"**
```bash
npm install
```

**Build fails**
```bash
rm -rf node_modules dist android ios
npm install
npm run build
npx cap add android
npx cap add ios
```

**White screen on mobile**
```bash
npm run build
npx cap sync
# Verify capacitor.config.ts has webDir: 'dist'
```

**Android: Cleartext HTTP error**
- Ensure `capacitor.config.ts` uses `androidScheme: 'https'`

**iOS: Module not found**
```bash
cd ios/App
pod install
cd ../..
npx cap sync ios
```

---

## 📊 App Configuration

### Current Settings

**App ID:** `com.mayoredoh.xseven`
**App Name:** `Xseven`
**Web Directory:** `dist`

### To Change

Edit `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'com.yourcompany.appname',
  appName: 'Your App Name',
  webDir: 'dist'
};
```

Then rebuild platforms:
```bash
rm -rf android ios
npx cap add android
npx cap add ios
```

---

## 🎯 Next Steps

1. **Read the quick start:** [MOBILE_QUICK_START.md](./MOBILE_QUICK_START.md)
2. **Add platforms:** `npx cap add android` and/or `npx cap add ios`
3. **Create assets:** Follow [ASSETS_GUIDE.md](./ASSETS_GUIDE.md)
4. **Test thoroughly** on real devices
5. **Follow deployment guide:** [CAPACITOR_DEPLOYMENT.md](./CAPACITOR_DEPLOYMENT.md)
6. **Submit to stores**

---

## 📞 Support & Resources

### Documentation
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [iOS Developer Guide](https://developer.apple.com/documentation/)

### Community
- [Capacitor Forum](https://forum.ionicframework.com/c/capacitor/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/capacitor)

### Tools
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Supabase Dashboard](https://app.supabase.com)

---

## 💡 Pro Tips

1. **Start with Android** - Easier to set up and test
2. **Test on real devices** - Emulators don't catch everything
3. **Use TestFlight/Internal Testing** - Get feedback before public launch
4. **Monitor analytics** - Use Firebase or similar
5. **Keep Capacitor updated** - Run `npx cap update` regularly
6. **Read store guidelines** - Avoid rejection

---

## 📝 Version History

- **v1.0.0** - Initial Capacitor setup
  - Android and iOS support added
  - Build scripts configured
  - Documentation created

---

**Ready to deploy?** Start with [MOBILE_QUICK_START.md](./MOBILE_QUICK_START.md)! 🚀
