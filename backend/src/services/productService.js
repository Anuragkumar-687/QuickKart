'use strict';

const { prisma } = require('../lib/prisma');
const cache = require('../lib/cache');
const ApiError = require('../lib/ApiError');

function buildWhere({ search, category, source, minPrice, maxPrice }) {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category) where.category = { equals: category, mode: 'insensitive' };
  if (source) where.source = source;

  if (minPrice != null || maxPrice != null) {
    where.price = {};
    if (minPrice != null) where.price.gte = minPrice;
    if (maxPrice != null) where.price.lte = maxPrice;
  }

  return where;
}

function buildOrderBy(sort) {
  switch (sort) {
    case 'price_asc':
      return { price: 'asc' };
    case 'price_desc':
      return { price: 'desc' };
    case 'rating_desc':
      return { rating: 'desc' };
    case 'name_asc':
      return { name: 'asc' };
    case 'name_desc':
      return { name: 'desc' };
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
}

async function listProducts(params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const { search, category, source, sort, minPrice, maxPrice } = params;

  const where = buildWhere({ search, category, source, minPrice, maxPrice });
  const orderBy = buildOrderBy(sort);
  const skip = (page - 1) * limit;

  const compute = async () => {
    const [data, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take: limit }),
      prisma.product.count({ where }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { data, page, limit, total, totalPages, hasNext: page < totalPages };
  };

  // Cache browse queries (no free-text search) on a short TTL — busted on writes.
  if (!search) {
    const key = `products:list:${page}:${limit}:${category || ''}:${source || ''}:${
      sort || 'newest'
    }:${minPrice ?? ''}:${maxPrice ?? ''}`;
    return cache.getOrSet(key, cache.TTL.short, compute);
  }
  return compute();
}

async function getProductById(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

async function getCategories() {
  return cache.getOrSet('products:categories', cache.TTL.long, async () => {
    const rows = await prisma.product.findMany({
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    });
    return rows.map((r) => r.category);
  });
}

async function createProduct(data) {
  const product = await prisma.product.create({ data: { ...data, source: 'manual' } });
  await invalidateProductCaches();
  return product;
}

async function updateProduct(id, data) {
  await getProductById(id); // throws 404 when missing
  const product = await prisma.product.update({ where: { id }, data });
  await invalidateProductCaches();
  return product;
}

async function deleteProduct(id) {
  await getProductById(id);
  await prisma.product.delete({ where: { id } });
  await invalidateProductCaches();
  return { success: true };
}

async function invalidateProductCaches() {
  await cache.del('products:*');
}

module.exports = {
  listProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  invalidateProductCaches,
  buildWhere,
  buildOrderBy,
};
