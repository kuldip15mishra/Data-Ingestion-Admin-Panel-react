const express = require('express');;
const controller = require('../../controllers/connector.controller');
const router = express.Router()

router.route('/getlist')
  .get(controller.connectorList)

  router.route('/connectorops')
  .post(controller.connectorOperation)

  module.exports = router;