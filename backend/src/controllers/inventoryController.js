'use strict';

const asyncHandler = require('../lib/asyncHandler');
const inventoryService = require('../services/inventoryService');
const forecastService = require('../services/forecastService');

const alerts = asyncHandler(async (req, res) => {
  res.json(await inventoryService.getAlerts());
});

const forecast = asyncHandler(async (req, res) => {
  res.json(await forecastService.getDemandByCategoryRegion());
});

module.exports = { alerts, forecast };
