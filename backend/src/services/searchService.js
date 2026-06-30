'use strict';

const { prisma } = require('../lib/prisma');
const cache = require('../lib/cache');

/**
 * Full-text-ish product search.
 *
 * Uses case-insensitive `contains` matching across the most relevant fields,
 * ranked by rating. This works on any MongoDB deployment with no extra setup.
 *
 * UPGRADE PATH (MongoDB Atlas Search): replace the `where`/`findMany` below with
 * a `$search` aggregation stage (`prisma.$runCommandRaw`) against a configured
 * Atlas Search index to get fuzzy matching, typo tolerance and relevance
 * scoring — without changing this function's public contract.
 */
async function search({ q, page = 1, limit = 20 }) {
  const where = {
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { brand: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
    ],
  };
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ rating: 'desc' }, { ratingCount: 'desc' }],
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { data, query: q, page, limit, total, totalPages, hasNext: page < totalPages };
}

async function suggestions({ q, limit = 8 }) {
  return cache.getOrSet(`search:suggest:${q.toLowerCase()}:${limit}`, cache.TTL.short, async () => {
    const products = await prisma.product.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      select: { id: true, name: true, category: true, image: true, price: true },
      take: limit,
      orderBy: [{ rating: 'desc' }, { ratingCount: 'desc' }],
    });
    return products;
  });
}

module.exports = { search, suggestions };
