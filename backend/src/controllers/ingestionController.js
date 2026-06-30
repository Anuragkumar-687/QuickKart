'use strict';

const asyncHandler = require('../lib/asyncHandler');
const ingestionService = require('../services/ingestionService');

const sync = asyncHandler(async (req, res) => {
  const summary = await ingestionService.syncAll();
  res.json({ message: 'Product sync complete', ...summary });
});

const status = asyncHandler(async (req, res) => {
  const status = await ingestionService.getStatus();
  res.json(status);
});

module.exports = { sync, status };
