'use strict';

const asyncHandler = require('../lib/asyncHandler');
const wishlistService = require('../services/wishlistService');

const getWishlist = asyncHandler(async (req, res) => {
  res.json(await wishlistService.getWishlist(req.user.id));
});

const toggle = asyncHandler(async (req, res) => {
  res.json(await wishlistService.toggle(req.user.id, req.params.productId));
});

const remove = asyncHandler(async (req, res) => {
  const items = await wishlistService.removeFromWishlist(req.user.id, req.params.productId);
  res.json({ wishlisted: false, items });
});

module.exports = { getWishlist, toggle, remove };
