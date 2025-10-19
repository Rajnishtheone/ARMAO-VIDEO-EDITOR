const { ApiError } = require('../utils/errors');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const status = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'Unexpected error';

  logger.error('http', message, {
    status,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
    details: err.details || undefined,
  });

  res.status(status).json({
    error: {
      message,
      details: err.details,
    },
  });
};

module.exports = errorHandler;
