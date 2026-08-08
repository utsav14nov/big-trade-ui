# Mandi Ledger — Frontend (React + Vite)

React SPA for the groundnut brokerage trade manager. Talks to the FastAPI backend.

## Stack
- **React 18** + **Vite 6**
- **React Router** for routing/protected routes
- **Recharts** for analytics
- **Axios** with an auth interceptor (in-memory access token, silent refresh)

## Quick start
```bash
cp .env.example .env          # VITE_API_BASE=/api/v1 (dev proxies to :8000)
npm install
npm run dev                   # http://localhost:5173
```
Run the backend (`../mandi-backend`) alongside; Vite proxies `/api` to `localhost:8000`.

## Security notes (frontend side)
- **Access token is kept in memory only** (a module variable), never in `localStorage`/`sessionStorage`. If an XSS bug ever slips in, there's no stored token to steal.
- **Refresh token is an httpOnly cookie** set by the backend — unreadable by JS, sent only to `/auth/*`. On load and on 401, the app silently refreshes.
- No secrets in the bundle; source maps disabled in the production build.
- All money figures shown are the **server-computed** values from the API — the client never decides financial numbers.

## Project layout
```
src/
  api/client.js          axios instance + auth interceptor + API helpers
  context/AuthContext.jsx session state, login/logout/refresh
  components/            Shell, TradeForm, shared ui
  pages/                Login, Trades, Brokerage, Analytics
  lib/theme.js          palette + currency formatting
```

---

## Deployment & cost — GCP vs Vercel

You asked to compare. Here's the honest picture for an app this size (one user → a small team, modest traffic). The frontend is static files; the backend is a container + Postgres.

### Option A — Vercel (frontend) + backend elsewhere
Vercel is excellent for the **React frontend** (static/SPA): global CDN, automatic HTTPS, preview deployments, near-zero config.
- **Frontend on Vercel:** **Free (Hobby)** for personal use; **Pro $20/user/mo** if you want team features/commercial use guarantees.
- **Catch:** Vercel does **not** host Postgres or long-running Python well. Its Python support is serverless functions (cold starts, 10–60s limits) — a poor fit for a stateful FastAPI + a persistent DB pool. You'd still need a DB (Neon/Supabase/Railway) and ideally a container host for the API. So a "Vercel-only" full stack means splicing 2–3 vendors.
- **Rough monthly:** Frontend $0–20 + managed Postgres $0–25 (Neon/Supabase free tier → paid) + API host (Railway/Render $7–25). **≈ $7–50/mo**, spread across vendors.

### Option B — Google Cloud Platform (everything in one place)
Best when you want **one vendor, one security perimeter** — which matters for critical financial data.
- **Frontend:** Firebase Hosting or Cloud Storage + Cloud CDN — **~$0–1/mo** at your traffic (generous free tier, then ~$0.026/GB).
- **Backend API:** **Cloud Run** (serverless containers, scales to zero). At low traffic you're in the **free tier**; realistically **~$0–15/mo**. Handles FastAPI perfectly (it's just a container), no cold-start pain if you set `min-instances=1` (~$5–8/mo for always-warm).
- **Database:** **Cloud SQL for PostgreSQL** — the real cost driver. Smallest shared-core instance (`db-f1-micro`/`db-g1-small`) is **~$9–35/mo** depending on size + storage + backups. Private IP keeps it off the public internet.
- **Secrets:** Secret Manager **~$0** at this scale.
- **Rough monthly:** **≈ $15–50/mo**, all under one project/billing/IAM.

### Recommendation
For **critical financial data**, I'd lean **all-GCP (Option B)**: one IAM boundary, private-IP Postgres, Secret Manager, Cloud Audit Logs, and VPC controls — much easier to reason about and lock down than data spread across Vercel + Neon + Railway. Use Vercel only if you specifically want its frontend DX and are fine splitting vendors.

**Cheapest safe starting point:** Frontend on Firebase Hosting (free), API on Cloud Run (`min-instances=0`, free-tier), DB on Cloud SQL `db-g1-small` with private IP + automated backups. Expect **~$15–35/mo** to start, scaling with usage.

See `../INFRASTRUCTURE.md` for the concrete GCP deploy steps.

## Build
```bash
npm run build     # → dist/ (deploy to Firebase Hosting / Cloud Storage / Vercel)
```
