'use strict';

const asyncHandler = require('../lib/asyncHandler');
const productService = require('../services/productService');
const analyticsService = require('../services/analyticsService');

const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.validatedQuery);
  res.json(result);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  // Fire-and-forget view tracking — never blocks or fails the response.
  analyticsService.recordView({ productId: product.id, userId: req.user ? req.user.id : null });
  res.json(product);
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getCategories();
  res.json(categories);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.json({ message: 'Product deleted' });
});

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};
