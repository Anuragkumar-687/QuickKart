'use strict';

const { prisma } = require('../lib/prisma');
const cache = require('../lib/cache');
const { isValidRegion } = require('../lib/regions');
const analyticsService = require('./analyticsService');
const trendingService = require('./trendingService');

const GLOBAL = trendingService.GLOBAL;
const round3 = (n) => Math.round(n * 1000) / 1000;

// Recommendation Score weights (rule-based, no ML):
//   40% regional popularity · 30% user interest · 20% rating · 10% recent trend
const W = { regionalPopularity: 0.4, userInterest: 0.3, rating: 0.2, recentTrend: 0.1 };

async function resolveRegion({ userId, region }) {
  if (region && isValidRegion(region)) return region;
  return analyticsService.resolveRegion({ userId, region });
}

async function withProducts(rows, extra = {}) {
  const ids = rows.map((r) => r.productId);
  if (!ids.length) return [];
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const map = new Map(products.map((p) => [p.id, p]));
  return rows.map((r) => (map.get(r.productId) ? { ...map.get(r.productId), ...extra(r) } : null)).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Popular In Your Region — ranked by purchases in the region
// ---------------------------------------------------------------------------

async function getRegionPopular({ userId = null, region = null, limit = 10 }) {
  const r = await resolveRegion({ userId, region });
  const regionKey = r && isValidRegion(r) ? r : GLOBAL;

  return cache.getOrSet(`recs:regionpopular:${regionKey}:${limit}`, cache.TTL.medium, async () => {
    let rows = await prisma.regionAnalytics.findMany({
      where: { region: regionKey },
      orderBy: [{ purchases: 'desc' }, { trendingScore: 'desc' }],
      take: limit,
    });
    if (!rows.length && regionKey !== GLOBAL) {
      rows = await prisma.regionAnalytics.findMany({
        where: { region: GLOBAL },
        orderBy: [{ purchases: 'desc' }],
        take: limit,
      });
    }
    if (!rows.length) {
      return prisma.product.findMany({
        orderBy: [{ ratingCount: 'desc' }, { rating: 'desc' }],
        take: limit,
      });
    }
    return withProducts(rows, (row) => ({ regionPurchases: row.purchases }));
  });
}

// ---------------------------------------------------------------------------
// Recently Viewed
// ---------------------------------------------------------------------------

async function getRecentlyViewed({ userId, limit = 10 }) {
  if (!userId) return [];
  const views = await prisma.productView.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { productId: true },
    take: 80,
  });

  const seen = new Set();
  const ids = [];
  for (const v of views) {
    if (!seen.has(v.productId)) {
      seen.add(v.productId);
      ids.push(v.productId);
    }
    if (ids.length >= limit) break;
  }
  if (!ids.length) return [];

  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const map = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Recommended For You — weighted rule-based scoring
// ---------------------------------------------------------------------------

async function getUserInterest(userId) {
  if (!userId) return {};
  const [purchases, recentViews] = await Promise.all([
    prisma.purchaseEvent.groupBy({
      by: ['category'],
      where: { userId, category: { not: null } },
      _sum: { quantity: true },
    }),
    prisma.productView.findMany({
      where: { userId },
      select: { productId: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  const weights = {};
  for (const p of purchases) {
    weights[p.category] = (weights[p.category] || 0) + (p._sum.quantity || 1) * 3; // purchases weighted higher
  }

  const viewedIds = [...new Set(recentViews.map((v) => v.productId))];
  if (viewedIds.length) {
    const prods = await prisma.product.findMany({
      where: { id: { in: viewedIds } },
      select: { category: true },
    });
    for (const p of prods) weights[p.category] = (weights[p.category] || 0) + 1;
  }
  return weights;
}

async function getPersonalized({ userId = null, region = null, limit = 10 }) {
  const r = await resolveRegion({ userId, region });
  const regionKey = r && isValidRegion(r) ? r : GLOBAL;
  const cacheKey = `recs:personalized:${userId || 'anon'}:${regionKey}:${limit}`;

  return cache.getOrSet(cacheKey, cache.TTL.medium, async () => {
    const [regionRows, globalRows, interest] = await Promise.all([
      prisma.regionAnalytics.findMany({
        where: { region: regionKey },
        orderBy: { trendingScore: 'desc' },
        take: 60,
      }),
      prisma.regionAnalytics.findMany({
        where: { region: GLOBAL },
        orderBy: { trendingScore: 'desc' },
        take: 60,
      }),
      getUserInterest(userId),
    ]);

    const regionScore = new Map(regionRows.map((r2) => [r2.productId, r2.trendingScore]));
    const globalScore = new Map(globalRows.map((r2) => [r2.productId, r2.trendingScore]));
    const maxRegion = Math.max(1, ...regionRows.map((r2) => r2.trendingScore));
    const maxGlobal = Math.max(1, ...globalRows.map((r2) => r2.trendingScore));
    const interestCats = Object.keys(interest);
    const maxInterest = Math.max(1, ...Object.values(interest));

    // Candidate set = regional trending ∪ interest-category products ∪ top-rated
    const candidateIds = new Set(regionScore.keys());
    if (interestCats.length) {
      const interestProducts = await prisma.product.findMany({
        where: { category: { in: interestCats } },
        orderBy: [{ rating: 'desc' }],
        take: 40,
        select: { id: true },
      });
      interestProducts.forEach((p) => candidateIds.add(p.id));
    }
    const topRated = await prisma.product.findMany({
      orderBy: [{ rating: 'desc' }, { ratingCount: 'desc' }],
      take: 40,
      select: { id: true },
    });
    topRated.forEach((p) => candidateIds.add(p.id));

    const products = await prisma.product.findMany({ where: { id: { in: [...candidateIds] } } });

    const scored = products.map((p) => {
      const regionalPopularity = (regionScore.get(p.id) || 0) / maxRegion;
      const userInterest = (interest[p.category] || 0) / maxInterest;
      const rating = (p.rating || 0) / 5;
      const recentTrend = (globalScore.get(p.id) || 0) / maxGlobal;
      const score =
        W.regionalPopularity * regionalPopularity +
        W.userInterest * userInterest +
        W.rating * rating +
        W.recentTrend * recentTrend;
      return {
        ...p,
        recommendationScore: round3(score),
        scoreBreakdown: {
          regionalPopularity: round3(regionalPopularity),
          userInterest: round3(userInterest),
          rating: round3(rating),
          recentTrend: round3(recentTrend),
        },
      };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
    return scored.slice(0, limit);
  });
}

// ---------------------------------------------------------------------------
// Frequently Bought Together (OrderItem co-occurrence)
// ---------------------------------------------------------------------------

async function getBundles(productId, limit = 6) {
  return cache.getOrSet(`recs:bundles:${productId}:${limit}`, cache.TTL.long, async () => {
    const inOrders = await prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
      take: 1000,
    });
    const orderIds = [...new Set(inOrders.map((o) => o.orderId))];
    if (!orderIds.length) return [];

    const co = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { orderId: { in: orderIds }, productId: { not: productId } },
      _count: { _all: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });
    if (!co.length) return [];

    const ids = co.map((c) => c.productId);
    const products = await prisma.product.findMany({ where: { id: { in: ids } } });
    const map = new Map(products.map((p) => [p.id, p]));
    return co
      .map((c) => (map.get(c.productId) ? { ...map.get(c.productId), boughtTogetherCount: c._count._all } : null))
      .filter(Boolean);
  });
}

module.exports = {
  getRegionPopular,
  getRecentlyViewed,
  getPersonalized,
  getBundles,
  getUserInterest,
};
