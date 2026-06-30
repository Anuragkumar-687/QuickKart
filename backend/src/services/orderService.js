'use strict';

const { prisma } = require('../lib/prisma');
const ApiError = require('../lib/ApiError');
const cache = require('../lib/cache');
const analyticsService = require('./analyticsService');

const round = (n) => Math.round(n * 100) / 100;

async function getOrders(userId) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Creates an order from the user's active cart items inside a transaction:
 * validates stock, persists the order, decrements stock, and clears the active
 * cart (saved-for-later items are kept). Purchase analytics events are emitted
 * afterwards (best-effort), tagged with the buyer's region/state.
 */
async function createOrder(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { where: { savedForLater: false }, include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Cart is empty');
  }

  // Up-front stock validation
  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      throw ApiError.badRequest(
        `Insufficient stock for ${item.product.name} (only ${item.product.stock} left)`
      );
    }
  }

  const totalAmount = round(
    cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  );
  const { region, state } = await analyticsService.resolveRegionState(userId);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        totalAmount,
        region,
        items: {
          create: cart.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.product.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    for (const i of cart.items) {
      await tx.product.update({
        where: { id: i.productId },
        data: { stock: { decrement: i.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id, savedForLater: false } });
    return created;
  });

  // Analytics (best-effort, outside the transaction)
  for (const i of cart.items) {
    analyticsService.recordPurchase({
      productId: i.productId,
      userId,
      region,
      state,
      category: i.product.category,
      quantity: i.quantity,
      price: round(i.product.price * i.quantity),
    });
  }

  await cache.del('products:*'); // stock changed
  return order;
}

module.exports = { getOrders, createOrder };
