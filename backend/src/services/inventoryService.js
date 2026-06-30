'use strict';

const { prisma } = require('../lib/prisma');

const PRODUCT_FIELDS = {
  id: true,
  name: true,
  stock: true,
  category: true,
  price: true,
  image: true,
  source: true,
};

/**
 * Inventory Intelligence (Phase 3).
 * Produces low-stock alerts, high-demand alerts and reorder suggestions by
 * comparing current stock against recent purchase demand.
 */
async function getAlerts({ lowStockThreshold = 10, days = 30, limit = 50 } = {}) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [lowStock, demand] = await Promise.all([
    prisma.product.findMany({
      where: { stock: { lte: lowStockThreshold } },
      orderBy: { stock: 'asc' },
      take: limit,
      select: PRODUCT_FIELDS,
    }),
    prisma.purchaseEvent.groupBy({
      by: ['productId'],
      where: { createdAt: { gte: since } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 100,
    }),
  ]);

  const demandMap = new Map(demand.map((d) => [d.productId, d._sum.quantity || 0]));
  const demandProducts = demand.length
    ? await prisma.product.findMany({
        where: { id: { in: [...demandMap.keys()] } },
        select: PRODUCT_FIELDS,
      })
    : [];

  const highDemand = demandProducts
    .map((p) => ({ ...p, recentDemand: demandMap.get(p.id) || 0 }))
    .filter((p) => p.recentDemand > 0)
    .sort((a, b) => b.recentDemand - a.recentDemand)
    .slice(0, limit);

  // Reorder when recent demand outpaces remaining stock.
  const reorderSuggestions = highDemand
    .filter((p) => p.stock < p.recentDemand)
    .map((p) => ({
      productId: p.id,
      name: p.name,
      category: p.category,
      stock: p.stock,
      recentDemand: p.recentDemand,
      suggestedReorderQty: Math.max(1, p.recentDemand * 2 - p.stock),
    }))
    .sort((a, b) => b.suggestedReorderQty - a.suggestedReorderQty);

  return {
    lowStockThreshold,
    counts: {
      lowStock: lowStock.length,
      highDemand: highDemand.length,
      reorderSuggestions: reorderSuggestions.length,
    },
    lowStock,
    highDemand,
    reorderSuggestions,
  };
}

module.exports = { getAlerts };
