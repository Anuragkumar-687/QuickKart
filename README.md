<div align="center">

# 🛒 QuickKart

**A region-aware commerce platform** — API-driven catalog ingestion, a behavioural analytics pipeline, and a rule-based recommendation engine, wrapped in a premium, motion-rich UI.

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

**[🌐 Live Demo](https://quick-kart-black.vercel.app)** · **[⚙️ Live API](https://quickkart-4.onrender.com/api/health)** · **[💻 Repository](https://github.com/Anuragkumar-687/QuickKart)**

</div>

---

## Overview

QuickKart is a full-stack e-commerce application built as a **decoupled platform**: a Next.js 16 App Router frontend on Vercel talking to a standalone Express 5 REST API on Render, backed by MongoDB Atlas via Prisma.

Instead of a hardcoded product list, the catalog is **ingested from external APIs** (DummyJSON + FakeStore), normalized into a single schema, and deduplicated into MongoDB. Every meaningful interaction — views, clicks, add-to-carts, purchases — is captured into an **analytics pipeline** that feeds a **per-region trending engine** and a **weighted recommendation engine**, powering personalized homepage rails ("Trending Near You", "Popular In Your Region", "Recommended For You", "Recently Viewed").

The backend is a clean, layered architecture (`routes → controllers → services → Prisma`) with JWT auth, RBAC, Zod validation, centralized error handling, and rate limiting. The frontend is a dark-first, animated experience (GSAP + Framer Motion + Lenis) with a full accessibility pass (`prefers-reduced-motion`, focus states, ARIA).

## 🔗 Demo

| | Link |
|---|---|
| **Live Demo** (frontend) | https://quick-kart-black.vercel.app |
| **Backend API** (health) | https://quickkart-4.onrender.com/api/health |
| **Repository** | https://github.com/Anuragkumar-687/QuickKart |

> **Demo login:** `admin@quickkart.com` / `password123` (admin) · `user@quickkart.com` / `password123` (user)
> The API is on Render's free tier and may cold-start (~30–50s) on first request.

---

## ✨ Features

<table>
<tr><td valign="top" width="50%">

**🔐 Authentication & Access**
- Email/password auth via NextAuth (Credentials) + backend JWT
- Role-based access control (user / admin)
- Protected routes & admin-only APIs
- Profile with region/address (`GET`/`PATCH /me`)

**📦 Products & Catalog**
- API-driven ingestion (DummyJSON + FakeStore) → normalized schema, deduped by `externalId`
- Admin CRUD (create / edit / delete)
- Ratings & one-review-per-user reviews
- Scheduled catalog refresh endpoint

**🔎 Search & Filters**
- Server-side search across name/description/brand/category
- Search suggestions endpoint
- Category filter, price sort, rating sort, newest — all server-side
- Debounced input, URL-driven filters, pagination

**🛒 Cart & Orders**
- Increase/decrease quantity, remove, **Save For Later**
- Stock validation on every mutation
- Transactional checkout (stock decrement + order + purchase events)
- Multi-step checkout UI with animated success screen

</td><td valign="top" width="50%">

**🎯 Recommendations & Intelligence**
- Per-region **trending engine** (`views·0.2 + cartAdds·0.3 + purchases·0.5`)
- Weighted **recommendation engine** (`0.4 region + 0.3 interest + 0.2 rating + 0.1 trend`)
- Frequently Bought Together (order co-occurrence)
- Demand forecasting + inventory intelligence (low-stock / reorder)

**📍 Region-Aware**
- User `state → region` auto-derivation (North/South/East/West/Northeast)
- Region-tagged analytics events & rankings
- Admin analytics dashboard with animated charts

**💚 Wishlist**
- Toggle from any product card / detail page
- Dedicated wishlist page + navbar counter

**🎨 UI / UX**
- **Dark-first** theme + light toggle (persisted, no FOUC)
- GSAP hero, Framer Motion transitions, Lenis smooth scroll
- 3D tilt cards, magnetic buttons, skeletons, `prefers-reduced-motion`
- Fully responsive, mobile-first

**⚡ Performance & 🔒 Security**
- Pagination, optional Redis caching, DB indexing
- JWT, bcrypt, RBAC, Zod, CORS, rate limiting

</td></tr>
</table>

---

## 🧰 Tech Stack

<table>
<tr><th>Frontend</th><th>Backend</th></tr>
<tr><td valign="top">

| Tech | Purpose |
|---|---|
| Next.js 16 (App Router) | Framework / routing |
| React 19 | UI library |
| Tailwind CSS v4 | Styling (token system) |
| Framer Motion 12 | Component / page motion |
| GSAP 3 | Hero timeline animation |
| Lenis | Smooth scrolling |
| NextAuth v4 | Session / auth |
| Axios | HTTP client (+ JWT interceptor) |
| lucide-react | Icons |

</td><td valign="top">

| Tech | Purpose |
|---|---|
| Node.js (≥18.18) | Runtime |
| Express 5 | REST API framework |
| Prisma 5 | ORM |
| Zod | Request validation |
| jsonwebtoken | JWT signing/verify |
| bcryptjs | Password hashing |
| ioredis | Optional caching |
| express-rate-limit | Rate limiting |
| node-cron | Background jobs |

</td></tr>
</table>

| Database | Authentication | Deployment | Developer Tools |
|---|---|---|---|
| MongoDB Atlas | NextAuth (Credentials) | **Vercel** (frontend) | nodemon |
| Prisma ORM | JWT (bearer) | **Render** (backend API) | ESLint + eslint-config-next |
| 12 models + indexes | bcrypt hashing | MongoDB Atlas (DB) | Prisma CLI |
| Aggregation (`groupBy`) | RBAC middleware | Redis (optional, e.g. Upstash) | dotenv |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 16 (App Router)  ·  Vercel                          │
│  pages + client components → Axios (JWT interceptor)         │
│  state: React Context (Cart, Wishlist) + NextAuth session    │
└───────────────────────────────┬─────────────────────────────┘
                                 │  HTTPS  /api/*   (Bearer JWT)
┌───────────────────────────────▼─────────────────────────────┐
│  Express 5 REST API  ·  Render                               │
│  CORS → rate-limit → routes → controllers → services         │
│  middleware: auth · rbac · Zod validate · error handler      │
└───────────────────────────────┬─────────────────────────────┘
                    ┌────────────┴───────────┐
              ┌─────▼─────┐            ┌──────▼──────┐
              │ Prisma ORM│            │ Redis (opt) │
              │ MongoDB   │            │ cache + TTL │
              │ Atlas     │            └─────────────┘
              └───────────┘   node-cron → ingestion / trending jobs
```

- **Frontend** — App Router with static prerendering for most routes and dynamic rendering for param routes (`/products/[id]`, admin edit). Interactive pages are client components that fetch through a shared Axios instance ([`frontend/src/lib/api.js`](frontend/src/lib/api.js)).
- **Backend** — a strictly **layered** design: thin controllers delegate to a reusable **service layer**; `asyncHandler` forwards errors to a central handler; every input passes through a **Zod** middleware.
- **Database** — Prisma models Mongo `_id → id`; schema declares indexes on hot query paths; analytics use Mongo aggregation via `groupBy`.
- **Authentication** — NextAuth wraps the backend's own JWT: the credentials provider calls `/api/auth/login`, stores the returned token as `session.accessToken`, and Axios attaches it as a `Bearer` header on every request. The backend verifies it and sets `req.user` for RBAC.
- **API flow** — browser → Axios (`Authorization: Bearer`) → CORS → global rate limiter → route → validate → controller → service → Prisma → JSON.
- **State management** — React **Context API** (`CartContext`, `WishlistContext`) + NextAuth `SessionProvider` + component-local state. No global store library.

---

## 📁 Folder Structure

<details>
<summary><b>Backend</b> — <code>routes → controllers → services → Prisma</code></summary>

```
backend/
├── prisma/schema.prisma          # 12 models + indexes
├── render.yaml                   # Render blueprint
└── src/
    ├── server.js                 # app bootstrap: CORS, rate-limit, routes, error handler
    ├── config/env.js             # centralized env access
    ├── lib/                      # prisma · redis · cache · logger · regions · token · ApiError · httpClient
    ├── middleware/               # auth · rbac · validate (Zod) · errorHandler · rateLimit
    ├── validators/               # Zod schemas per domain
    ├── services/                 # products · ingestion · cart · orders · reviews · wishlist ·
    │                             #   analytics · trending · recommendations · search · inventory · forecast
    ├── controllers/              # thin HTTP handlers (11)
    ├── routes/                   # one router per module (11)
    ├── jobs/scheduler.js         # node-cron jobs
    ├── scripts/                  # ingest.js · migrate-legacy.js
    ├── seed.js · make-admin.js
```
</details>

<details>
<summary><b>Frontend</b> — Next.js App Router</summary>

```
frontend/src/
├── app/
│   ├── layout.jsx · template.jsx · globals.css
│   ├── page.jsx                  # animated homepage (rails, hero, sections)
│   ├── (auth)/login · register
│   ├── products/ · products/[id]/
│   ├── cart/ · checkout/ · orders/ · wishlist/
│   ├── admin/ · admin/analytics/ · admin/products/new · [id]/edit
│   └── api/auth/[...nextauth]/route.js
├── components/
│   ├── Navbar · Footer · ProductCard · RecommendationSection · AuthShell …
│   ├── motion/                   # SmoothScroll · Reveal · Magnetic · TiltCard · AuroraBackground · AnimatedNumber
│   └── charts/                   # BarList · ProgressRing
├── context/                      # CartContext · WishlistContext
└── lib/api.js                    # axios instance + JWT interceptor
```
</details>

---

## 📡 API Overview

Base URL: `/api` · 🔓 public · 🔑 auth required · 👑 admin only

<details open>
<summary><b>Auth</b> · <code>/auth</code></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/signup` (+ `/register`) | 🔓 | Register; derives region from state |
| POST | `/auth/login` | 🔓 | Returns `{ token, user }` |
| GET / PATCH | `/auth/me` | 🔑 | Read / update profile |
</details>

<details>
<summary><b>Products & Search</b> · <code>/products</code>, <code>/search</code></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/products` | 🔓 | `?page&limit&search&category&sort&source&minPrice&maxPrice` |
| GET | `/products/categories` | 🔓 | Distinct categories |
| GET | `/products/:id` | 🔓 | Product detail (records a view) |
| POST | `/products` | 👑 | Create product |
| PUT / DELETE | `/products/:id` | 👑 | Update / delete |
| GET | `/products/:id/reviews` | 🔓 | List reviews |
| POST | `/products/:id/reviews` | 🔑 | Create/update own review |
| DELETE | `/reviews/:id` | 🔑 | Delete own review |
| GET | `/search` · `/search/suggestions` | 🔓 | Full-text-ish search |
</details>

<details>
<summary><b>Cart · Orders · Wishlist</b></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET / POST | `/cart` | 🔑 | Get cart / add item (stock-validated) |
| PATCH / DELETE | `/cart/:id` | 🔑 | Set quantity (0 = remove) / remove |
| POST | `/cart/:id/save` · `/cart/:id/move` | 🔑 | Save for later / move to cart |
| GET / POST | `/orders` | 🔑 | List / place order (transactional) |
| GET | `/wishlist` | 🔑 | List wishlist |
| POST / DELETE | `/wishlist/:productId` | 🔑 | Toggle / remove |
</details>

<details>
<summary><b>Recommendations · Analytics · Ingestion · Inventory</b></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/recommendations/trending` · `/region` | 🔓 | Region-aware rails |
| GET | `/recommendations/personalized` · `/recently-viewed` | 🔑 | Personalized rails |
| GET | `/recommendations/bundles/:productId` | 🔓 | Frequently bought together |
| POST | `/analytics/track` | 🔓 | Record view/click/cart-add |
| POST | `/analytics/recompute` | 👑 | Recompute trending rankings |
| GET | `/analytics/regions` | 👑 | Dashboard aggregations |
| POST | `/ingestion/sync` · GET `/ingestion/status` | 👑 | Refresh catalog |
| GET | `/inventory/alerts` · `/inventory/forecast` | 👑 | Low-stock / demand forecast |
| GET | `/api/health` | 🔓 | DB + Redis health |
</details>

---

## 🚀 Installation

**Prerequisites:** Node.js ≥ 18.18, a MongoDB Atlas connection string, (optional) Redis.

```bash
git clone https://github.com/Anuragkumar-687/QuickKart.git
cd QuickKart

# 1) Backend
cd backend
cp .env.example .env          # fill DATABASE_URL + JWT_SECRET
npm install                   # runs `prisma generate`
npm run prisma:push           # apply schema + indexes to Atlas
npm run seed                  # users + ingested catalog + demo analytics + trending
npm run dev                   # http://localhost:5000

# 2) Frontend (new terminal)
cd ../frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL + NEXTAUTH_SECRET
npm install
npm run dev                        # http://localhost:3000
```

---

## 🔧 Environment Variables

**Backend** (`backend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | — | Token lifetime (default `7d`) |
| `PORT` | — | Server port (default `5000`; set by host) |
| `NODE_ENV` | — | `development` / `production` |
| `CLIENT_ORIGINS` | prod | Comma-separated allowed CORS origins (supports `*.vercel.app`) |
| `REDIS_URL` | — | Enables caching when set (graceful fallback when empty) |
| `ENABLE_CRON` | — | `true` to enable scheduled jobs |

**Frontend** (`frontend/.env.local`)

| Variable | Required | Description |
|---|:---:|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend base URL **without** `/api` |
| `NEXTAUTH_SECRET` | ✅ | NextAuth session secret |
| `NEXTAUTH_URL` | ✅ | Site URL (e.g. the Vercel domain) |

> Secrets live only in host dashboards / local `.env` files (git-ignored). Never commit real values.

---

## ☁️ Deployment

| Layer | Platform | Config |
|---|---|---|
| Frontend | **Vercel** | Root `frontend`, `next build` ([`frontend/vercel.json`](frontend/vercel.json)) |
| Backend | **Render** | Node web service, `npm start`, health `/api/health` ([`render.yaml`](render.yaml)) |
| Database | **MongoDB Atlas** | Prisma datasource |
| Cache (opt) | Redis (e.g. Upstash) | `REDIS_URL` |

Deploy order: **Atlas → Render (backend) → Vercel (frontend) → wire `CLIENT_ORIGINS`.** The full walkthrough is in **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## ⚡ Performance Optimizations

- **Server-side pagination & filtering** — the client never over-fetches; queries are bounded by `page`/`limit`.
- **Optional Redis caching** — trending, recommendations and hot product queries cached with TTLs; **degrades gracefully** to direct computation when Redis is absent.
- **Database indexing** — Prisma `@@index` on region, category, rating, and analytics query paths; unique `externalId` for O(1) dedupe.
- **Batched/parallel DB writes** — ingestion and trending recompute run in concurrent chunks (cut recompute from >3 min to ~20s).
- **Fire-and-forget analytics** — view/cart events never block the response path.
- **Image optimization** — `next/image` with configured remote hosts (DummyJSON/FakeStore).
- **Automatic code splitting** + static prerendering of most routes; `Suspense` boundary around `useSearchParams`.
- **Motion budget** — GSAP only on the hero, IntersectionObserver-based reveals, and a global `prefers-reduced-motion` guard for 60fps.

## 🔒 Security

- **JWT** bearer auth ([`lib/token.js`](backend/src/lib/token.js)) + **NextAuth** session wrapping the token on the client.
- **Password hashing** with bcrypt.
- **RBAC** middleware (`requireAdmin`) protecting all mutating catalog, ingestion, analytics, and inventory routes.
- **Zod validation** on body/query/params via a reusable `validate` middleware.
- **CORS** with an explicit allow-list + safe Vercel wildcard matching; credentials enabled.
- **Rate limiting** — global, auth, and heavy-operation limiters (`express-rate-limit`).
- **Centralized error handling** — no stack traces leaked in production; Prisma errors mapped to clean HTTP codes.
- **Secrets via environment** only; `.env*` git-ignored.

---

## 🧩 Challenges Solved

- **Production CORS across two hosts** — Vercel previews use dynamic subdomains; implemented a real suffix-matcher (`origin.endsWith('.vercel.app')`) plus an env-extendable allow-list, and traced a "still blocked" bug to a **branch/deploy gap** (fix commits weren't on the deployed `main`).
- **TypeScript → JavaScript migration** — converted the entire backend to CommonJS while preserving Prisma and the architecture, with a `migrate-legacy` script to backfill new required fields on existing documents.
- **Dual-token auth** — bridging NextAuth's session model with a standalone Express API by carrying the API's JWT inside the NextAuth session and reflecting it via an Axios interceptor.
- **Region-aware recommendations** — designing an analytics schema (`ProductView`/`CartEvent`/`PurchaseEvent` → `RegionAnalytics`) and two explainable scoring formulas instead of an opaque ML model.
- **Catalog ingestion & dedupe** — normalizing two differently-shaped external APIs into one schema and idempotent `upsert` keyed on a synthetic `externalId`.

## 🔭 Future Improvements

- Swap `contains` search for **MongoDB Atlas Search** (fuzzy/typo-tolerant) behind the same `searchService` contract.
- Move background jobs to **BullMQ + Redis** workers; add **email automation** (order/price-drop/low-stock).
- Adopt **React Query/SWR** for client caching + optimistic cart updates, and shift more data fetching to **Server Components**.
- Add automated tests (Jest/Vitest + Playwright) and CI.
- Remove the stale `backend/vercel.json` (it references the pre-migration `src/server.ts`).

## 🎓 Learning Outcomes

Building QuickKart demonstrates the ability to design and ship a **decoupled full-stack system** end to end: a layered REST API with real auth/RBAC/validation, a data pipeline feeding recommendation logic, an ORM + indexed NoSQL data model, and a polished, accessible, animated frontend — then **deploy it to production** across Vercel + Render + Atlas and debug real-world issues (CORS, cold starts, branch/deploy gaps, dependency compatibility).

## 🌟 Why This Project Stands Out

- **Not a CRUD clone** — it has a genuine analytics → trending → recommendation pipeline with documented, explainable scoring.
- **Production-grade backend** — clean layering, RBAC, Zod, centralized errors, rate limiting, graceful Redis fallback, and DB indexing.
- **Actually deployed & debugged** — live on Vercel + Render + Atlas, with the messy production problems (CORS, deploy gaps, dependency upgrades) solved and documented.
- **Premium, accessible UI** — dark-first design system with GSAP/Framer/Lenis motion that still respects `prefers-reduced-motion`.
- **Readable and honest** — reusable services/components, documented architecture, and a README that reflects the code rather than marketing.

---

<div align="center">
<sub>Built by <b>Anurag Kumar</b> — region-aware commerce, recommendations & analytics.</sub>
</div>
