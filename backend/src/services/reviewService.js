'use strict';

const { prisma } = require('../lib/prisma');
const ApiError = require('../lib/ApiError');
const cache = require('../lib/cache');

const round1 = (n) => Math.round(n * 10) / 10;

async function listForProduct(productId) {
  return prisma.review.findMany({
    where: { productId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Recompute a product's aggregate rating from its reviews.
 * Only overwrites Product.rating when at least one user review exists — this
 * preserves the source/ingested rating for products that have no reviews yet.
 */
async function recomputeProductRating(productId) {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { _all: true },
  });
  if (agg._count._all > 0) {
    const rating = round1(agg._avg.rating || 0);
    await prisma.product.update({
      where: { id: productId },
      data: { rating, ratingCount: agg._count._all },
    });
    return { rating, ratingCount: agg._count._all };
  }
  return null;
}

// One review per user per product → create or update.
async function upsertReview(userId, productId, { rating, comment }) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) throw ApiError.notFound('Product not found');

  const review = await prisma.review.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, rating, comment },
    update: { rating, comment },
    include: { user: { select: { id: true, name: true } } },
  });

  await recomputeProductRating(productId);
  await cache.del('products:*');
  return review;
}

async function deleteReview(userId, reviewId, isAdmin = false) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw ApiError.notFound('Review not found');
  if (review.userId !== userId && !isAdmin) {
    throw ApiError.forbidden('You can only delete your own review');
  }
  await prisma.review.delete({ where: { id: reviewId } });
  await recomputeProductRating(review.productId);
  await cache.del('products:*');
  return { success: true };
}

module.exports = { listForProduct, upsertReview, deleteReview, recomputeProductRating };
