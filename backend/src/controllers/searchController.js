'use strict';

const asyncHandler = require('../lib/asyncHandler');
const searchService = require('../services/searchService');

const search = asyncHandler(async (req, res) => {
  const result = await searchService.search(req.validatedQuery);
  res.json(result);
});

const suggestions = asyncHandler(async (req, res) => {
  const result = await searchService.suggestions(req.validatedQuery);
  res.json(result);
});

module.exports = { search, suggestions };
