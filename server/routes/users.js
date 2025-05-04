const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const db = require('../utils/db');

// Get all users (admin only)
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);

// Get user profile
router.get('/profile', authenticateToken, userController.getUserProfile);

// Update user profile
router.put('/profile', authenticateToken, upload.single('profilePhoto'), userController.updateUserProfile);

// Get user notifications
router.get('/me/notifications', authenticateToken, userController.getUserNotifications);

// Mark notification as read
router.patch('/me/notifications/:id', authenticateToken, userController.markNotificationAsRead);

// Create notification (admin only) - for testing purposes
router.post('/notifications', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId, eventId, message } = req.body;

    if (!userId || !eventId || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await db.query(`
      INSERT INTO notifications (user_id, event_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, eventId, message]);

    res.status(201).json({
      message: 'Notification created successfully',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all departments
router.get('/departments/all', authenticateToken, userController.getAllDepartments);

// Get user by ID
router.get('/:id', authenticateToken, userController.getUserById);

// Update user role (admin only)
router.patch('/:id/role', authenticateToken, isAdmin, userController.updateUserRole);

module.exports = router;
