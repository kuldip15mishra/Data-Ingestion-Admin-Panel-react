const express = require('express');
const controller = require('../../controllers/auth.controller');
const router = express.Router();



/*
Login route
*/
router.route('/user')
  .post(controller.userdetails); 

module.exports = router;
