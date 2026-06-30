'use strict';

const { z } = require('zod');

const SORTS = ['price_asc', 'price_desc', 'rating_desc', 'newest', 'name_asc', 'name_desc'];

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  source: z.string().trim().min(1).optional(),
  sort: z.enum(SORTS).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1),
  price: z.coerce.number().nonnegative(),
  category: z.string().trim().min(1),
  image: z.string().trim().min(1),
  stock: z.coerce.number().int().min(0).default(0),
  brand: z.string().trim().max(120).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
});

const updateProductSchema = createProductSchema.partial();

module.exports = { listQuerySchema, createProductSchema, updateProductSchema, SORTS };
