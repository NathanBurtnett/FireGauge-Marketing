# FireGauge Marketing Site Deployment Fixes

## Issue Fixed for Render Deployment

### **Problem**: Package Manager Mismatch
The deployment was failing with `sh: 1: vite: not found` because:
1. **Render was using Bun** to install dependencies (`bun install`)
2. **Build command was using npm** (`npm ci && npm run build`) 
3. **Vite was in devDependencies**, so npm couldn't find it in the npm context

### **Solution**: Consistent Package Manager + Move Build Dependencies

1. **Updated render.yaml**:
   ```yaml
   buildCommand: "bun install && bun run build"
   startCommand: "bun run preview"
   ```

2. **Moved build-essential dependencies to dependencies** in `package.json`:
   - `vite`: Required for building
   - `@vitejs/plugin-react-swc`: Required for React compilation
   - `postcss`: Required for CSS processing
   - `tailwindcss`: Required for Tailwind CSS compilation
   - `autoprefixer`: Required for CSS vendor prefixes

## Deployment Instructions

1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Fix marketing site deployment: use Bun consistently, move build deps"
   git push origin main
   ```

2. **Deploy on Render**:
   - Use Blueprint deployment with `render.yaml`
   - Or manually configure with Bun as package manager
   - Build command: `bun install && bun run build`
   - Start command: `bun run preview`

## Service Configuration
- **Runtime**: Node.js
- **Package Manager**: Bun (consistent for install and build)
- **Build Tool**: Vite
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS + Radix UI

## Environment Variables
- `VITE_API_URL`: Points to main FireGauge API
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

⚠️ **Security Note**: Rotate the Supabase and Stripe keys after deployment as they were exposed in the conversation.

## Expected Service URL
- Marketing Site: `https://firegauge-marketing.onrender.com` 