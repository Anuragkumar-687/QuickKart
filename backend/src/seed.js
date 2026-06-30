'use strict';

const bcrypt = require('bcryptjs');
const { prisma } = require('./lib/prisma');
const logger = require('./lib/logger');
const ingestionService = require('./services/ingestionService');
const trendingService = require('./services/trendingService');
const { REGIONS } = require('./lib/regions');

// Small offline catalog used only if external APIs are unreachable.
const STATIC_FALLBACK = [
  { externalId: 'seed-1', source: 'seed', name: 'Wireless Headphones', description: 'Over-ear noise-cancelling headphones.', price: 129.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', rating: 4.5, ratingCount: 120, stock: 40, brand: 'SoundCore' },
  { externalId: 'seed-2', source: 'seed', name: 'Smartphone Pro', description: 'Flagship smartphone with triple camera.', price: 899.0, category: 'Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', rating: 4.7, ratingCount: 300, stock: 25, brand: 'Nova' },
  { externalId: 'seed-3', source: 'seed', name: 'Running Shoes', description: 'Lightweight everyday running shoes.', price: 79.99, category: 'Sports', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', rating: 4.3, ratingCount: 90, stock: 60, brand: 'Stride' },
  { externalId: 'seed-4', source: 'seed', name: 'Leather Watch', description: 'Classic analog watch with leather strap.', price: 149.5, category: 'Fashion', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80', rating: 4.6, ratingCount: 75, stock: 8, brand: 'Timeless' },
  { externalId: 'seed-5', source: 'seed', name: 'Laptop Ultra', description: '14-inch ultrabook for work and play.', price: 1199.0, category: 'Laptops', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', rating: 4.8, ratingCount: 210, stock: 15, brand: 'Volt' },
  { externalId: 'seed-6', source: 'seed', name: 'Desk Lamp', description: 'Adjustable LED desk lamp.', price: 34.99, category: 'Home Decoration', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', rating: 4.1, ratingCount: 45, stock: 5, brand: 'Lumos' },
  { externalId: 'seed-7', source: 'seed', name: 'Backpack', description: 'Water-resistant 25L backpack.', price: 59.99, category: 'Fashion', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', rating: 4.4, ratingCount: 130, stock: 50, brand: 'Trail' },
  { externalId: 'seed-8', source: 'seed', name: 'Coffee Maker', description: 'Programmable drip coffee maker.', price: 89.99, category: 'Kitchen Accessories', image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80', rating: 4.2, ratingCount: 60, stock: 30, brand: 'Brewly' },
];

async function clearAll() {
  await prisma.regionAnalytics.deleteMany({});
  await prisma.purchaseEvent.deleteMany({});
  await prisma.cartEvent.deleteMany({});
  await prisma.productView.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
}

async function seedUsers() {
  const password = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@quickkart.com',
      password,
      role: 'admin',
      state: 'Delhi',
      city: 'New Delhi',
      region: 'North',
    },
  });
  await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'user@quickkart.com',
      password,
      role: 'user',
      state: 'Maharashtra',
      city: 'Mumbai',
      region: 'West',
    },
  });
}

async function seedCatalog() {
  try {
    const summary = await ingestionService.syncAll();
    if (summary.totalProducts > 0) return summary.totalProducts;
    throw new Error('no products ingested');
  } catch (err) {
    logger.warn('[seed] ingestion unavailable, using static fallback:', err.message);
    await prisma.product.createMany({ data: STATIC_FALLBACK });
    return STATIC_FALLBACK.length;
  }
}

// Generate synthetic events so trending/recommendations have data on a fresh DB.
async function seedDemoSignals() {
  const products = await prisma.product.findMany({
    take: 80,
    select: { id: true, category: true, price: true },
  });
  if (!products.length) return;

  const pick = () => products[Math.floor(Math.random() * products.length)];
  const region = () => REGIONS[Math.floor(Math.random() * REGIONS.length)];

  const views = [];
  const carts = [];
  const purchases = [];
  for (let i = 0; i < 600; i++) {
    const p = pick();
    views.push({ productId: p.id, region: region(), type: Math.random() < 0.2 ? 'click' : 'view' });
  }
  for (let i = 0; i < 220; i++) {
    const p = pick();
    carts.push({ productId: p.id, region: region(), quantity: 1 });
  }
  for (let i = 0; i < 120; i++) {
    const p = pick();
    const r = region();
    purchases.push({
      productId: p.id,
      region: r,
      category: p.category,
      quantity: 1 + Math.floor(Math.random() * 3),
      price: p.price,
    });
  }

  await prisma.productView.createMany({ data: views });
  await prisma.cartEvent.createMany({ data: carts });
  await prisma.purchaseEvent.createMany({ data: purchases });
}

async function main() {
  logger.info('[seed] clearing existing data…');
  await clearAll();

  logger.info('[seed] creating users (admin@quickkart.com / user@quickkart.com — password123)…');
  await seedUsers();

  logger.info('[seed] populating catalog from DummyJSON + FakeStore…');
  const count = await seedCatalog();
  logger.info(`[seed] catalog ready: ${count} products`);

  logger.info('[seed] generating demo analytics signals…');
  await seedDemoSignals();

  logger.info('[seed] recomputing regional trending rankings…');
  await trendingService.recomputeAll();

  logger.info('[seed] done!');
  await prisma.$disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  logger.error('[seed] failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
