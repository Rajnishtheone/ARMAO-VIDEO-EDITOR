const { ApiError } = require('../utils/errors');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
};

module.exports = notFound;
