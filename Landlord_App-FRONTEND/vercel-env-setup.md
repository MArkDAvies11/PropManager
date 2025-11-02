# Vercel Environment Variables Setup

## Required Environment Variables for Vercel Dashboard

Add these environment variables in your Vercel project dashboard:

### Production Environment Variables:
```
VITE_API_URL=https://landlord-app-backend-1eph.onrender.com
VITE_ENVIRONMENT=production
VITE_APP_NAME=Rental Platform
VITE_APP_VERSION=1.0.0
```

### How to Add in Vercel Dashboard:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the values above
4. Set Environment to "Production"
5. Click "Save"

### Deployment Commands:
```bash
# Deploy to Vercel
vercel --prod

# Or if using Vercel CLI for the first time
vercel
# Follow prompts to link project
# Then deploy with:
vercel --prod
```

### Testing the Integration:
After deployment, your Vercel app will automatically use the production backend URL.
The frontend will connect to: `https://landlord-app-backend-1eph.onrender.com`