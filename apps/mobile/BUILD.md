# Building Tedoku Mobile APK

## Issue: Monorepo + EAS Build

The mobile app depends on `@tedoku/shared` package. EAS Build had issues with the workspace dependency. Here's how to build successfully:

## ✅ Solution: Build from Repository Root

### Step 1: Clean Your System (Important!)

Your Mac is low on disk space (94% full). Free up space first:

```bash
# Clean npm cache
npm cache clean --force

# Clean Xcode derived data (if you have Xcode)
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Empty trash and check available space
df -h /
```

You need at least 2-3GB free for the build to succeed.

### Step 2: Push Your Code to GitHub

```bash
git push origin main
```

### Step 3: Build via EAS

From the **repository root** directory:

```bash
cd ~/Documents/Tedoku

# Use npx to avoid installation issues
npx eas-cli@latest build --platform android --profile preview
```

When prompted:
- ✅ Confirm project setup
- ✅ Select your Expo account: `george-0zoemena`
- ✅ Connect to Git repo: Yes
- ✅ Wait for build (~10-15 minutes in queue + 5-10 minutes building)

### Step 4: Download APK

Once build completes:
1. Visit https://expo.dev/accounts/george-0zoemena/projects/tedoku/builds
2. Download the APK file
3. Transfer to your Android device
4. Install the APK

## Alternative: Build Locally (Requires Android SDK)

If you have Android Studio installed:

```bash
# Install dependencies
cd ~/Documents/Tedoku
npm install

# Build locally
cd apps/mobile
npx eas-cli build --platform android --profile preview --local
```

## Troubleshooting

### "npm ci exited with non-zero code: 1"
**Fixed:** Changed dependency from `"@tedoku/shared": "*"` to `"@tedoku/shared": "file:../../packages/shared"`

### "No space left on device"
**Solution:** Clean caches and free up disk space (see Step 1)

### "EAS CLI version mismatch"
**Solution:** Use `npx eas-cli@latest` instead of globally installed version

### Build Still Failing?

Try building in a fresh terminal session:
```bash
# Open new terminal
cd ~/Documents/Tedoku

# Ensure code is pushed
git push

# Build
npx eas-cli@latest build -p android --profile preview --clear-cache
```

## Build Configuration

The build is configured in `apps/mobile/eas.json`:
- **Profile:** preview
- **Output:** APK (Android Package)
- **Distribution:** Internal
- **Node Version:** 22.14.0

## What Gets Built?

- App Name: Tedoku
- Package: com.tedoku.app
- Version: 1.0.0
- Build Type: Release APK for testing

## Next Steps After Build

1. **Install APK on Android device**
2. **Test the app**
3. **For Play Store:** Use `production` profile for AAB bundle:
   ```bash
   npx eas-cli build -p android --profile production
   ```
