<div align="center">
  <h1>🛒 QuickKart</h1>
  <p>A region-aware, production-style commerce platform — API-driven catalog, analytics pipeline, and a rule-based recommendation engine.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  </p>
</div>

<br />

## 📋 Table of Contents
- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [How the Intelligence Works](#-how-the-intelligence-works)
- [Background Jobs & Caching](#-background-jobs--caching)
- [Roadmap (Phase 3)](#-roadmap-phase-3)
- [Verification Checklist](#-verification-checklist)

## 🚀 Overview

QuickKart started as a simple CRUD shop and has been refactored into a **production-style, region-aware commerce platform**:

- The catalog is **ingested from external APIs** (DummyJSON + FakeStore), normalized into a common schema, deduplicated, and stored in MongoDB.
- Product APIs are fully **server-side**: pagination, search, category filtering and sorting.
- A lightweight **analytics pipeline** records views, clicks, cart-adds and purchases, tagged by region.
- A **regional trending engine** and a **rule-based recommendation engine** power personalized homepage rails ("Trending Near You", "Popular In Your Region", "Recommended For You", "Recently Viewed").
- Security is hardened with **JWT auth, RBAC, Zod validation, centralized error handling and rate limiting**.

The entire codebase is **JavaScript** (the backend was migrated off TypeScript to plain Node/Express + CommonJS).

## 🏗 Architecture

```
Next.js (App Router, React 19, Tailwind)
        │  axios + NextAuth (JWT)
        ▼
Express API  ──►  Middleware (auth · RBAC · Zod validate · rate-limit · errors)
        │
        ▼
Service Layer  (products · ingestion · cart · orders · reviews · wishlist ·
        │       analytics · trending · recommendations · search · inventory)
        ▼
Prisma ORM  ──►  MongoDB Atlas
        │
        ▼
Redis (optional)  ──►  caching for trending / recommendations / hot queries
node-cron        ──►  background jobs (catalog refresh · trending recompute)
```

> **Redis is optional.** With no `REDIS_URL` set the app runs exactly the same — the cache layer becomes a transparent pass-through (graceful degradation).

## 🛠 Tech Stack

| Layer        | Technology |
|--------------|-----------|
| Frontend     | Next.js 16 (App Router), React 19, Tailwind CSS v4, NextAuth, Axios, GSAP, lucide-react |
| Backend      | Node.js, Express 5, **JavaScript (CommonJS)** |
| Database     | MongoDB Atlas + Prisma ORM v5 |
| Validation   | Zod |
| Auth         | JWT + bcryptjs + NextAuth (credentials) |
| Caching      | Redis (ioredis) — optional |
| Jobs         | node-cron |
| Analytics    | MongoDB Aggregation (Prisma `groupBy` + `$runCommandRaw`) |

## ✨ Features

### Phase 1 — Production Commerce Foundation
- **Product ingestion service** — pulls from DummyJSON + FakeStore, normalizes to `{ id, title→name, description, price, category, image, rating, stock, source }`, deduplicates by a unique `externalId`, and exposes a **scheduled refresh** endpoint.
- **Server-side product APIs** — `?page`, `?limit`, `?search`, `?category`, `?sort` (`price_asc|price_desc|rating_desc|newest|name_asc`).
- **Cart** — increase / decrease quantity, remove, **Save For Later**, and **stock validation** everywhere.
- **Security** — RBAC middleware (admin-only routes), Zod request validation, centralized error handling, rate limiting.
- **Reviews & ratings** (one per user/product, aggregate recompute) and **Wishlist** (toggle).

### Phase 2 — Region-Aware Intelligence
- **User regions** — `state / city / pincode`, with `region` (North/South/East/West/Northeast) auto-derived from state.
- **Analytics tracking** — `ProductView`, `CartEvent`, `PurchaseEvent`, aggregated into `RegionAnalytics`.
- **Regional trending engine** — `views*0.2 + cartAdds*0.3 + purchases*0.5`, ranked per region.
- **Recommendation engine** — `0.4·regionalPopularity + 0.3·userInterest + 0.2·rating + 0.1·recentTrend`.
- **Dashboard APIs** — top products by region/state, most-purchased categories, most-viewed products.

### Phase 3 — Flipkart-style layer (included baseline)
- **Frequently Bought Together** (OrderItem co-occurrence) · **Smart search** + suggestions · **Demand forecasting** (per region/category) · **Inventory intelligence** (low-stock / high-demand / reorder suggestions).

## 📁 Project Structure

```text
backend/src/
├── config/env.js            # centralized env access
├── lib/                     # prisma, redis, cache, logger, regions, token, ApiError…
├── middleware/              # auth, rbac, validate (Zod), errorHandler, rateLimit
├── validators/              # Zod schemas per domain
├── services/                # business logic (products, ingestion, cart, orders,
│                            #   reviews, wishlist, analytics, trending,
│                            #   recommendations, search, inventory, forecast)
├── controllers/             # thin HTTP handlers
├── routes/                  # one router per domain
├── jobs/scheduler.js        # node-cron background jobs
├── scripts/                 # ingest.js, migrate-legacy.js
├── seed.js · make-admin.js
└── server.js                # app bootstrap

frontend/src/
├── app/                     # App Router pages (home, products, cart, wishlist, admin…)
├── components/              # ProductCard, RatingStars, RecommendationSection, Navbar…
├── context/                 # CartContext, WishlistContext
└── lib/api.js               # axios instance w/ auth interceptor
```

## 🚀 Getting Started

### Prerequisites
- Node.js **18+** (tested on Node 26 — backend uses the global `fetch`)
- A MongoDB Atlas connection string
- (Optional) Redis, for caching

### 1. Backend
```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL + JWT_SECRET
npm install                   # also runs `prisma generate`
npm run prisma:push           # apply schema + indexes to Atlas
npm run seed                  # users + ingested catalog + demo analytics + trending
npm run dev                   # http://localhost:5000
```

> If you upgraded an existing database that already had products, run `node src/scripts/migrate-legacy.js` once **before** `prisma:push` to backfill new required fields.

### 2. Frontend
```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL + NEXTAUTH_SECRET
npm install
npm run dev                        # http://localhost:3000
```

### Default credentials (after `npm run seed`)
| Role  | Email                  | Password      | Region |
|-------|------------------------|---------------|--------|
| Admin | `admin@quickkart.com`  | `password123` | North  |
| User  | `user@quickkart.com`   | `password123` | West   |

Promote any user with: `npm run make-admin -- their@email.com`.

## 📡 API Reference

Base path: `/api`

### Auth
| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/auth/signup` | `{ name, email, password, state?, city?, pincode? }` → region derived |
| POST | `/auth/login` | returns `{ token, user }` |
| GET / PATCH | `/auth/me` | profile (auth) |

### Products & Search
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/products` | `?page&limit&search&category&sort&source&minPrice&maxPrice` → `{ data, page, total, totalPages, hasNext }` |
| GET | `/products/:id` | also records a view |
| GET | `/products/categories` | distinct categories |
| POST/PUT/DELETE | `/products/:id` | **admin** |
| GET | `/search?q=` · `/search/suggestions?q=` | full-text-ish search |

### Cart & Orders (auth)
`GET /cart` · `POST /cart` · `PATCH /cart/:id` · `DELETE /cart/:id` · `POST /cart/:id/save` · `POST /cart/:id/move` · `GET/POST /orders`

### Reviews & Wishlist (auth)
`GET /products/:id/reviews` · `POST /products/:id/reviews` · `DELETE /reviews/:id` · `GET /wishlist` · `POST/DELETE /wishlist/:productId`

### Recommendations
`GET /recommendations/trending` · `/region` · `/personalized` (auth) · `/recently-viewed` (auth) · `/bundles/:productId`

### Analytics, Ingestion & Inventory (admin unless noted)
`POST /analytics/track` (public) · `POST /analytics/recompute` · `GET /analytics/regions` · `POST /ingestion/sync` · `GET /ingestion/status` · `GET /inventory/alerts` · `GET /inventory/forecast`

## 🧠 How the Intelligence Works

**Trending score** (per region, recent 30-day window), persisted to `RegionAnalytics`:
```
score = views·0.2 + cartAdds·0.3 + purchases·0.5
```

**Recommendation score** (each component normalized 0–1):
```
score = 0.40·regionalPopularity + 0.30·userInterest + 0.20·rating + 0.10·recentTrend
```
`userInterest` is built from the categories a user has viewed/purchased (purchases weighted higher). All feeds fall back gracefully (region → national → top-rated) so the UI is never empty.

## ⚙️ Background Jobs & Caching
- **Jobs** (`ENABLE_CRON=true`): daily catalog refresh (`03:00`) + trending recompute (`*/30m`) via node-cron. Upgrade path: BullMQ + Redis workers.
- **Caching** (`REDIS_URL` set): trending, recommendations and hot product queries are cached with sensible TTLs and busted on writes/recompute. Without Redis everything still works.

## 🗺 Roadmap (Phase 3)
Baseline implementations are included for FBT, smart search, demand forecasting and inventory intelligence. Natural next steps:
- **MongoDB Atlas Search** for fuzzy/typo-tolerant search (drop-in replacement in `searchService`).
- **Recharts** admin analytics dashboard UI (the `/analytics/regions` API is ready).
- **BullMQ** background queues + **email automation** (order confirmation, price-drop & low-stock alerts).
- API monitoring / structured logging exporters.

## ✅ Verification Checklist
```bash
# Backend
curl "localhost:5000/api/products?page=1&limit=5&sort=price_desc"
curl "localhost:5000/api/products?search=iphone"
curl "localhost:5000/api/recommendations/trending?region=West"
# Auth flow: register → login → add to cart → checkout → review → wishlist
# Admin:    login as admin → POST /api/ingestion/sync → GET /api/analytics/regions
```
- `cd frontend && npm run build` — should compile all routes with no errors.

---
<div align="center">
  <p>Built by Anurag Kumar — region-aware commerce, recommendations & analytics.</p>
</div>
