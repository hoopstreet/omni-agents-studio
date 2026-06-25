# GitHub Deployment & Sync Guide

## Complete End-to-End Deployment for Omni-Agents Studio Mobile

This guide walks you through deploying the Omni-Agents Studio mobile application to GitHub with automatic CI/CD pipeline, APK generation, and continuous deployment.

---

## 📋 Table of Contents

1. [GitHub Setup](#github-setup)
2. [Repository Configuration](#repository-configuration)
3. [GitHub Secrets](#github-secrets)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Automated Builds](#automated-builds)
6. [Release Management](#release-management)
7. [Automatic Sync](#automatic-sync)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

---

## GitHub Setup

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **New Repository**
3. Fill in details:
   - **Repository name:** `omni-agents-studio-mobile`
   - **Description:** Omni-Agents Studio Mobile App - React Native
   - **Visibility:** Public (or Private)
   - **Initialize with README:** No (we have our own)
4. Click **Create Repository**

### Step 2: Get Repository URL

```bash
# HTTPS URL (recommended)
https://github.com/YOUR_USERNAME/omni-agents-studio-mobile.git

# SSH URL (if SSH keys configured)
git@github.com:YOUR_USERNAME/omni-agents-studio-mobile.git
```

### Step 3: Add Remote and Push

```bash
cd /home/ubuntu/omni-agents-studio-mobile

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/omni-agents-studio-mobile.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## Repository Configuration

### Branch Protection Rules

1. Go to **Settings → Branches**
2. Click **Add rule**
3. Configure for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Dismiss stale pull request approvals
   - ✅ Require code review before merging

### Default Branch

1. Go to **Settings → Branches**
2. Set **Default branch** to `main`

### Collaborators

1. Go to **Settings → Collaborators**
2. Add team members with appropriate permissions

---

## GitHub Secrets

### Required Secrets

Go to **Settings → Secrets and variables → Actions** and add:

#### 1. Expo Token

```
Name: EXPO_TOKEN
Value: <Your Expo personal access token>
```

Get token from https://expo.dev/settings/tokens

#### 2. Android Keystore (Base64)

```bash
# Generate keystore (if not exists)
keytool -genkey -v -keystore omni-agents.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias omni-agents-key

# Encode to Base64
base64 -i omni-agents.keystore > keystore.b64

# Copy content to GitHub Secret
```

```
Name: ANDROID_KEYSTORE_BASE64
Value: <Base64 encoded keystore content>
```

#### 3. Keystore Passwords

```
Name: ANDROID_KEYSTORE_PASSWORD
Value: <Your keystore password>

Name: ANDROID_KEY_ALIAS
Value: omni-agents-key

Name: ANDROID_KEY_PASSWORD
Value: <Your key password>
```

#### 4. Slack Webhook (Optional)

```
Name: SLACK_WEBHOOK_URL
Value: <Your Slack webhook URL>
```

Get from https://api.slack.com/messaging/webhooks

#### 5. Snyk Token (Optional)

```
Name: SNYK_TOKEN
Value: <Your Snyk API token>
```

Get from https://snyk.io/account/settings/

---

## CI/CD Pipeline

### Build Workflow (build-apk.yml)

**Location:** `.github/workflows/build-apk.yml`

**Triggers:**
- Push to `main` or `develop`
- Pull requests
- Manual dispatch
- Version tags (v*.*.*)

**Steps:**
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Configure Expo
5. Build APK
6. Upload artifacts
7. Create release (on tag)
8. Notify Slack

### Test Workflow (test-and-lint.yml)

**Location:** `.github/workflows/test-and-lint.yml`

**Triggers:**
- Push to `main` or `develop`
- Pull requests

**Jobs:**
- Lint (ESLint, Prettier)
- Test (Jest)
- Security (npm audit, Snyk)

---

## Automated Builds

### Automatic Build on Push

```bash
# Push to main - automatically builds
git push origin main

# Check build status
# Go to Actions tab → Latest workflow run
```

### Manual Build Trigger

1. Go to **Actions** tab
2. Select **Build and Release APK** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

### Build Artifacts

After successful build:
1. Go to **Actions** tab
2. Click on workflow run
3. Scroll to **Artifacts**
4. Download `omni-agents-apk`

---

## Release Management

### Creating a Release

#### Method 1: Git Tags (Recommended)

```bash
# Create version tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag to GitHub
git push origin v1.0.0

# GitHub Actions automatically:
# - Builds APK
# - Creates Release
# - Uploads APK as asset
# - Sends Slack notification
```

#### Method 2: GitHub UI

1. Go to **Releases** page
2. Click **Create a new release**
3. Fill in:
   - **Tag version:** v1.0.0
   - **Release title:** Version 1.0.0
   - **Description:** Release notes
4. Upload APK file
5. Click **Publish release**

### Release Naming Convention

```
v<MAJOR>.<MINOR>.<PATCH>

Examples:
v1.0.0 - Initial release
v1.0.1 - Bug fix
v1.1.0 - New features
v2.0.0 - Major update
```

### Release Notes Template

```markdown
# Omni-Agents Studio v1.0.0

## New Features
- Feature 1
- Feature 2

## Bug Fixes
- Fix 1
- Fix 2

## Improvements
- Improvement 1
- Improvement 2

## Downloads
- [omni-agents-v1.0.0.apk](link)

## Installation
1. Download APK
2. Enable Unknown Sources
3. Install APK
```

---

## Automatic Sync

### Using Sync Script

```bash
# Make script executable
chmod +x /home/ubuntu/omni-agents-studio-mobile/scripts/sync-github.sh

# Run sync
./scripts/sync-github.sh

# Or with custom message
./scripts/sync-github.sh "Update: New features added"
```

### Scheduled Sync (Cron)

Add to crontab:

```bash
# Sync every hour
0 * * * * cd /home/ubuntu/omni-agents-studio-mobile && ./scripts/sync-github.sh

# Sync every 6 hours
0 */6 * * * cd /home/ubuntu/omni-agents-studio-mobile && ./scripts/sync-github.sh

# Sync daily at 2 AM
0 2 * * * cd /home/ubuntu/omni-agents-studio-mobile && ./scripts/sync-github.sh
```

### Manual Sync

```bash
# Pull latest changes
git pull origin main

# Make changes
# ... edit files ...

# Stage changes
git add .

# Commit
git commit -m "Update: Description of changes"

# Push to GitHub
git push origin main
```

---

## Monitoring

### GitHub Actions Dashboard

1. Go to **Actions** tab
2. View all workflow runs
3. Click on run to see details
4. Check logs for errors

### Build Status Badge

Add to README.md:

```markdown
![Build Status](https://github.com/YOUR_USERNAME/omni-agents-studio-mobile/workflows/Build%20and%20Release%20APK/badge.svg)
```

### Notifications

- **Email:** GitHub sends notifications automatically
- **Slack:** Configure webhook for real-time alerts
- **GitHub:** Check Actions tab for status

### Monitoring Checklist

- [ ] Build status passing
- [ ] Tests passing
- [ ] No security vulnerabilities
- [ ] APK size acceptable
- [ ] Release notes updated
- [ ] Changelog maintained

---

## Troubleshooting

### Build Failures

**Issue:** "Expo token not found"
```
Solution:
1. Go to Settings → Secrets
2. Add EXPO_TOKEN secret
3. Retry build
```

**Issue:** "Keystore not found"
```
Solution:
1. Generate keystore locally
2. Encode to Base64
3. Add ANDROID_KEYSTORE_BASE64 secret
4. Retry build
```

**Issue:** "Dependencies not found"
```
Solution:
1. Check package.json
2. Run npm install locally
3. Commit package-lock.json
4. Retry build
```

### Push Failures

**Issue:** "Permission denied"
```
Solution:
1. Check GitHub credentials
2. Verify SSH key (if using SSH)
3. Use HTTPS with personal access token
```

**Issue:** "Rejected - not fast forward"
```
Solution:
git pull origin main --rebase
git push origin main
```

### Release Issues

**Issue:** "Release not created"
```
Solution:
1. Check tag format (v*.*.*)
2. Verify tag pushed: git push origin v1.0.0
3. Check workflow logs
```

**Issue:** "APK not attached to release"
```
Solution:
1. Check build succeeded
2. Verify APK generated
3. Check release workflow
```

---

## Best Practices

### Commit Messages

```
Format: <type>: <subject>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style
- refactor: Code refactor
- perf: Performance
- test: Tests
- chore: Maintenance

Examples:
feat: Add offline support
fix: Fix chat message sync
docs: Update API integration guide
```

### Branch Strategy

```
main (production)
  ↑
  └── develop (staging)
        ↑
        └── feature/* (features)
        └── bugfix/* (bug fixes)
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Push to GitHub
4. Create Pull Request
5. Wait for checks to pass
6. Request review
7. Merge to main
8. Delete branch

### Version Bumping

```bash
# Patch (bug fixes)
npm version patch

# Minor (new features)
npm version minor

# Major (breaking changes)
npm version major

# Push version tag
git push origin --tags
```

---

## Advanced Configuration

### Environment Variables

Create `.env` file (not committed):

```
EXPO_TOKEN=<token>
ANDROID_KEYSTORE_PASSWORD=<password>
ANDROID_KEY_PASSWORD=<password>
```

### Custom Build Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "build:apk": "eas build --platform android",
    "build:aab": "eas build --platform android --app-variant release",
    "build:preview": "eas build --platform android --profile preview"
  }
}
```

### Webhook Integration

Configure webhook for external services:

1. Go to **Settings → Webhooks**
2. Add webhook URL
3. Select events to trigger
4. Configure payload

---

## Support

- **GitHub Docs:** https://docs.github.com
- **GitHub Actions:** https://docs.github.com/actions
- **Expo Docs:** https://docs.expo.dev
- **React Native:** https://reactnative.dev

---

## Checklist

- [ ] GitHub repository created
- [ ] Repository cloned locally
- [ ] GitHub Secrets configured
- [ ] Android keystore generated
- [ ] CI/CD workflows tested
- [ ] First build successful
- [ ] APK downloads working
- [ ] Release created
- [ ] Sync script working
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team notified

---

**Deployment complete! Your Omni-Agents Studio mobile app is now on GitHub with automated CI/CD pipeline.** 🚀
