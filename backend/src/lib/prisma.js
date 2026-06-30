'use strict';

const { PrismaClient } = require('@prisma/client');
const env = require('../config/env');

// Reuse a single PrismaClient across hot-reloads (nodemon) to avoid exhausting
// the connection pool with new clients on every restart.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__quickkartPrisma ||
  new PrismaClient({
    log: env.isDev ? ['warn', 'error'] : ['error'],
  });

if (!env.isProd) {
  globalForPrisma.__quickkartPrisma = prisma;
}

module.exports = { prisma };
