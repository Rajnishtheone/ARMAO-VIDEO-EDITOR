const http = require('http');

const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const { initLibrary } = require('./storage/library');

const start = async () => {
  try {
    await initLibrary();
    const server = http.createServer(app);

    server.listen(config.port, () => {
      logger.info('server', `Server listening on port ${config.port}`);
    });
  } catch (error) {
    logger.error('server', 'Failed to start server', error);
    process.exit(1);
  }
};

start();
