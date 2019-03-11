const express = require('express');
const authRoutes = require('./auth.route');
const tagRoutes = require('./tag.route');
const trendRoutes = require('./trend.route');
const connRoutes = require('./connection.route')
const connectorRoutes = require ('./connector.route')

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK1'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));
router.use('/auth', authRoutes);
router.use('/tag', tagRoutes);
router.use('/trend', trendRoutes);
router.use('/conn', connRoutes);
router.use('/connector', connectorRoutes);


module.exports = router;



