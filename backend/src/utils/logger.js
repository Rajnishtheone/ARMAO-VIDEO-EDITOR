const config = require('../config/env');

const buildNamespace = scope => `[${config.env.toUpperCase()}][${scope}]`;

const logger = {
  info(scope, message, payload) {
    console.log(buildNamespace(scope), message, payload || '');
  },
  warn(scope, message, payload) {
    console.warn(buildNamespace(scope), message, payload || '');
  },
  error(scope, message, payload) {
    console.error(buildNamespace(scope), message, payload || '');
  },
  debug(scope, message, payload) {
    if (!config.isProduction) {
      console.debug(buildNamespace(scope), message, payload || '');
    }
  },
};

module.exports = logger;
