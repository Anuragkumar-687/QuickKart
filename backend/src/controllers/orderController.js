'use strict';

const asyncHandler = require('../lib/asyncHandler');
const orderService = require('../services/orderService');

const getOrders = asyncHandler(async (req, res) => {
  res.json(await orderService.getOrders(req.user.id));
});

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user.id);
  res.status(201).json(order);
});

module.exports = { getOrders, createOrder };
