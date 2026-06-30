'use strict';

const redis = require('./redis');
const logger = require('./logger');

const PREFIX = 'qk:';

// TTL presets (seconds) used across services.
const TTL = {
  short: 60,
  medium: 300,
  long: 1800,
  hour: 3600,
};

async function get(key) {
  if (!redis.isEnabled()) return null;
  try {
    const raw = await redis.client.get(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    logger.warn('[cache] get failed:', err.message);
    return null;
  }
}

async function set(key, value, ttlSeconds = TTL.medium) {
  if (!redis.isEnabled()) return;
  try {
    await redis.client.set(PREFIX + key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    logger.warn('[cache] set failed:', err.message);
  }
}

async function del(keyOrPattern) {
  if (!redis.isEnabled()) return;
  try {
    if (keyOrPattern.includes('*')) {
      const keys = await redis.client.keys(PREFIX + keyOrPattern);
      if (keys.length) await redis.client.del(keys);
    } else {
      await redis.client.del(PREFIX + keyOrPattern);
    }
  } catch (err) {
    logger.warn('[cache] del failed:', err.message);
  }
}

/**
 * Returns cached value if present, otherwise computes via `fn`, caches it, and
 * returns it. Falls back to a direct `fn()` call when Redis is unavailable.
 */
async function getOrSet(key, ttlSeconds, fn) {
  const cached = await get(key);
  if (cached !== null && cached !== undefined) return cached;
  const value = await fn();
  if (value !== null && value !== undefined) await set(key, value, ttlSeconds);
  return value;
}

module.exports = { get, set, del, getOrSet, TTL, PREFIX };
