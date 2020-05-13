const express = require('express');
const router = express.Router();
const { baseRouteHandler } = require('../controllers');

router.route('/').get(baseRouteHandler);

module.exports = router;
