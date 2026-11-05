# Tedoku Landing Page

Beautiful hero landing page for Tedoku mobile app with direct APK download.

## 🎨 Design Features

- **Dark theme** with Tedoku brand colors
- **3D glass morphism** design elements
- **Animated gradient backgrounds**
- **Responsive** layout
- **Direct APK download** button
- Inspired by modern dark-mode hero sections

## 🚀 Development

```bash
# From repository root
npm run landing

# Or from this directory
npm run dev
```

Visit: http://localhost:5175

## 📦 Build

```bash
# From repository root
npm run landing:build

# Or from this directory
npm run build
```

## 🌐 Deploy to Vercel

### Quick Deploy

```bash
cd apps/landing
vercel --prod
```

### Configuration

The landing page uses:
- Tedoku brand colors from `@tedoku/shared`
- Plus Jakarta Sans font
- Vite for bundling
- React 19

## 🔗 Update APK URL

Edit `src/App.tsx` and update the `APK_DOWNLOAD_URL` constant with your actual Expo build URL:

```typescript
const APK_DOWNLOAD_URL = 'https://expo.dev/accounts/george-0zoemena/projects/tedoku/builds/[BUILD_ID]'
```

Or replace with direct APK URL after download from Expo.

## 🎨 Brand Colors Used

- **Primary Dark**: `#3A1A57` (Primary darker)
- **Sidebar**: `#2A1342` 
- **Primary**: `#5B2A86`
- **Cycle**: `#C2415F`
- **Sleep**: `#4B50C8`
- **Background**: `#FBF7F4`

## 📱 Features

- ✅ Direct APK download button
- ✅ Responsive mobile/tablet/desktop
- ✅ Animated 3D visual element
- ✅ Status badge ("Available Now")
- ✅ Clean navigation
- ✅ Call-to-action buttons
- ✅ System requirements info

## 🖼️ Preview

The landing page features:
- Large bold heading with gradient text
- Animated 3D glass-morphism shape
- Floating background effects
- Smooth hover interactions
- Download and "Learn more" CTAs
