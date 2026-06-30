'use strict';

const { prisma } = require('../lib/prisma');
const ApiError = require('../lib/ApiError');

async function getWishlist(userId) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function addToWishlist(userId, productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) throw ApiError.notFound('Product not found');

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });
  return getWishlist(userId);
}

async function removeFromWishlist(userId, productId) {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  return getWishlist(userId);
}

/** Toggle: removes if present, adds if absent. Returns { wishlisted, items }. */
async function toggle(userId, productId) {
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return { wishlisted: false, items: await getWishlist(userId) };
  }
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) throw ApiError.notFound('Product not found');
  await prisma.wishlistItem.create({ data: { userId, productId } });
  return { wishlisted: true, items: await getWishlist(userId) };
}

async function getWishlistProductIds(userId) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return items.map((i) => i.productId);
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggle,
  getWishlistProductIds,
};
