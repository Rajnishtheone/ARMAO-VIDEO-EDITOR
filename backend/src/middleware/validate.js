const { ZodError } = require('zod');
const { ApiError } = require('../utils/errors');

const buildValidator = (source, schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req[source]);
    req.validated = req.validated || {};
    req.validated[source] = parsed;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      next(new ApiError(400, 'Validation failed', error.flatten()));
      return;
    }
    next(error);
  }
};

const validateBody = schema => buildValidator('body', schema);
const validateQuery = schema => buildValidator('query', schema);
const validateParams = schema => buildValidator('params', schema);

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};
