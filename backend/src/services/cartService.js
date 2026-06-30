'use strict';

const { prisma } = require('../lib/prisma');
const ApiError = require('../lib/ApiError');
const analyticsService = require('./analyticsService');

const round = (n) => Math.round(n * 100) / 100;

function summarize(items) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
  return { itemCount: items.length, totalQuantity, subtotal: round(subtotal) };
}

async function getOrCreateCart(userId) {
  const existing = await prisma.cart.findUnique({ where: { userId } });
  return existing || prisma.cart.create({ data: { userId } });
}

/**
 * Returns the cart split into active items and saved-for-later items, plus a
 * pricing summary. Shape stays backwards-compatible with the old client
 * (`{ items: [...] }`).
 */
async function getCart(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true }, orderBy: { createdAt: 'asc' } } },
  });

  if (!cart) {
    return { id: null, items: [], savedItems: [], summary: summarize([]) };
  }

  const items = cart.items.filter((i) => !i.savedForLater);
  const savedItems = cart.items.filter((i) => i.savedForLater);
  return { id: cart.id, items, savedItems, summary: summarize(items) };
}

async function getOwnedItem(userId, itemId) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: { select: { userId: true } } },
  });
  if (!item || item.cart.userId !== userId) {
    throw ApiError.notFound('Cart item not found');
  }
  return item;
}

async function addToCart(userId, productId, quantity = 1) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true, name: true },
  });
  if (!product) throw ApiError.notFound('Product not found');
  if (product.stock <= 0) throw ApiError.badRequest(`${product.name} is out of stock`);

  const cart = await getOrCreateCart(userId);
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, savedForLater: false },
  });

  const desiredQty = (existing ? existing.quantity : 0) + quantity;
  if (desiredQty > product.stock) {
    throw ApiError.badRequest(`Only ${product.stock} unit(s) of ${product.name} in stock`);
  }

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: desiredQty } });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
  }

  analyticsService.recordCartAdd({ productId, userId, quantity });
  return getCart(userId);
}

async function updateQuantity(userId, itemId, quantity) {
  const item = await getOwnedItem(userId, itemId);

  // quantity 0 → remove
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
    return getCart(userId);
  }

  const product = await prisma.product.findUnique({
    where: { id: item.productId },
    select: { stock: true, name: true },
  });
  if (product && quantity > product.stock) {
    throw ApiError.badRequest(`Only ${product.stock} unit(s) of ${product.name} in stock`);
  }

  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  return getCart(userId);
}

async function removeItem(userId, itemId) {
  const item = await getOwnedItem(userId, itemId);
  await prisma.cartItem.delete({ where: { id: item.id } });
  return getCart(userId);
}

/**
 * Toggle an item's save-for-later state. When moving back to the cart we
 * re-validate stock and clamp the quantity if necessary.
 */
async function setSavedForLater(userId, itemId, saved) {
  const item = await getOwnedItem(userId, itemId);

  if (saved === false) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { stock: true, name: true },
    });
    if (!product || product.stock <= 0) {
      throw ApiError.badRequest('This product is out of stock');
    }
    const quantity = Math.min(item.quantity, product.stock);
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { savedForLater: false, quantity },
    });
    return getCart(userId);
  }

  await prisma.cartItem.update({ where: { id: item.id }, data: { savedForLater: true } });
  return getCart(userId);
}

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  setSavedForLater,
  getOrCreateCart,
};
