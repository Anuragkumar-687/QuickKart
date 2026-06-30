'use strict';

const asyncHandler = require('../lib/asyncHandler');
const analyticsService = require('../services/analyticsService');
const trendingService = require('../services/trendingService');

const track = asyncHandler(async (req, res) => {
  await analyticsService.track({
    type: req.body.type,
    productId: req.body.productId,
    userId: req.user ? req.user.id : null,
  });
  res.status(202).json({ ok: true });
});

const recompute = asyncHandler(async (req, res) => {
  const regions = await trendingService.recomputeAll();
  res.json({ message: 'Trending rankings recomputed', regions });
});

const regions = asyncHandler(async (req, res) => {
  const limit = (req.validatedQuery && req.validatedQuery.limit) || 5;
  res.json(await analyticsService.getRegionDashboard({ limit }));
});

module.exports = { track, recompute, regions };
