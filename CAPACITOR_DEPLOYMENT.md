# 📱 Capacitor Mobile Deployment Guide

## Overview

Your XSEVEN app is now configured with Capacitor for iOS and Android deployment. This guide covers everything from initial setup to app store submission.

---

## 🚀 Quick Start

### Prerequisites

**For Android:**
- [Android Studio](https://developer.android.com/studio) installed
- Java Development Kit (JDK) 17 or higher
- Android SDK (installed via Android Studio)

**For iOS (macOS only):**
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835) 14+ installed
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer Account ($99/year for App Store)

---

## 📦 Initial Setup

### 1. Build Your Web App

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### 2. Add Platforms

**Add Android:**
```bash
npx cap add android
```

**Add iOS (macOS only):**
```bash
npx cap add ios
```

### 3. Sync Your Code

After any web code changes, sync to native projects:

```bash
npm run cap:sync
```

Or use the convenience script:
```bash
npm run build:mobile
```

---

## 🤖 Android Development

### Open Android Studio

```bash
npm run android
```

Or manually:
```bash
npx cap open android
```

### Configure Android App

1. **Update App Info** (`android/app/build.gradle`):
   ```gradle
   android {
       defaultConfig {
           applicationId "com.mayoredoh.xseven"
           minSdkVersion 22
           targetSdkVersion 34
           versionCode 1
           versionName "1.0.0"
       }
   }
   ```

2. **App Icon & Splash Screen:**
   - Place icons in: `android/app/src/main/res/mipmap-*/`
   - Sizes needed: 48x48, 72x72, 96x96, 144x144, 192x192

3. **Permissions** (`android/app/src/main/AndroidManifest.xml`):
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   ```

### Run on Device/Emulator

1. **Connect device** or **start emulator** in Android Studio
2. Click the green **Run** button
3. Or use: `npm run cap:run:android`

### Build for Production

1. **Generate Signing Key:**
   ```bash
   keytool -genkey -v -keystore xseven-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias xseven
   ```

2. **Configure Signing** (`android/app/build.gradle`):
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('../../xseven-release-key.jks')
               storePassword 'your-password'
               keyAlias 'xseven'
               keyPassword 'your-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build APK/AAB:**
   - In Android Studio: **Build → Generate Signed Bundle/APK**
   - Select **Android App Bundle (AAB)** for Play Store
   - Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🍎 iOS Development (macOS Only)

### Open Xcode

```bash
npm run ios
```

Or manually:
```bash
npx cap open ios
```

### Configure iOS App

1. **Update App Info** (in Xcode):
   - Select **App** target
   - **General** tab:
     - Bundle Identifier: `com.mayoredoh.xseven`
     - Version: `1.0.0`
     - Build: `1`
     - Deployment Target: iOS 13.0+

2. **App Icon:**
   - Add icon set to: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Sizes: 20x20 to 1024x1024 (all required sizes)

3. **Splash Screen:**
   - Configure in: `ios/App/App/Assets.xcassets/Splash.imageset/`

4. **Permissions** (`ios/App/App/Info.plist`):
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>To take photos for posts</string>
   <key>NSPhotoLibraryUsageDescription</key>
   <string>To select photos for posts</string>
   ```

### Run on Simulator/Device

1. **Select device** in Xcode toolbar
2. Click **Run** button (▶️)
3. Or use: `npm run cap:run:ios`

### Build for Production

1. **Archive the App:**
   - In Xcode: **Product → Archive**
   - Wait for build to complete

2. **Upload to App Store Connect:**
   - Click **Distribute App**
   - Select **App Store Connect**
   - Follow prompts to upload

---

## 🔄 Development Workflow

### Making Changes

1. **Edit your React code** in `src/`
2. **Build:** `npm run build`
3. **Sync:** `npm run cap:sync`
4. **Run app** in Android Studio/Xcode

### Live Reload (Development)

For faster development, use live reload:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Update `capacitor.config.ts`:**
   ```typescript
   server: {
     url: 'http://192.168.1.X:8080', // Your local IP
     cleartext: true
   }
   ```

3. **Sync and run:**
   ```bash
   npx cap sync
   ```

4. **Remember to remove `server.url` before production build!**

---

## 🎨 Assets & Branding

### Generate Icons & Splash Screens

