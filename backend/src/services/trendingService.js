'use strict';

const { prisma } = require('../lib/prisma');
const cache = require('../lib/cache');
const logger = require('../lib/logger');
const { REGIONS, isValidRegion } = require('../lib/regions');

const WINDOW_DAYS = 30;
// National rankings are stored under this synthetic region key (region is required).
const GLOBAL = 'GLOBAL';

// Trending Score = views*0.2 + cartAdds*0.3 + purchases*0.5
const WEIGHTS = { views: 0.2, cartAdds: 0.3, purchases: 0.5 };

function ensure(map, productId) {
  if (!map.has(productId)) {
    map.set(productId, { productId, views: 0, clicks: 0, cartAdds: 0, purchases: 0 });
  }
  return map.get(productId);
}

// Run async work over items in parallel batches (keeps round-trips concurrent
// instead of sequential — important for remote DB latency).
async function inChunks(items, size, fn) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

/**
 * Aggregate signal counts per product for a region within the recent window.
 * Pass region=null to aggregate nationally (across all regions).
 */
async function aggregate(region) {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const scope = region ? { region } : {};
  const recent = { createdAt: { gte: since } };

  const [viewRows, cartRows, purchaseRows] = await Promise.all([
    prisma.productView.groupBy({
      by: ['productId', 'type'],
      where: { ...scope, ...recent },
      _count: { _all: true },
    }),
    prisma.cartEvent.groupBy({
      by: ['productId'],
      where: { ...scope, ...recent },
      _sum: { quantity: true },
      _count: { _all: true },
    }),
    prisma.purchaseEvent.groupBy({
      by: ['productId'],
      where: { ...scope, ...recent },
      _sum: { quantity: true },
      _count: { _all: true },
    }),
  ]);

  const map = new Map();
  for (const r of viewRows) {
    const e = ensure(map, r.productId);
    if (r.type === 'click') e.clicks += r._count._all;
    else e.views += r._count._all;
  }
  for (const r of cartRows) ensure(map, r.productId).cartAdds += r._sum.quantity || r._count._all;
  for (const r of purchaseRows) {
    ensure(map, r.productId).purchases += r._sum.quantity || r._count._all;
  }

  return [...map.values()].map((e) => ({
    ...e,
    trendingScore:
      e.views * WEIGHTS.views + e.cartAdds * WEIGHTS.cartAdds + e.purchases * WEIGHTS.purchases,
  }));
}

/** Recompute and persist rankings for one region (null = national/GLOBAL). */
async function recompute(region) {
  const regionKey = region || GLOBAL;
  const rows = await aggregate(region);

  await inChunks(rows, 25, (r) =>
    prisma.regionAnalytics.upsert({
      where: { region_productId: { region: regionKey, productId: r.productId } },
      create: {
        region: regionKey,
        productId: r.productId,
        views: r.views,
        clicks: r.clicks,
        cartAdds: r.cartAdds,
        purchases: r.purchases,
        trendingScore: r.trendingScore,
      },
      update: {
        views: r.views,
        clicks: r.clicks,
        cartAdds: r.cartAdds,
        purchases: r.purchases,
        trendingScore: r.trendingScore,
      },
    })
  );

  await cache.del(`trending:${regionKey}:*`);
  await cache.del('recs:*');
  return rows.length;
}

async function recomputeAll() {
  const result = {};
  for (const region of [...REGIONS, null]) {
    result[region || GLOBAL] = await recompute(region);
  }
  logger.info('[trending] recompute complete:', JSON.stringify(result));
  return result;
}

/** Join RegionAnalytics rows to full product objects (+ trending metadata). */
async function withProducts(rows) {
  const ids = rows.map((r) => r.productId);
  if (!ids.length) return [];
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const map = new Map(products.map((p) => [p.id, p]));
  return rows
    .map((r) => {
      const p = map.get(r.productId);
      return p
        ? {
            ...p,
            trendingScore: Math.round(r.trendingScore * 100) / 100,
            signals: { views: r.views, cartAdds: r.cartAdds, purchases: r.purchases },
          }
        : null;
    })
    .filter(Boolean);
}

/**
 * Top trending products for a region. Falls back to national rankings, then to
 * top-rated products, so the UI is never empty (important for fresh demos).
 */
async function getTrending({ region, limit = 10 }) {
  const regionKey = region && isValidRegion(region) ? region : GLOBAL;
  return cache.getOrSet(`trending:${regionKey}:${limit}`, cache.TTL.medium, async () => {
    let rows = await prisma.regionAnalytics.findMany({
      where: { region: regionKey },
      orderBy: { trendingScore: 'desc' },
      take: limit,
    });
    if (!rows.length && regionKey !== GLOBAL) {
      rows = await prisma.regionAnalytics.findMany({
        where: { region: GLOBAL },
        orderBy: { trendingScore: 'desc' },
        take: limit,
      });
    }
    if (!rows.length) {
      const products = await prisma.product.findMany({
        orderBy: [{ rating: 'desc' }, { ratingCount: 'desc' }],
        take: limit,
      });
      return products.map((p) => ({ ...p, trendingScore: 0 }));
    }
    return withProducts(rows);
  });
}

module.exports = { recompute, recomputeAll, getTrending, withProducts, aggregate, GLOBAL };
