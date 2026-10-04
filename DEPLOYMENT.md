# 🚀 SmartCart AI Production Deployment Guide (Netlify)

SmartCart AI is configured for deployment on **Netlify** (Full-Stack single deployment with Netlify Functions).

## Architecture

- **Frontend**: React SPA deployed from `client/` (`dist/`).
- **Backend**: Express REST API running on **Netlify Functions** (`netlify/functions/api.ts`).
- **Routing**: API calls to `/api/*` are redirected seamlessly to `/.netlify/functions/api/:splat`.
- **Database**: SQLite (local development / ephemeral serverless initialization; database auto-seeds on initial load).

---

## Netlify One-Click Deployment

1. Connect your GitHub repository `muzzamilkhan008/smart-cart-ai` to Netlify.
2. Netlify will automatically detect [netlify.toml](file:///c:/Users/DELL/Desktop/e%20commer%20webiste/netlify.toml):
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `../netlify/functions`
3. Click **Deploy**.
4. Verify `/api/health` and `/api/products` respond with HTTP 200 OK.
