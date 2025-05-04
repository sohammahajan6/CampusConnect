const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Get home page statistics (public endpoint)
router.get('/home', statsController.getHomeStats);

module.exports = router;
