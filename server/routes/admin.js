const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get system statistics (admin only)
router.get('/stats', authenticateToken, isAdmin, adminController.getSystemStats);

// Test database connection (public endpoint for testing)
router.get('/test-db', adminController.testDbConnection);

module.exports = router;
