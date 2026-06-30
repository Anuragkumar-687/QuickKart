'use strict';

const asyncHandler = require('../lib/asyncHandler');
const trendingService = require('../services/trendingService');
const recommendationService = require('../services/recommendationService');
const analyticsService = require('../services/analyticsService');

const queryRegion = (req) => (req.validatedQuery && req.validatedQuery.region) || null;
const queryLimit = (req) => (req.validatedQuery && req.validatedQuery.limit) || 10;

// GET /recommendations/trending — Trending Near You
const trending = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  let region = queryRegion(req);
  if (!region && userId) region = await analyticsService.resolveRegion({ userId });
  res.json(await trendingService.getTrending({ region, limit: queryLimit(req) }));
});

// GET /recommendations/region — Popular In Your Region
const region = asyncHandler(async (req, res) => {
  res.json(
    await recommendationService.getRegionPopular({
      userId: req.user ? req.user.id : null,
      region: queryRegion(req),
      limit: queryLimit(req),
    })
  );
});

// GET /recommendations/personalized — Recommended For You (auth)
const personalized = asyncHandler(async (req, res) => {
  res.json(
    await recommendationService.getPersonalized({
      userId: req.user.id,
      region: queryRegion(req),
      limit: queryLimit(req),
    })
  );
});

// GET /recommendations/recently-viewed (auth)
const recentlyViewed = asyncHandler(async (req, res) => {
  res.json(await recommendationService.getRecentlyViewed({ userId: req.user.id, limit: queryLimit(req) }));
});

// GET /recommendations/bundles/:productId — Frequently Bought Together
const bundles = asyncHandler(async (req, res) => {
  res.json(await recommendationService.getBundles(req.params.productId, queryLimit(req)));
});

module.exports = { trending, region, personalized, recentlyViewed, bundles };
