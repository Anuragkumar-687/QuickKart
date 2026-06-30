'use strict';

const rateLimit = require('express-rate-limit');

const json = (message) => ({ message });

// Generous global limiter to protect the API from abuse.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Too many requests, please try again later.'),
});

// Stricter limiter for auth endpoints (brute-force protection).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Too many authentication attempts, please try again later.'),
});

// Limiter for expensive write/recompute endpoints (ingestion, analytics recompute).
const heavyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('This operation is rate limited, please wait a moment.'),
});

module.exports = { globalLimiter, authLimiter, heavyLimiter };
