'use strict';

const { z } = require('zod');
const { REGIONS } = require('../lib/regions');

const recQuerySchema = z.object({
  region: z.enum(REGIONS).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const dashboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

module.exports = { recQuerySchema, dashboardQuerySchema };
