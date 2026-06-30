'use strict';

const { z } = require('zod');
const { objectId } = require('./commonValidators');

const addToCartSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

// quantity 0 means "remove the item"
const updateQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99),
});

module.exports = { addToCartSchema, updateQuantitySchema };
