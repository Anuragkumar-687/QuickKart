'use strict';

const asyncHandler = require('../lib/asyncHandler');
const reviewService = require('../services/reviewService');

const listForProduct = asyncHandler(async (req, res) => {
  res.json(await reviewService.listForProduct(req.params.id));
});

const upsertForProduct = asyncHandler(async (req, res) => {
  const review = await reviewService.upsertReview(req.user.id, req.params.id, req.body);
  res.status(201).json(review);
});

const remove = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.user.id, req.params.id, req.user.role === 'admin');
  res.json({ message: 'Review deleted' });
});

module.exports = { listForProduct, upsertForProduct, remove };
