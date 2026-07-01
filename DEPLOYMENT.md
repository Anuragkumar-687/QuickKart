# 🚀 Deploying QuickKart

QuickKart has two deployable apps plus a database:

```
Next.js frontend  →  Vercel          (SSR, edge, image optimization)
Express backend   →  Render          (long-running Node service + node-cron)
MongoDB           →  MongoDB Atlas    (already provisioned)
Redis (optional)  →  Upstash/Render   (caching — app runs fine without it)
```

Deploy order matters because the two apps reference each other's URLs:
**Atlas → Backend (Render) → Frontend (Vercel) → wire CORS back to the backend.**

---

## 0. Prerequisites
- The repo pushed to GitHub (done — `Anuragkumar-687/QuickKart`).
- Accounts: [Vercel](https://vercel.com), [Render](https://render.com), [MongoDB Atlas](https://cloud.mongodb.com).
- Generate two secrets (keep them handy):
  ```bash
  openssl rand -base64 32   # JWT_SECRET
  openssl rand -base64 32   # NEXTAUTH_SECRET
  ```

---

## 1. MongoDB Atlas
Your cluster already exists and is seeded. Just make it reachable from Render:

1. Atlas → **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`).
   *(Render's outbound IPs are dynamic on the free plan, so allow-all is simplest. Lock it down later with Render's static-IP add-on if desired.)*
2. Atlas → **Database → Connect → Drivers** → copy the connection string. It becomes `DATABASE_URL`
   (format: `mongodb+srv://USER:PASS@cluster.xxxx.mongodb.net/quickkart?retryWrites=true&w=majority`).

> Data is already loaded (products, users, analytics). To reseed a fresh DB, run `npm run seed`
> from `backend/` locally with `DATABASE_URL` pointing at the cluster.

---

## 2. Backend → Render

**Option A — Blueprint (uses `render.yaml`):**
1. Render → **New → Blueprint** → connect the repo. It reads `render.yaml` and creates the `quickkart-api` web service (rootDir `backend`, build `npm install`, start `npm start`, health check `/api/health`).
2. When prompted, fill the secret env vars (below).

**Option B — Manual Web Service:**
1. Render → **New → Web Service** → connect the repo.
2. Root Directory: `backend` · Runtime: `Node` · Build: `npm install` · Start: `npm start` · Health Check Path: `/api/health`.

**Environment variables (Render → Environment):**

| Key | Value |
|-----|-------|
| `DATABASE_URL` | your Atlas connection string |
| `JWT_SECRET` | the first `openssl` secret |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `CLIENT_ORIGINS` | *set in step 4* (temporarily `*` while testing) |
| `REDIS_URL` | *(optional — leave empty)* |
| `ENABLE_CRON` | `false` *(free tier sleeps; run jobs elsewhere)* |

3. Deploy. When live, note the URL, e.g. `https://quickkart-api.onrender.com`.
4. Verify: open `https://quickkart-api.onrender.com/api/health` → `{"status":"ok","db":"up",...}`.

> ⚠️ **Free tier spins down** after ~15 min idle (first request then takes ~30–50s). Fine for demos;
> upgrade to a paid instance (or add a cron pinger) to keep it warm.

---

## 3. Frontend → Vercel

1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory: `frontend`** (important — it's a monorepo). Framework auto-detects **Next.js**.
3. **Environment Variables:**

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | your Render URL **without** `/api`, e.g. `https://quickkart-api.onrender.com` |
| `NEXTAUTH_SECRET` | the second `openssl` secret |
| `NEXTAUTH_URL` | your Vercel URL, e.g. `https://quickkart.vercel.app` |

4. Deploy. Note the production URL (e.g. `https://quickkart.vercel.app`).

> If you set `NEXTAUTH_URL` before knowing the final domain, update it afterwards and redeploy.
> `next.config.mjs` already whitelists the DummyJSON/FakeStore image hosts.

---

## 4. Wire CORS (backend ↔ frontend)

Back on **Render → quickkart-api → Environment**, set:

```
CLIENT_ORIGINS=https://quickkart.vercel.app,*.vercel.app
```

- The first entry is your production frontend.
- `*.vercel.app` allows Vercel **preview** deployments too (supported by the backend's CORS matcher).

Save → Render redeploys. Done.

---

## 5. Verify end-to-end
1. Open the Vercel URL.
2. Log in with the seeded admin: **`admin@quickkart.com` / `password123`** (or register a new account).
3. Check: products load, search/filter works, add-to-cart → checkout → order, `/admin/analytics` renders charts.
4. If product APIs fail with a CORS error in the browser console → re-check `CLIENT_ORIGINS` matches the frontend origin exactly.

---

## Environment variable reference

**backend** (`backend/.env.example`): `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV`, `CLIENT_ORIGINS`, `PORT` *(Render sets this)*, `REDIS_URL` *(optional)*, `ENABLE_CRON`.

**frontend** (`frontend/.env.local.example`): `NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.

## Optional upgrades
- **Redis caching**: create an [Upstash](https://upstash.com) Redis DB, set `REDIS_URL` on Render — trending/recommendations/hot queries get cached automatically.
- **Background jobs**: set `ENABLE_CRON=true` on a paid (always-on) instance, or trigger `POST /api/ingestion/sync` & `POST /api/analytics/recompute` from an external scheduler (cron-job.org, GitHub Actions).
- **Custom domain**: add it in Vercel, then append it to `CLIENT_ORIGINS` and update `NEXTAUTH_URL`.
- **Alternatives**: the backend also runs on Railway/Fly.io/Heroku (same build/start commands + env vars).
