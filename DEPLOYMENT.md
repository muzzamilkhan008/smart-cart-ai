# 🚀 SmartCart AI Production Deployment Guide

SmartCart AI is architected for simple deployment on **Render**, **Vercel**, **Netlify**, or any Docker host.

## Recommended Cloud Architecture

- **Backend (Render / Railway)**: Node.js Express REST API server running `server/dist/index.js`.
- **Frontend (Render / Vercel / Netlify)**: Static Vite React web app deployed from `client/dist/`.
- **Database**: SQLite database file with persistent disk volume (or migrate to PostgreSQL using Knex / Prisma / Drizzle).

---

## 1. Deploying Backend to Render

1. Connect your GitHub repository to Render.
2. Create a **Web Service** pointing to directory `server`.
3. Set Build Command: `npm install && npm run build`
4. Set Start Command: `npm start`
5. Environment Variables:
   - `PORT`: `5000` or assigned by Render
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `<generate-a-strong-random-secret>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
6. Verify `/api/health` endpoint responds with `{ "status": "ok" }`.

---

## 2. Deploying Frontend to Vercel or Netlify

1. Create a project in Vercel/Netlify pointing to directory `client`.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure rewrite rules for Single Page Application (`/index.html`).

---

## 3. Docker Deployment

Build and run using Docker:

```bash
docker build -t smartcart-ai .
docker run -p 5000:5000 -e NODE_ENV=production smartcart-ai
```
