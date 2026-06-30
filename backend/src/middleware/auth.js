'use strict';

const ApiError = require('../lib/ApiError');
const { verifyToken } = require('../lib/token');

function extractToken(req) {
  const header = req.headers['authorization'] || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

/**
 * Requires a valid JWT. On success sets req.user = { id, role, ... }.
 */
function authenticateToken(req, res, next) {
  const token = extractToken(req);
  if (!token) return next(ApiError.unauthorized('Access token required'));
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

/**
 * Sets req.user when a valid token is present, but never rejects the request.
 * Useful for endpoints that personalize for logged-in users but also work
 * anonymously (tracking, recommendations, product views).
 */
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch (_) {
      /* anonymous */
    }
  }
  next();
}

module.exports = { authenticateToken, optionalAuth };
