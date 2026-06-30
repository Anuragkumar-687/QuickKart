'use strict';

const { z } = require('zod');

const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const suggestQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required'),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

module.exports = { searchQuerySchema, suggestQuerySchema };
