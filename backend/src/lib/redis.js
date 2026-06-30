'use strict';

const env = require('../config/env');
const logger = require('./logger');

/**
 * Redis is OPTIONAL. When REDIS_URL is unset (or the connection fails) the app
 * keeps working — the cache layer simply becomes a pass-through. This keeps the
 * project runnable locally without any extra infrastructure.
 */
let client = null;

if (env.REDIS_URL) {
  try {
    const Redis = require('ioredis');
    client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
    });
    client.on('connect', () => logger.info('[redis] connected'));
    client.on('error', (err) => logger.warn('[redis] error:', err.message));
  } catch (err) {
    logger.warn('[redis] init failed, continuing without cache:', err.message);
    client = null;
  }
} else {
  logger.info('[redis] REDIS_URL not set — caching disabled (graceful fallback)');
}

function isEnabled() {
  return Boolean(client) && client.status === 'ready';
}

async function disconnect() {
  if (client) {
    try {
      await client.quit();
    } catch (_) {
      /* ignore */
    }
  }
}

module.exports = { client, isEnabled, disconnect };
