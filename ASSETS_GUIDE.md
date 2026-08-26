# 🎨 Mobile Assets Guide

## 📱 Required Assets for Mobile Apps

### App Icon

**Source File Requirements:**
- **Size:** 1024x1024 pixels
- **Format:** PNG with transparency
- **Design:** Simple, recognizable at small sizes
- **Padding:** 10% margin from edges (safe area)

**Where to place:**
- Save as: `resources/icon.png`

### Splash Screen

**Source File Requirements:**
- **Size:** 2732x2732 pixels
- **Format:** PNG
- **Design:** Logo centered, simple background
- **Safe Area:** Keep important content in center 1200x1200

**Where to place:**
- Save as: `resources/splash.png`

---

## 🚀 Quick Setup

### Option 1: Automatic Generation (Recommended)

1. **Install Capacitor Assets:**
   ```bash
   npm install -g @capacitor/assets
   ```

2. **Create source images:**
   - `resources/icon.png` (1024x1024)
   - `resources/splash.png` (2732x2732)

3. **Generate all sizes:**
   ```bash
   npx capacitor-assets generate
   ```

This automatically creates all required sizes for iOS and Android!

### Option 2: Manual Setup

#### Android Icons
Place in `android/app/src/main/res/`:

```
mipmap-mdpi/ic_launcher.png          (48x48)
mipmap-hdpi/ic_launcher.png          (72x72)
mipmap-xhdpi/ic_launcher.png         (96x96)
mipmap-xxhdpi/ic_launcher.png        (144x144)
mipmap-xxxhdpi/ic_launcher.png       (192x192)
```

#### iOS Icons
Place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:

```
icon-20.png, icon-20@2x.png, icon-20@3x.png
icon-29.png, icon-29@2x.png, icon-29@3x.png
icon-40.png, icon-40@2x.png, icon-40@3x.png
icon-60@2x.png, icon-60@3x.png
icon-76.png, icon-76@2x.png
icon-83.5@2x.png
icon-1024.png
```

---

## 🎨 Design Guidelines

### App Icon Best Practices

✅ **Do:**
- Use simple, bold designs
- Test at 48x48 to ensure clarity
- Use consistent branding
- Consider dark/light backgrounds
- Use PNG with transparency

❌ **Don't:**
- Add text (hard to read at small sizes)
- Use photos (doesn't scale well)
- Include rounded corners (platforms add them)
- Use gradients excessively

### Splash Screen Best Practices

✅ **Do:**
- Keep it simple and fast-loading
- Use your brand colors
- Center your logo
- Match your app's theme
- Test on various screen sizes

❌ **Don't:**
- Add too much detail
- Use animations (not supported)
- Include text (may be cut off)
- Make it too bright/dark

---

## 🛠️ Tools & Resources

### Design Tools
- **Figma** - Free, web-based
- **Adobe Illustrator** - Professional vector design
- **Sketch** - macOS only
- **Affinity Designer** - One-time purchase

### Icon Generators
- [App Icon Generator](https://www.appicon.co/)
- [MakeAppIcon](https://makeappicon.com/)
- [Icon Kitchen](https://icon.kitchen/)

### Splash Screen Generators
- [Ape Tools](https://apetools.webprofusion.com/app/#/tools/imagegorilla)
- [App Splash Screen Generator](https://www.appsplashscreen.com/)

---

## 📐 Size Reference

### Android Icon Sizes
| Density | Size | Folder |
|---------|------|--------|
| mdpi | 48x48 | mipmap-mdpi |
| hdpi | 72x72 | mipmap-hdpi |
| xhdpi | 96x96 | mipmap-xhdpi |
| xxhdpi | 144x144 | mipmap-xxhdpi |
| xxxhdpi | 192x192 | mipmap-xxxhdpi |

### iOS Icon Sizes
| Purpose | Size | Filename |
|---------|------|----------|
| Settings | 29x29 | icon-29.png |
| Spotlight | 40x40 | icon-40.png |
| App | 60x60 | icon-60.png |
| iPad | 76x76 | icon-76.png |
| iPad Pro | 83.5x83.5 | icon-83.5@2x.png |
| App Store | 1024x1024 | icon-1024.png |

---

## 🎯 Current Setup

Your app currently uses:
- **Favicon:** `public/favicon.svg`
- **Placeholder:** `public/placeholder.svg`

### Next Steps:

1. **Create high-res icon** (1024x1024)
2. **Create splash screen** (2732x2732)
3. **Use automatic generator** or manual placement
4. **Test on devices** to verify appearance

---

## 🔄 Updating Assets

After changing icons/splash screens:

```bash
# Rebuild and sync
npm run build
npx cap sync

# Or use shortcut
npm run build:mobile
```

Then reopen in Android Studio/Xcode and run.

---

## 📱 Platform-Specific Notes

### Android
- **Adaptive Icons:** Android 8.0+ supports adaptive icons
- **Round Icons:** Some launchers use round icons
- **Notification Icon:** Needs separate monochrome icon

### iOS
- **Dark Mode:** Consider providing dark mode variants
- **App Store:** Requires 1024x1024 icon without transparency
- **Launch Screen:** iOS uses storyboard, not just images

---

## ✅ Asset Checklist

Before submitting to app stores:

- [ ] App icon created (1024x1024)
- [ ] Splash screen created (2732x2732)
- [ ] All sizes generated
- [ ] Icons tested on real devices
- [ ] Splash screen tested on real devices
- [ ] Icons look good on light/dark backgrounds
- [ ] No copyright issues with images
- [ ] Assets optimized for file size

---

## 💡 Quick Tips

1. **Start with vector** - Create in SVG, export to PNG
2. **Test early** - Check on real devices often
3. **Keep it simple** - Less is more for icons
4. **Brand consistency** - Match your web app
5. **File size matters** - Optimize PNGs with tools like TinyPNG

---

## 🆘 Troubleshooting

**Icon not updating:**
- Clean build: Delete `android/` and `ios/` folders
- Rebuild: `npx cap add android` / `npx cap add ios`
- Clear cache on device

**Splash screen not showing:**
- Verify `@capacitor/splash-screen` is installed
- Check `capacitor.config.ts` configuration
- Rebuild and sync

**Wrong icon showing:**
- Check all icon sizes are present
- Verify file names match platform requirements
- Clear app cache on device

---

**Need help?** Check the [Capacitor Assets Documentation](https://github.com/ionic-team/capacitor-assets)
