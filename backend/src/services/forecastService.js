'use strict';

const { prisma } = require('../lib/prisma');
const cache = require('../lib/cache');

/**
 * Demand Forecasting (Phase 3 — rule-based heuristic, no ML).
 *
 * Computes a predicted demand score per (region, category) from recent purchase
 * velocity and buckets it into High / Medium / Low using tertiles. This is a
 * deliberately simple, explainable baseline; the upgrade path is a time-series
 * model (e.g. seasonal moving average) fed by the same PurchaseEvent stream.
 */
async function getDemandByCategoryRegion({ days = 30 } = {}) {
  return cache.getOrSet(`forecast:demand:${days}`, cache.TTL.long, async () => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await prisma.purchaseEvent.groupBy({
      by: ['region', 'category'],
      where: { createdAt: { gte: since }, region: { not: null }, category: { not: null } },
      _sum: { quantity: true },
    });

    const values = rows.map((r) => r._sum.quantity || 0).sort((a, b) => a - b);
    const quantile = (p) => (values.length ? values[Math.floor((values.length - 1) * p)] : 0);
    const hi = quantile(0.66);
    const lo = quantile(0.33);

    return rows
      .map((r) => {
        const score = r._sum.quantity || 0;
        let demand = 'Low';
        if (score > 0 && score >= hi) demand = 'High';
        else if (score > 0 && score >= lo) demand = 'Medium';
        return { region: r.region, category: r.category, demandScore: score, demand };
      })
      .sort((a, b) => b.demandScore - a.demandScore);
  });
}

module.exports = { getDemandByCategoryRegion };
