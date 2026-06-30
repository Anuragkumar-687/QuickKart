'use strict';

const { ZodError } = require('zod');
const ApiError = require('../lib/ApiError');

/**
 * Validates/coerces request parts with Zod schemas.
 *   validate({ body, query, params })
 *
 * Parsed body/params replace req.body/req.params. Parsed query is exposed as
 * req.validatedQuery because Express 5 makes req.query a read-only getter.
 */
function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body ?? {});
      if (schemas.query) req.validatedQuery = schemas.query.parse(req.query ?? {});
      if (schemas.params) req.validatedParams = schemas.params.parse(req.params ?? {});
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          path: e.path.join('.') || '(root)',
          message: e.message,
        }));
        return next(ApiError.badRequest('Validation failed', details));
      }
      next(err);
    }
  };
}

module.exports = { validate };
