# QuickKart UI Redesign — "Midnight Bazaar"

**Date:** 2026-08-20
**Branch:** `redesign/marketplace-ui`
**Goal:** Replace a generic dark-indigo "AI SaaS" surface with a dense, animated, dark marketplace storefront.

---

## Problem

The existing frontend is a SaaS landing-page skeleton wearing an ecommerce costume. The specific tells:

| Tell | Location |
|---|---|
| Indigo→purple→cyan gradient text | `globals.css` `--accent: #6366f1`, `.text-gradient` |
| Aurora blur blobs behind all content | `AuroraBackground.jsx`, mounted in `layout.jsx` |
| Floating glass pill navbar | `Navbar.jsx` `.glass rounded-2xl` |
| Centered hero, ping-dot badge, word-stagger headline | `page.jsx` |
| "Why QuickKart AI" 4-icon-card grid | `page.jsx` |
| Marquee testimonials with invented names | `page.jsx` |
| Newsletter slab + final CTA slab | `page.jsx` |
| 3D-tilting product cards | `TiltCard.jsx` |

Real marketplaces lead with **merchandising** — search, categories, deals, price, rating — not with marketing copy about themselves.

## Direction (user-selected)

- **Personality:** Modern marketplace (Flipkart/Amazon DNA, well-designed). Dense, product-first.
- **Theme:** Dark default, light available via existing `ThemeToggle`.
- **Market:** ₹ INR, India.
- **Motion:** Rich — GSAP ScrollTrigger choreography plus one deliberate three.js showpiece.

Reference sites supplied by the user are **inspiration only**; nothing is copied.

## Constraint: no fabricated commerce data

`Product` in `prisma/schema.prisma` has `price`, `rating`, `ratingCount`, `brand`, `stock` — **no `mrp` or `discountPercent`**.

Therefore:
- The card renders MRP strikethrough and "% off" **only when those fields are present** on the payload. No invented discounts.
- ₹ rendering is **display-only formatting with Indian digit grouping**. No exchange rate is applied, because inventing one would corrupt real order totals. True INR is a backend data migration, tracked separately.

## Design

### 1. Tokens (`globals.css`)

Warm-neutral dark. Almost every AI-generated dark UI is cool (indigo/violet/cyan); warmth plus density is what reads as *retail* instead of *dashboard*.

- `--background: #0b0b0c` (true neutral, no blue tint), `--card: #141416`
- `--primary: #f5a524` saffron — actions only
- `--savings: #22c55e` — reserved exclusively for savings and in-stock
- Borders are real dividers, not decoration
- Prices use `tabular-nums` so digits do not jitter between grid rows
- Hero type drops from `text-7xl` to `text-4xl` — marketplaces do not shout

**Deleted:** `.text-gradient`, `.animate-gradient`, `glow-accent`, `bg-noise`, indigo `--accent`.

### 2. Chrome

- `AuroraBackground` removed from `layout.jsx` and deleted.
- Navbar becomes **solid, anchored, two-tier**: utility row (deliver-to region, orders, help) above main row (logo · full-width search with category dropdown · cart/wishlist/account). Sticky; border appears on scroll. No glass, no float, no magnetic hover.
- Search is the visual centre of gravity.
- Footer becomes a compact marketplace footer.

### 3. Product card

Portrait image on a **light plate** — dark cards behind dark product photography turn to mush. Brand line, 2-line name, green rating chip `4.3 ★ (2,104)`, bold ₹ price in `tabular-nums`, stock urgency, wishlist on hover. Optional MRP/discount slot per the constraint above.

### 4. Motion language

Motion confirms **actions**; it does not decorate **surfaces**.

- **Keep:** `lenis` smooth scroll; `Reveal` retuned to 12px / 200ms (currently too slow and floaty).
- **Delete:** `TiltCard`, `Magnetic`, `AuroraBackground`.
- **Add:** GSAP ScrollTrigger section choreography; carousel spring transitions; rail arrow scroll-snap; cart fly-to-icon on add; count-badge pop; skeleton→content crossfade; filter chip `layoutId` transitions; sticky buy-box on PDP.
- All of it respects `prefers-reduced-motion`.

### 5. three.js showpiece

**One** bounded use: the hero deal carousel, rendered as a WebGL plane with a fluid displacement shader transitioning between slides.

- Lazy-loaded via `next/dynamic` with `ssr: false` so three.js stays out of the main bundle
- Static image fallback under `prefers-reduced-motion` and on WebGL context failure
- Never used on dense grid pages, where it would cost scroll performance

Decorative 3D everywhere is what made the old UI feel generated. One deliberate showpiece is what makes it feel designed.

### 6. Homepage structure

Category circle rail → WebGL deal carousel → Deals of the Day rail with countdown → Trending Near You → Popular in Region → personalized rails (authenticated) → dense featured grid → footer.

Removed: hero word-stagger, ping-dot badge, "Why QuickKart AI", testimonial marquee, newsletter, final CTA.

### 7. Inner pages

- `/products` — sticky filter rail, dense 5-up grid
- PDP — gallery, sticky buy-box, delivery estimator
- Cart — price-details panel
- Checkout — stepper
- Orders — status timeline
- Wishlist, auth, admin — restyled to the new system

## Build order

Tokens → chrome → motion primitives → card → homepage → inner pages → build/verify. Each checkpoint leaves the app coherent rather than half-migrated.

## Out of scope

- Backend schema changes (`mrp`, `discountPercent`, true INR pricing)
- New API endpoints
- Copy rewrite beyond removing invented testimonials and marketing claims
