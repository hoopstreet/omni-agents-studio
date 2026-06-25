# Omni-Agents Studio Mobile - Deployment Setup

## Overview

This document outlines the complete deployment setup for the Omni-Agents Studio mobile application, including CI/CD pipeline, APK generation, and GitHub synchronization.

## Prerequisites

- GitHub account with repository access
- Expo account (https://expo.dev)
- Android keystore for signing APKs
- GitHub Secrets configured

## GitHub Setup

### 1. Create GitHub Repository

```bash
# Initialize repository
cd /home/ubuntu/omni-agents-mobile
git init
git remote add origin https://github.com/YOUR_USERNAME/omni-agents-studio-mobile.git
git branch -M main
git add .
git commit -m "Initial commit: Omni-Agents Studio Mobile App"
git push -u origin main
```

### 2. Configure GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `EXPO_TOKEN` | Your Expo token | For Expo CLI authentication |
| `GITHUB_TOKEN` | Auto-generated | For GitHub Actions |
| `SLACK_WEBHOOK_URL` | Slack webhook URL | For notifications (optional) |
| `ANDROID_KEYSTORE_BASE64` | Base64 encoded keystore | For APK signing |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password | For APK signing |
| `ANDROID_KEY_ALIAS` | Key alias | For APK signing |
| `ANDROID_KEY_PASSWORD` | Key password | For APK signing |

### 3. Create Android Keystore

```bash
# Generate keystore (run once)
keytool -genkey -v -keystore omni-agents.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias omni-agents-key

# Encode to Base64 for GitHub Secrets
base64 -i omni-agents.keystore | pbcopy
```

## CI/CD Pipeline

### Build Workflow (build-apk.yml)

**Triggers:**
- Push to `main` or `develop` branches
- Tag push (v*.*.*)
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Configure Expo credentials
5. Build APK with EAS
6. Upload artifacts
7. Create GitHub Release (on tag)
8. Notify Slack (on failure)

### Test Workflow (test-and-lint.yml)

**Triggers:**
- Push to `main` or `develop`
- Pull requests

**Jobs:**
- **Lint:** ESLint, Prettier
- **Test:** Jest tests
- **Security:** npm audit, Snyk scan

## Automated Deployment

### Release Process

1. **Create a tag:**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. **GitHub Actions automatically:**
   - Builds APK
   - Creates GitHub Release
   - Uploads APK as release asset
   - Sends Slack notification

3. **Download APK:**
   - Go to Releases page
   - Download APK from release assets
   - Transfer to Android device

### Continuous Deployment

**Main Branch:**
- Builds on every push
- Artifacts available for 90 days
- Can be manually downloaded

**Develop Branch:**
- Builds on every push
- Used for testing and staging
- Separate artifact storage

## Manual Build Process

### Local Build

```bash
# Install dependencies
npm install

# Build APK locally
npm run build:apk

# APK will be in dist/ directory
```

### Expo EAS Build

```bash
# Login to Expo
expo login

# Build APK
eas build --platform android

# Download APK when ready
```

## APK Installation on Android

### Method 1: USB Transfer

```bash
# Connect Android device via USB
adb devices

# Transfer APK
adb push omni-agents.apk /sdcard/Download/

# Install APK
adb install /sdcard/Download/omni-agents.apk
```

### Method 2: Direct Download

1. Enable Unknown Sources (Settings → Security)
2. Download APK from GitHub Release
3. Open file manager
4. Tap APK file to install

### Method 3: QR Code

1. Generate QR code linking to APK download URL
2. Scan with Android device
3. Download and install

## GitHub Sync Configuration

### Automatic Sync

The repository automatically syncs when:
- Code is pushed to GitHub
- Pull requests are merged
- Tags are created

### Manual Sync

```bash
# Pull latest changes
git pull origin main

# Push local changes
git push origin main

# Sync with upstream
git fetch upstream
git merge upstream/main
```

## Monitoring and Notifications

### GitHub Actions Dashboard

- View build status: **Actions** tab
- Check logs: Click on workflow run
- Download artifacts: Click on artifact
- View releases: **Releases** page

### Slack Notifications

Receive notifications for:
- ✅ Successful builds
- ❌ Failed builds
- 🔖 New releases
- ⚠️ Security alerts

## Troubleshooting

### Build Failures

**Issue:** "Expo token not found"
```bash
# Solution: Add EXPO_TOKEN to GitHub Secrets
# Or login locally: expo login
```

**Issue:** "Keystore not found"
```bash
# Solution: Encode keystore and add to GitHub Secrets
base64 -i omni-agents.keystore
```

### APK Installation Issues

**Issue:** "App not installed"
```bash
# Solution: Check Android version compatibility
# Minimum API 28 required
```

**Issue:** "Unknown sources disabled"
```bash
# Solution: Enable in Settings → Security → Unknown Sources
```

## Production Checklist

- [ ] GitHub repository created and configured
- [ ] GitHub Secrets added
- [ ] Android keystore generated and encoded
- [ ] CI/CD workflows tested
- [ ] APK builds successfully
- [ ] APK installs on test device
- [ ] App connects to backend API
- [ ] All features tested
- [ ] Release notes prepared
- [ ] Version bumped in package.json
- [ ] Tag created and pushed
- [ ] GitHub Release created
- [ ] APK distributed to users

## Version Management

### Semantic Versioning

Use format: `MAJOR.MINOR.PATCH`

```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features)
npm version minor

# Major release (breaking changes)
npm version major

# Push version tag
git push origin --tags
```

## Rollback Procedure

```bash
# If build is broken, revert to previous version
git revert <commit-hash>
git push origin main

# Or checkout previous tag
git checkout v1.0.0
git push origin main
```

## Performance Optimization

### APK Size Optimization

- Enable ProGuard/R8 minification
- Remove unused dependencies
- Optimize images and assets
- Use code splitting

### Build Time Optimization

- Cache dependencies
- Parallel builds
- Incremental builds
- Use faster runners

## Security Best Practices

1. **Never commit secrets** - Use GitHub Secrets
2. **Sign APKs** - Use keystore for production
3. **Verify releases** - Check signatures
4. **Audit dependencies** - Run npm audit regularly
5. **Keep dependencies updated** - Use dependabot
6. **Review PRs** - Require code review before merge

## Support and Documentation

- **Expo Docs:** https://docs.expo.dev
- **GitHub Actions:** https://docs.github.com/actions
- **React Native:** https://reactnative.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/

## Next Steps

1. Create GitHub repository
2. Configure GitHub Secrets
3. Generate Android keystore
4. Push code to GitHub
5. Monitor first build
6. Test APK on device
7. Create GitHub Release
8. Distribute to users
