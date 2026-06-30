'use strict';

const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const logger = require('./lib/logger');
const { prisma } = require('./lib/prisma');
const redis = require('./lib/redis');
const { globalLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

// ---- CORS ----
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // same-origin / curl / server-to-server
      if (env.isDev || env.CLIENT_ORIGINS.includes(origin)) return cb(null, true);
      logger.warn('[cors] blocked origin:', origin);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// ---- Request logging + latency monitoring ----
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.debug(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.use(globalLimiter);

// ---- Health ----
app.get('/', (req, res) =>
  res.json({ name: 'QuickKart API', status: 'ok', time: new Date().toISOString() })
);
app.get('/api/health', async (req, res) => {
  let db = 'down';
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    db = 'up';
  } catch (_) {
    db = 'down';
  }
  res.json({ status: 'ok', db, redis: redis.isEnabled() ? 'up' : 'disabled' });
});

// ---- Routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/search', require('./routes/search'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/ingestion', require('./routes/ingestion'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/inventory', require('./routes/inventory'));

// ---- 404 + central error handler (must be last) ----
app.use(notFound);
app.use(errorHandler);

// ---- Background jobs ----
if (env.ENABLE_CRON) {
  require('./jobs/scheduler').start();
}

const server = app.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`QuickKart API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

// ---- Graceful shutdown ----
async function shutdown(signal) {
  logger.info(`${signal} received — shutting down…`);
  server.close(async () => {
    await prisma.$disconnect().catch(() => {});
    await redis.disconnect().catch(() => {});
    process.exit(0);
  });
  // Hard exit if cleanup hangs.
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
