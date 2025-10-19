const express = require('express');
const mediaRoutes = require('./media.routes');

const router = express.Router();

router.use('/media', mediaRoutes);

module.exports = router;
