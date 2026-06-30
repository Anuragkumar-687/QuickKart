'use strict';

const { prisma } = require('../lib/prisma');
const { fetchJson } = require('../lib/httpClient');
const cache = require('../lib/cache');
const logger = require('../lib/logger');

const DUMMYJSON_URL = 'https://dummyjson.com/products?limit=0';
const FAKESTORE_URL = 'https://fakestoreapi.com/products';

function titleCase(value) {
  return String(value || 'Uncategorized')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Normalizers — map each external API into our common product schema:
//   { externalId, source, name, description, price, category, image,
//     rating, ratingCount, stock, brand }
// ---------------------------------------------------------------------------

function normalizeDummyJson(p) {
  return {
    externalId: `dummyjson-${p.id}`,
    source: 'dummyjson',
    name: p.title,
    description: p.description || '',
    price: Number(p.price) || 0,
    category: titleCase(p.category),
    image: p.thumbnail || (Array.isArray(p.images) && p.images[0]) || '',
    rating: Number(p.rating) || 0,
    ratingCount: Array.isArray(p.reviews) ? p.reviews.length : 0,
    stock: Number.isFinite(p.stock) ? p.stock : 0,
    brand: p.brand || null,
  };
}

function normalizeFakeStore(p) {
  return {
    externalId: `fakestore-${p.id}`,
    source: 'fakestore',
    name: p.title,
    description: p.description || '',
    price: Number(p.price) || 0,
    category: titleCase(p.category),
    image: p.image || '',
    rating: Number(p.rating && p.rating.rate) || 0,
    ratingCount: Number(p.rating && p.rating.count) || 0,
    stock: 50, // FakeStore has no stock field — default to a sensible value
    brand: null,
  };
}

// ---------------------------------------------------------------------------
// Upsert with de-duplication (keyed on the unique externalId)
// ---------------------------------------------------------------------------

async function upsertOne(item) {
  if (!item.name || !item.image) return 'failed';
  try {
    const existing = await prisma.product.findUnique({
      where: { externalId: item.externalId },
      select: { id: true },
    });
    await prisma.product.upsert({
      where: { externalId: item.externalId },
      create: item,
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        rating: item.rating,
        ratingCount: item.ratingCount,
        brand: item.brand,
        stock: item.stock,
      },
    });
    return existing ? 'updated' : 'created';
  } catch (err) {
    logger.warn(`[ingest] upsert failed for ${item.externalId}:`, err.message);
    return 'failed';
  }
}

// Upsert in parallel batches to keep DB round-trips concurrent.
async function upsertProducts(items) {
  const counts = { created: 0, updated: 0, failed: 0, processed: items.length };
  const CHUNK = 20;
  for (let i = 0; i < items.length; i += CHUNK) {
    const results = await Promise.all(items.slice(i, i + CHUNK).map(upsertOne));
    for (const r of results) counts[r] += 1;
  }
  return counts;
}

async function syncFromDummyJson() {
  const json = await fetchJson(DUMMYJSON_URL);
  const items = (json.products || []).map(normalizeDummyJson);
  return upsertProducts(items);
}

async function syncFromFakeStore() {
  const json = await fetchJson(FAKESTORE_URL);
  const items = (Array.isArray(json) ? json : []).map(normalizeFakeStore);
  return upsertProducts(items);
}

/**
 * Sync all sources. Resilient: a failure in one source does not abort the
 * other. Busts the product list cache afterwards.
 */
async function syncAll() {
  const startedAt = Date.now();
  logger.info('[ingest] starting product sync (DummyJSON + FakeStore)…');

  const sources = {};
  const errors = [];

  try {
    sources.dummyjson = await syncFromDummyJson();
  } catch (err) {
    errors.push(`dummyjson: ${err.message}`);
    logger.warn('[ingest] dummyjson failed:', err.message);
  }

  try {
    sources.fakestore = await syncFromFakeStore();
  } catch (err) {
    errors.push(`fakestore: ${err.message}`);
    logger.warn('[ingest] fakestore failed:', err.message);
  }

  await cache.del('products:*');

  const totalProducts = await prisma.product.count();
  const summary = { durationMs: Date.now() - startedAt, sources, totalProducts, errors };
  logger.info('[ingest] sync complete:', JSON.stringify(summary));
  return summary;
}

async function getStatus() {
  const [total, bySource] = await Promise.all([
    prisma.product.count(),
    prisma.product.groupBy({ by: ['source'], _count: { _all: true } }),
  ]);
  return {
    total,
    bySource: bySource.map((s) => ({ source: s.source, count: s._count._all })),
  };
}

module.exports = {
  syncAll,
  syncFromDummyJson,
  syncFromFakeStore,
  getStatus,
  normalizeDummyJson,
  normalizeFakeStore,
};
