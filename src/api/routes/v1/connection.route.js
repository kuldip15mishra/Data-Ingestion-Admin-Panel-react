const express = require('express');;
const controller = require('../../controllers/connection.controller');
const router = express.Router()

router.route('/connectionstring')
  .post(controller.connString);

  module.exports = router;