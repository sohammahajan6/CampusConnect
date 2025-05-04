const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken, isAdmin, isOrganizer } = require('../middleware/auth');

// Get all events (public endpoint)
router.get('/', eventController.getAllEvents);

// Get event by ID (public endpoint)
router.get('/:id', eventController.getEventById);

// Create a new event
router.post('/', authenticateToken, isOrganizer, eventController.createEvent);

// Update an event
router.put('/:id', authenticateToken, eventController.updateEvent);

// Delete an event
router.delete('/:id', authenticateToken, eventController.deleteEvent);

// Approve or reject an event
router.patch('/:id/status', authenticateToken, isAdmin, eventController.updateEventStatus);

// Register for an event
router.post('/:id/register', authenticateToken, eventController.registerForEvent);

// Cancel registration for an event
router.delete('/:id/register', authenticateToken, eventController.cancelRegistration);

// Get user's registered events
router.get('/user/registered', authenticateToken, eventController.getUserEvents);

// Get events created by user
router.get('/user/created', authenticateToken, eventController.getCreatedEvents);

module.exports = router;
