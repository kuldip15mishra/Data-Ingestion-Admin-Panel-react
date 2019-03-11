const express = require('express');
const controller = require('../../controllers/trend.controller');
const router = express.Router();


router.route('/trendmeta')
  .post(controller.trendData);

module.exports = router;