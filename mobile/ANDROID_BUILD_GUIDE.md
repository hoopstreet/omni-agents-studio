# Omni-Agents Studio - Android APK Build Guide

## Overview

This guide provides instructions for building and deploying the Omni-Agents Studio React Native application as an Android APK optimized for Xiaomi A5 and compatible devices.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI installed globally
- EAS CLI installed globally
- Android SDK (API 28+)
- Java Development Kit (JDK) 11+

## Installation

```bash
cd /home/ubuntu/omni-agents-mobile
npm install
npm install -g eas-cli
```

## Build Options

### Option 1: Local APK Build (Recommended for Development)

Build APK locally on your machine:

```bash
npm run build:apk
```

This generates an unsigned APK suitable for testing on Xiaomi A5 devices.

### Option 2: EAS Cloud Build (Recommended for Production)

Build APK using Expo Application Services (EAS):

```bash
eas build --platform android --profile preview
```

This generates a signed APK ready for distribution.

### Option 3: Development Build

For rapid development iteration:

```bash
npm run android
```

This starts the Expo development server and opens the app on a connected Android device or emulator.

## APK Installation on Xiaomi A5

### Method 1: Direct Installation via USB

1. Connect Xiaomi A5 to your computer via USB
2. Enable Developer Mode on the device (Settings → About → tap Build Number 7 times)
3. Enable USB Debugging (Settings → Developer Options → USB Debugging)
4. Run: `adb install path/to/app.apk`

### Method 2: File Transfer

1. Transfer the APK file to the Xiaomi A5 via USB or cloud storage
2. Open the file manager on the device
3. Locate and tap the APK file
4. Follow the installation prompts

### Method 3: QR Code Installation

1. Generate a QR code linking to the APK download URL
2. Scan the QR code on the Xiaomi A5
3. Follow the download and installation prompts

## Configuration

### Android Manifest (app.json)

The app is configured for:
- Minimum SDK: API 28 (Android 9.0)
- Target SDK: API 34 (Android 14)
- Package: com.omniagents.studio
- Permissions: Internet, Camera, Audio, Storage

### Optimization Settings

The build includes:
- ProGuard/R8 code shrinking and obfuscation
- Resource shrinking to reduce APK size
- Hermes JavaScript engine for improved performance
- Optimized bundle splitting for faster loading

## APK Size and Performance

- **Estimated APK Size:** 45-65 MB (depending on build configuration)
- **Minimum RAM Required:** 2 GB
- **Recommended RAM:** 4 GB+
- **Storage Required:** 100 MB free space

## Testing

### Unit Testing

```bash
npm test
```

### Device Testing

1. Install APK on Xiaomi A5
2. Open the app and verify:
   - Chat functionality
   - Agent listing and creation
   - Task management
   - Project navigation
   - Settings access

### Performance Testing

Monitor performance using:
- React Native Debugger
- Android Studio Profiler
- Expo DevTools

## Troubleshooting

### APK Installation Fails

- Ensure minimum API level 28 is supported on your device
- Check available storage space
- Verify the APK is not corrupted

### App Crashes on Startup

- Check the React Native logs: `adb logcat`
- Verify backend API connectivity
- Clear app cache: Settings → Apps → Omni-Agents Studio → Storage → Clear Cache

### Performance Issues

- Reduce animation complexity
- Optimize image sizes
- Enable Hermes engine
- Clear app cache and restart

## Distribution

### Google Play Store

1. Create a Google Play Developer account
2. Generate a signed APK or AAB (Android App Bundle)
3. Upload to Google Play Console
4. Configure store listing and pricing
5. Submit for review

### Direct Distribution

1. Host the APK on a web server
2. Generate a QR code for easy access
3. Share the download link with users
4. Users can install directly from the APK file

## Security

- Enable ProGuard obfuscation to protect code
- Use HTTPS for all API communications
- Implement certificate pinning for API calls
- Store sensitive data in Android Keystore
- Regularly update dependencies for security patches

## Maintenance

- Monitor crash reports via Firebase Crashlytics
- Track user analytics with Firebase Analytics
- Update dependencies regularly
- Test on multiple Android versions and devices
- Maintain backward compatibility with API 28+

## Support

For issues or questions:
1. Check the Expo documentation: https://docs.expo.dev
2. Review React Native docs: https://reactnative.dev
3. Consult Android development guides: https://developer.android.com
4. Contact Omni-Agents Studio support
