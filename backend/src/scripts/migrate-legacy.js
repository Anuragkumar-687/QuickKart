'use strict';

/**
 * One-time data migration for the Phase 1/2 schema upgrade.
 *
 * Adding new *required* fields (Product.externalId unique, Product.rating/…,
 * User.updatedAt, CartItem timestamps) to collections that already hold legacy
 * documents would (a) fail the unique index build and (b) make Prisma reads
 * throw "field is required, got null". This backfills sane values on the
 * existing documents using native Mongo pipeline updates (which bypass Prisma's
 * read validation). It is idempotent — safe to run multiple times.
 *
 *   node src/scripts/migrate-legacy.js
 */

const { prisma } = require('../lib/prisma');
const logger = require('../lib/logger');

async function backfill(collection, set) {
  return prisma.$runCommandRaw({
    update: collection,
    updates: [{ q: {}, u: [{ $set: set }], multi: true }],
  });
}

async function main() {
  logger.info('[migrate] backfilling legacy documents for new required fields…');

  await backfill('Product', {
    externalId: {
      $ifNull: ['$externalId', { $concat: ['legacy-', { $toString: '$_id' }] }],
    },
    source: { $ifNull: ['$source', 'seed'] },
    rating: { $ifNull: ['$rating', 0] },
    ratingCount: { $ifNull: ['$ratingCount', 0] },
    stock: { $ifNull: ['$stock', 0] },
  });

  await backfill('User', {
    createdAt: { $ifNull: ['$createdAt', '$$NOW'] },
    updatedAt: { $ifNull: ['$updatedAt', { $ifNull: ['$createdAt', '$$NOW'] }] },
  });

  await backfill('CartItem', {
    quantity: { $ifNull: ['$quantity', 1] },
    savedForLater: { $ifNull: ['$savedForLater', false] },
    createdAt: { $ifNull: ['$createdAt', '$$NOW'] },
    updatedAt: { $ifNull: ['$updatedAt', '$$NOW'] },
  });

  logger.info('[migrate] done. You can now run `npx prisma db push`.');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  logger.error('[migrate] failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
