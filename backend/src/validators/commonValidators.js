'use strict';

const { z } = require('zod');

// MongoDB ObjectId (24 hex chars)
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const idParam = z.object({ id: objectId });
const productIdParam = z.object({ productId: objectId });

module.exports = { objectId, idParam, productIdParam };
