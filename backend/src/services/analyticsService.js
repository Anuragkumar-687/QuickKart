'use strict';

const { prisma } = require('../lib/prisma');
const logger = require('../lib/logger');

// ---------------------------------------------------------------------------
// Region resolution
// ---------------------------------------------------------------------------

async function resolveRegion({ userId, region }) {
  if (region) return region;
  if (!userId) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { region: true },
    });
    return user?.region || null;
  } catch (_) {
    return null;
  }
}

async function resolveRegionState(userId) {
  if (!userId) return { region: null, state: null };
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { region: true, state: true },
    });
    return { region: user?.region || null, state: user?.state || null };
  } catch (_) {
    return { region: null, state: null };
  }
}

// ---------------------------------------------------------------------------
// Event recording (best-effort — analytics must never break the main request)
// ---------------------------------------------------------------------------

async function recordView({ productId, userId = null, region, type = 'view' }) {
  try {
    const r = await resolveRegion({ userId, region });
    await prisma.productView.create({ data: { productId, userId, region: r, type } });
  } catch (err) {
    logger.warn('[analytics] recordView failed:', err.message);
  }
}

async function recordCartAdd({ productId, userId = null, region, quantity = 1 }) {
  try {
    const r = await resolveRegion({ userId, region });
    await prisma.cartEvent.create({ data: { productId, userId, region: r, quantity } });
  } catch (err) {
    logger.warn('[analytics] recordCartAdd failed:', err.message);
  }
}

// `price` is the line total (unit price × quantity) at purchase time.
async function recordPurchase({
  productId,
  userId = null,
  region = null,
  state = null,
  category = null,
  quantity = 1,
  price = 0,
}) {
  try {
    await prisma.purchaseEvent.create({
      data: { productId, userId, region, state, category, quantity, price },
    });
  } catch (err) {
    logger.warn('[analytics] recordPurchase failed:', err.message);
  }
}

// Generic entry point used by POST /analytics/track
async function track({ type, productId, userId = null, region }) {
  if (type === 'cart_add') return recordCartAdd({ productId, userId, region });
  return recordView({ productId, userId, region, type: type === 'click' ? 'click' : 'view' });
}

// ---------------------------------------------------------------------------
// Dashboards (MongoDB aggregation via Prisma groupBy)
// ---------------------------------------------------------------------------

async function attachProducts(rows) {
  const ids = [...new Set(rows.map((r) => r.productId))];
  if (!ids.length) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, image: true, price: true, category: true, rating: true },
  });
  const map = new Map(products.map((p) => [p.id, p]));
  return rows
    .map((r) => ({ ...r, product: map.get(r.productId) || null }))
    .filter((r) => r.product);
}

async function mostViewedProducts(limit = 10) {
  const grouped = await prisma.productView.groupBy({
    by: ['productId'],
    _count: { productId: true },
    orderBy: { _count: { productId: 'desc' } },
    take: limit,
  });
  return attachProducts(grouped.map((g) => ({ productId: g.productId, views: g._count.productId })));
}

async function topCategories(limit = 10) {
  const grouped = await prisma.purchaseEvent.groupBy({
    by: ['category'],
    where: { category: { not: null } },
    _sum: { quantity: true, price: true },
    _count: { _all: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });
  return grouped.map((g) => ({
    category: g.category,
    unitsSold: g._sum.quantity || 0,
    revenue: Number((g._sum.price || 0).toFixed(2)),
    orders: g._count._all,
  }));
}

async function topProductsByDimension(dimension, limitPerBucket = 5) {
  const grouped = await prisma.purchaseEvent.groupBy({
    by: [dimension, 'productId'],
    where: { [dimension]: { not: null } },
    _sum: { quantity: true, price: true },
    orderBy: { _sum: { quantity: 'desc' } },
  });

  const buckets = {};
  for (const g of grouped) {
    const key = g[dimension];
    (buckets[key] ||= []).push({
      productId: g.productId,
      unitsSold: g._sum.quantity || 0,
      revenue: Number((g._sum.price || 0).toFixed(2)),
    });
  }

  const result = {};
  for (const [key, rows] of Object.entries(buckets)) {
    result[key] = await attachProducts(rows.slice(0, limitPerBucket));
  }
  return result;
}

async function getRegionDashboard({ limit = 5 } = {}) {
  const [topProductsByRegion, topProductsByState, mostPurchasedCategories, mostViewed] =
    await Promise.all([
      topProductsByDimension('region', limit),
      topProductsByDimension('state', limit),
      topCategories(limit * 2),
      mostViewedProducts(limit * 2),
    ]);

  return {
    topProductsByRegion,
    topProductsByState,
    mostPurchasedCategories,
    mostViewedProducts: mostViewed,
  };
}

module.exports = {
  resolveRegion,
  resolveRegionState,
  recordView,
  recordCartAdd,
  recordPurchase,
  track,
  mostViewedProducts,
  topCategories,
  getRegionDashboard,
};
