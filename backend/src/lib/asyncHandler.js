'use strict';

/**
 * Wraps an async route handler so any thrown error / rejected promise is
 * forwarded to Express's error middleware (no try/catch in every controller).
 */
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
