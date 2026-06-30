'use strict';

const asyncHandler = require('../lib/asyncHandler');
const cartService = require('../services/cartService');

const getCart = asyncHandler(async (req, res) => {
  res.json(await cartService.getCart(req.user.id));
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  res.json(await cartService.addToCart(req.user.id, productId, quantity));
});

const updateQuantity = asyncHandler(async (req, res) => {
  res.json(await cartService.updateQuantity(req.user.id, req.params.id, req.body.quantity));
});

const removeItem = asyncHandler(async (req, res) => {
  res.json(await cartService.removeItem(req.user.id, req.params.id));
});

const saveForLater = asyncHandler(async (req, res) => {
  res.json(await cartService.setSavedForLater(req.user.id, req.params.id, true));
});

const moveToCart = asyncHandler(async (req, res) => {
  res.json(await cartService.setSavedForLater(req.user.id, req.params.id, false));
});

module.exports = { getCart, addToCart, updateQuantity, removeItem, saveForLater, moveToCart };
