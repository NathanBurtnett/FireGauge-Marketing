# Fix Marketing Site Build Command in Render Dashboard

## Problem
The deployment logs show that Render is still using `npm ci && npm run build` instead of the Bun commands we configured. This is because the manual service configuration is overriding the render.yaml file.

## Solution: Update Build Command in Render Dashboard

### Step 1: Go to Service Settings
1. Log into your Render dashboard
2. Find the `firegauge-marketing` service (or whatever you named it)
3. Click on the service to open its details
4. Click on **"Settings"** tab

### Step 2: Update Build & Deploy Settings
In the "Build & Deploy" section, update these fields:

**Build Command:**
```bash
bun install --production=false && bun run build
```

**Start Command:**
```bash
bun run preview
```

### Step 3: Update Health Check (Optional)
In the "Health Checks" section:

**Health Check Path:**
```
/
```

### Step 4: Save and Redeploy
1. Click **"Save Changes"**
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

## Alternative: Use Blueprint Deployment
If you prefer to use the render.yaml configuration:

1. **Delete the current service** from Render dashboard
2. **Create new service** using Blueprint:
   - Go to Render Dashboard → "New" → "Blueprint"
   - Connect your `firegauge-digital-hose` repository
   - Select the `render.yaml` file
   - This will automatically use the correct Bun commands

## Expected Build Output
After fixing, you should see:
```
==> Running build command 'bun install --production=false && bun run build'...
```

Instead of:
```
==> Running build command 'npm ci && npm run build'...
```

## Files Updated
- ✅ `package.json`: Moved `lovable-tagger` to dependencies
- ✅ `render.yaml`: Updated build command with proper Bun flags
- ✅ Build dependencies now available in production build 