Use [Capacitor Assets Generator](https://github.com/ionic-team/capacitor-assets):

1. **Install:**
   ```bash
   npm install -g @capacitor/assets
   ```

2. **Prepare source images:**
   - Icon: `resources/icon.png` (1024x1024, with padding)
   - Splash: `resources/splash.png` (2732x2732, centered logo)

3. **Generate:**
   ```bash
   npx capacitor-assets generate
   ```

---

## 🌐 Environment Variables

### Production Build

Ensure your `.env` is configured for production:

```env
VITE_SUPABASE_URL=your-production-url
VITE_SUPABASE_ANON_KEY=your-production-key
```

### Multiple Environments

Create environment-specific files:
- `.env.development`
- `.env.staging`
- `.env.production`

Build with:
```bash
npm run build -- --mode production
```

---

## 📲 App Store Submission

### Google Play Store (Android)

1. **Create App** in [Google Play Console](https://play.google.com/console)
2. **Fill out store listing:**
   - Title: "Xseven"
   - Description: Your app description
   - Screenshots: 2-8 images
   - Feature graphic: 1024x500
   - App icon: 512x512

3. **Upload AAB:**
   - Go to **Production → Create new release**
   - Upload `app-release.aab`
   - Add release notes
   - Submit for review

4. **Review time:** 1-3 days

### Apple App Store (iOS)

1. **Create App** in [App Store Connect](https://appstoreconnect.apple.com)
2. **Fill out app information:**
   - Name: "Xseven"
   - Subtitle: Short description
   - Description: Full description
   - Keywords: Relevant keywords
   - Screenshots: Required for all device sizes
   - App icon: 1024x1024

3. **Upload Build:**
   - Already uploaded via Xcode Archive
   - Select build in App Store Connect

4. **Submit for review:**
   - Add review notes
   - Submit
   - Review time: 1-3 days

---

## 🔧 Troubleshooting

### Common Issues

**Build fails after adding Capacitor:**
```bash
# Clean and rebuild
rm -rf node_modules dist android ios
npm install
npm run build
npx cap add android
npx cap add ios
```

**Android: "Cleartext HTTP traffic not permitted"**
- Ensure `capacitor.config.ts` uses `https` scheme
- Or add network security config for development

**iOS: "Could not find module"**
```bash
cd ios/App
pod install
cd ../..
npx cap sync ios
```

**App crashes on startup:**
- Check console logs in Android Studio/Xcode
- Verify all environment variables are set
- Ensure Supabase URL is accessible

**White screen on mobile:**
- Check `capacitor.config.ts` has correct `webDir: 'dist'`
- Verify build completed successfully
- Check browser console in device inspector

---

## 🚀 Deployment Checklist

### Before Building

- [ ] Update version numbers in `package.json`
- [ ] Update version in `android/app/build.gradle`
- [ ] Update version in Xcode (iOS)
- [ ] Test all features on physical devices
- [ ] Verify environment variables for production
- [ ] Remove any development server URLs from config
- [ ] Test offline functionality
- [ ] Check app permissions are appropriate

### Android Checklist

- [ ] Generate signed AAB
- [ ] Test on multiple Android versions (8.0+)
- [ ] Verify app icon displays correctly
- [ ] Test splash screen
- [ ] Check app size (< 150MB recommended)
- [ ] Prepare store listing assets
- [ ] Write release notes

### iOS Checklist

- [ ] Archive builds successfully
- [ ] Test on multiple iOS versions (13.0+)
- [ ] Verify app icon displays correctly
- [ ] Test splash screen
- [ ] Check app size (< 200MB recommended)
- [ ] Prepare store listing assets
- [ ] Write release notes
- [ ] Add privacy policy URL (required)

---

## 📊 Performance Optimization

### Reduce App Size

1. **Enable code splitting** (already configured in `vite.config.ts`)
2. **Optimize images:**
   ```bash
   npm install -D vite-plugin-imagemin
   ```

3. **Remove unused dependencies:**
   ```bash
   npm prune
   ```

### Improve Load Time

1. **Enable compression** in Capacitor config
2. **Lazy load routes** in React Router
3. **Use React.lazy()** for heavy components
4. **Optimize Supabase queries**

---

## 🔐 Security Considerations

### API Keys

- ✅ Supabase keys are safe to expose (anon key)
- ✅ Use Row Level Security (RLS) in Supabase
- ❌ Never hardcode sensitive keys in code

### HTTPS

- ✅ Always use HTTPS in production
- ✅ Capacitor enforces HTTPS by default
- ✅ Configure in `capacitor.config.ts`

### App Signing

- ✅ Keep signing keys secure
- ✅ Never commit keys to Git
- ✅ Use environment variables for CI/CD

---

## 📱 Testing

### Physical Device Testing

**Android:**
1. Enable Developer Options on device
2. Enable USB Debugging
3. Connect via USB
4. Run: `npm run cap:run:android`

**iOS:**
1. Connect iPhone via USB
2. Trust computer on device
3. Select device in Xcode
4. Click Run

### Beta Testing

**Android (Google Play):**
- Use **Internal Testing** or **Closed Testing** tracks
- Share link with testers

**iOS (TestFlight):**
- Upload build to App Store Connect
- Add testers via email
- They download TestFlight app

---

## 🎯 Next Steps

1. **Add platforms:**
   ```bash
   npx cap add android
   npx cap add ios
   ```

2. **Build and sync:**
   ```bash
   npm run build:mobile
   ```

3. **Open in IDE:**
   ```bash
   npm run android  # or npm run ios
   ```

4. **Test thoroughly** on physical devices

5. **Generate production builds**

6. **Submit to app stores**

---

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [iOS Developer Guide](https://developer.apple.com/documentation/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)

---

## 💡 Tips

- **Test on real devices** - Emulators don't catch all issues
- **Start with Android** - Easier to test and deploy
- **Use TestFlight/Internal Testing** - Get feedback before public release
- **Monitor crash reports** - Use Firebase Crashlytics or similar
- **Keep Capacitor updated** - Run `npm update` regularly
- **Read app store guidelines** - Avoid rejection by following rules

---

**Need help?** Check the [Capacitor Community Forum](https://forum.ionicframework.com/c/capacitor/)
