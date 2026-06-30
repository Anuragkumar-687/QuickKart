'use strict';

const ApiError = require('../lib/ApiError');

/** Requires an authenticated user (must run after authenticateToken). */
function requireAuth(req, res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  next();
}

/** Requires the authenticated user to have one of the given roles. */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Admin access required'));
    }
    next();
  };
}

const requireAdmin = requireRole('admin');

module.exports = { requireAuth, requireRole, requireAdmin };
