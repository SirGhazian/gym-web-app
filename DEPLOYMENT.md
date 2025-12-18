# Deployment Guide

This project is now split into two parts:

1.  **Frontend**: Next.js App (Deploy to Vercel)
2.  **Backend**: Node.js/Socket.IO Server (Deploy to Railway)

## 1. Backend Deployment (Railway)

Since Vercel Serverless Functions have execution time limits, they cannot host persistent WebSocket connections. We will use Railway for the Node.js server.

1.  **Create a GitHub Repo**: Push your entire project to GitHub.
2.  **Sign up/Login to Railway**: Go to [railway.app](https://railway.app/).
3.  **New Project**: Click "New Project" -> "Deploy from GitHub repo".
4.  **Select Repo**: Choose your gym-app repo.
5.  **Configure Service**:
    - Railway might try to deploy the Next.js app by default. We want to deploy the `server/` folder as a separate service (or monorepo setup).
    - **Best Approach**:
      - In Railway settings for the service:
      - **Root Directory**: Set this to `/server`.
      - **Build Command**: `npm install`
      - **Start Command**: `node index.js`
6.  **Public URL**: Generate a domain (e.g., `gym-chat-server.up.railway.app`).
7.  **Environment Variables**:
    - (Optional) If you add a database later, configure connection strings here.

## 2. Frontend Deployment (Vercel)

1.  **Go to Vercel Dashboard**: Import the same GitHub repo.
2.  **Root Directory**: Keep it as the root (`./`).
3.  **Environment Variables**:
    - Add `NEXT_PUBLIC_SOCKET_URL`
    - Value: The URL from your Railway backend (e.g., `https://gym-chat-server.up.railway.app`).
4.  **Deploy**: Click Deploy.

## Local Development

To run locally, you need two terminals:

**Terminal 1 (Backend):**

```bash
cd server
npm install
npm run dev
```

(Server runs on http://localhost:3001)

**Terminal 2 (Frontend):**

```bash
npm run dev
```

(App runs on http://localhost:3000)
