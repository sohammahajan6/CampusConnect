const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken, isAdmin, isOrganizer } = require('../middleware/auth');

// Submit feedback for an event
router.post('/events/:eventId', authenticateToken, feedbackController.submitFeedback);

// Get feedback for an event (organizer view - anonymous)
router.get('/events/:eventId', authenticateToken, feedbackController.getEventFeedback);

// Get all feedback for organizer's events
router.get('/organizer', authenticateToken, feedbackController.getOrganizerFeedback);

// Check if user has submitted feedback for an event
router.get('/check/:eventId', authenticateToken, feedbackController.checkUserFeedback);

// Send feedback notifications for completed events (admin only)
router.post('/notifications', authenticateToken, isAdmin, feedbackController.sendFeedbackNotifications);

module.exports = router;
