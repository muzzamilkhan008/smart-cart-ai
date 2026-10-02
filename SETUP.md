# 🛠️ SmartCart AI Setup Guide

This guide details setting up SmartCart AI locally from scratch.

## 1. Environment Variables Configuration

Create a `.env` file in `server/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=smartcart_ai_jwt_super_secret_key_2026
CLIENT_URL=http://localhost:5173
DATABASE_PATH=./data/smartcart.db
AI_API_KEY=
```

## 2. Step-by-Step Installation

1. Clone or navigate to project directory:
   ```bash
   cd "c:\Users\DELL\Desktop\e commer webiste"
   ```
2. Install dependencies for root, server, and client:
   ```bash
   npm run install:all
   ```
3. Initialize SQLite Schema & Seed Demo Data:
   ```bash
   npm run seed
   ```
4. Start Development Backend:
   ```bash
   npm run dev:server
   ```
5. Start Development Frontend:
   ```bash
   npm run dev:client
   ```
6. Open your browser at `http://localhost:5173`.
