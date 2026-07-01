<div align="center">

# 🛒 QuickKart

**A region-aware commerce platform** — API-driven catalog, a behavioural analytics pipeline, and a rule-based recommendation engine, in a premium animated UI.

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

**[🌐 Live Demo](https://quick-kart-black.vercel.app)** · **[⚙️ Live API](https://quickkart-4.onrender.com/api/health)** · **[💻 Repository](https://github.com/Anuragkumar-687/QuickKart)**

</div>

---

## Overview

QuickKart is a **decoupled full-stack e-commerce app**: a Next.js 16 frontend on Vercel talking to a standalone Express 5 REST API on Render, backed by MongoDB Atlas via Prisma.

Rather than a hardcoded catalog, products are **ingested from external APIs** (DummyJSON + FakeStore), normalized, and deduplicated into MongoDB. Every interaction — views, clicks, add-to-carts, purchases — flows into an **analytics pipeline** that powers a **per-region trending engine** and a **weighted recommendation engine** behind the homepage rails.

> **Demo login:** `admin@quickkart.com` / `password123` (admin) · `user@quickkart.com` / `password123` (user)
> _The API runs on Render's free tier and may cold-start (~30s) on first request._

---

## ✨ Features

| | |
|---|---|
| **🔐 Auth** | NextAuth (Credentials) + backend JWT, RBAC (user/admin), protected & admin-only routes |
| **📦 Products** | External-API ingestion → normalized/deduped catalog, admin CRUD, ratings & reviews |
| **🔎 Search & Filters** | Server-side search, suggestions, category filter, price/rating/newest sort, pagination |
| **🎯 Recommendations** | Region trending, personalized picks, "recently viewed", frequently-bought-together |
| **📍 Region-aware** | `state → region` derivation, region-tagged analytics, admin dashboard with charts |
| **🛒 Cart & Checkout** | Quantity controls, save-for-later, stock validation, transactional multi-step checkout |
| **💚 Wishlist** | Toggle from anywhere + dedicated page & counter |
| **🎨 UI/UX** | Dark-first theme + toggle, GSAP/Framer/Lenis motion, responsive, `prefers-reduced-motion` |

---

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, GSAP, Lenis, NextAuth, Axios |
| **Backend** | Node.js, Express 5, Prisma 5, Zod, JWT, bcrypt, ioredis _(optional)_, express-rate-limit, node-cron |
| **Database** | MongoDB Atlas — 12 Prisma models, indexed, aggregation pipelines |
| **Deployment** | Vercel _(frontend)_ · Render _(API)_ · MongoDB Atlas · Redis _(optional)_ |

---

## 🏗 Architecture

```
Next.js (Vercel)  ──►  Axios + JWT interceptor  ──►  Express API (Render)
  client components                                   CORS → rate-limit → routes
  Context (Cart/Wishlist)                              → controllers → services
  NextAuth session                                              │
                                          ┌──────────────────────┴─────────┐
                                     Prisma → MongoDB Atlas          Redis (optional)
                                     node-cron → ingestion / trending jobs
```

- **Layered backend** — `routes → controllers → services → Prisma`; a reusable service layer, Zod validation on every request, and a centralized error handler.
- **Dual-token auth** — NextAuth wraps the backend's JWT: the credentials provider hits `/api/auth/login`, stores the token as `session.accessToken`, and Axios attaches it as a `Bearer` header; the API verifies it and enforces RBAC.
- **Data model** — Prisma over MongoDB with indexes on hot query paths and a unique `externalId` for O(1) ingestion dedupe.
- **State** — React **Context** (`CartContext`, `WishlistContext`) + NextAuth session; no global store library.

<details>
<summary><b>📁 Folder structure</b></summary>

```
backend/src/
├── server.js · config/ · lib/            # bootstrap, env, prisma/redis/cache/logger/regions/token
├── middleware/                           # auth · rbac · validate (Zod) · errorHandler · rateLimit
├── validators/ · services/ · controllers/ · routes/   # per-module (11 each)
├── jobs/scheduler.js · scripts/ · seed.js · make-admin.js

frontend/src/
├── app/                                  # App Router pages (home, products, cart, checkout, admin…)
├── components/  (motion/ · charts/)      # ProductCard, Navbar, Reveal, TiltCard, BarList…
├── context/  (Cart · Wishlist)  ·  lib/api.js
```
</details>

<details>
<summary><b>📡 API overview</b> — <code>/api</code>, 11 route groups</summary>

`/auth` signup·login·me · `/products` list·detail·CRUD·reviews · `/search` +suggestions ·
`/cart` qty·save·move · `/orders` · `/wishlist` toggle · `/recommendations` trending·region·personalized·recently-viewed·bundles ·
`/analytics` track·recompute·regions · `/ingestion` sync·status · `/inventory` alerts·forecast · `/api/health`

Access levels: public · auth (Bearer JWT) · admin (RBAC). Mutating catalog/analytics/inventory routes are admin-only.
</details>

---

## 🚀 Getting Started

```bash
git clone https://github.com/Anuragkumar-687/QuickKart.git && cd QuickKart

# Backend
cd backend && cp .env.example .env       # set DATABASE_URL + JWT_SECRET
npm install && npm run prisma:push
npm run seed && npm run dev              # http://localhost:5000

# Frontend (new terminal)
cd ../frontend && cp .env.local.example .env.local
npm install && npm run dev               # http://localhost:3000
```

<details>
<summary><b>Environment variables</b></summary>

**Backend** — `DATABASE_URL`✅, `JWT_SECRET`✅, `JWT_EXPIRES_IN`, `PORT`, `NODE_ENV`, `CLIENT_ORIGINS` _(CORS allow-list, supports `*.vercel.app`)_, `REDIS_URL` _(optional)_, `ENABLE_CRON`.
**Frontend** — `NEXT_PUBLIC_API_URL`✅ _(backend URL, no `/api`)_, `NEXTAUTH_SECRET`✅, `NEXTAUTH_URL`✅.

Secrets live only in host dashboards / git-ignored `.env` files. Full deploy guide: **[DEPLOYMENT.md](DEPLOYMENT.md)**.
</details>

---

## 🛠 Engineering Highlights

**Performance**
- Server-side pagination & filtering · optional Redis caching with **graceful fallback** · DB indexing
- Batched/parallel writes (trending recompute: >3 min → ~20s) · fire-and-forget analytics · `next/image` · code splitting

**Security**
- JWT + bcrypt · RBAC middleware on all mutations · Zod validation · CORS allow-list · layered rate limiting · centralized error handling (no leaked stack traces)

**Problems solved (real production work)**
- Diagnosed a persistent **CORS failure** across Vercel↔Render — implemented dynamic Vercel-preview matching and traced the root cause to a **branch/deploy gap** (fix commits weren't on the deployed branch).
- Migrated the entire backend **TypeScript → JavaScript** with a data-backfill script, preserving Prisma and architecture.
- Designed the **region-aware analytics → recommendation** pipeline with two explainable scoring formulas instead of a black-box model.

---

## 🌟 Why It Stands Out

Not a CRUD clone — QuickKart ships a genuine **analytics → trending → recommendation** pipeline on a **production-grade, layered API** (auth, RBAC, validation, rate limiting, caching), and is **actually deployed** across Vercel + Render + Atlas with the messy real-world issues (CORS, cold starts, deploy gaps, dependency upgrades) solved and documented. It demonstrates end-to-end ownership: data modelling, API design, auth, a data pipeline, a polished accessible UI, and production deployment.

**Next up:** Atlas Search (fuzzy search) · BullMQ job queues · automated tests + CI.

---

<div align="center">
<sub>Built by <b>Anurag Kumar</b> — region-aware commerce, recommendations & analytics.</sub>
</div>
