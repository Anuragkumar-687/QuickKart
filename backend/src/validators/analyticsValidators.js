'use strict';

const { z } = require('zod');
const { objectId } = require('./commonValidators');

const trackSchema = z.object({
  type: z.enum(['view', 'click', 'cart_add']),
  productId: objectId,
});

module.exports = { trackSchema };
