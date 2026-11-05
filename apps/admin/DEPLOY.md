# Deploy Admin App to Vercel

## Quick Deploy

### Option 1: Using Vercel CLI (Recommended)

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy from the admin directory:**
   ```bash
   cd apps/admin
   vercel --prod
   ```

3. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (first time) or `Y` (if project exists)
   - What's your project's name? `tedoku-admin` (or your preferred name)
   - In which directory is your code located? `./` (press Enter)
   - Want to override settings? `N`

### Option 2: Using Vercel Dashboard (Git Integration)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to [vercel.com](https://vercel.com) and:**
   - Click "Add New Project"
   - Import your repository
   - Set Root Directory to: `apps/admin`
   - Framework Preset will auto-detect as Vite
   - Click "Deploy"

## Configuration

The following files are already configured:

- `vercel.json` - Vercel configuration with SPA routing
- Build command: `npm run build`
- Output directory: `dist`

## Environment Variables

If you need to set environment variables (like API URL):

1. In Vercel Dashboard, go to Project Settings → Environment Variables
2. Add: `VITE_API_URL` with your backend URL
3. Redeploy

Or using CLI:
```bash
vercel env add VITE_API_URL
```

## Custom Domain

After deployment, you can add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS as instructed

## Build Details

- Framework: Vite
- Node Version: 22.x (auto-detected)
- Package Manager: npm
- Build output: Static site (SPA)
