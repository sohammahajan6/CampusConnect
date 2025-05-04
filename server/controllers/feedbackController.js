const db = require('../utils/db');

// Submit feedback for an event
const submitFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const {
      rating,
      content_quality,
      organization,
      venue_rating,
      comments,
      suggestions
    } = req.body;

    // Check if event exists
    const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1', [eventId]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user was registered for this event
    const registrationCheck = await db.query(
      'SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );
    if (registrationCheck.rows.length === 0) {
      return res.status(403).json({ message: 'You must be registered for this event to submit feedback' });
    }

    // Check if event has already ended
    const eventDate = new Date(eventCheck.rows[0].date);
    const eventTime = eventCheck.rows[0].time;

    // Combine date and time
    const [hours, minutes] = eventTime.split(':').map(Number);
    eventDate.setHours(hours, minutes);

    const now = new Date();
    if (eventDate > now) {
      return res.status(400).json({ message: 'Cannot submit feedback for an event that has not ended yet' });
    }

    // Check if the event is still within the 2-day feedback window
    const twoDaysAfterEvent = new Date(eventDate);
    twoDaysAfterEvent.setDate(twoDaysAfterEvent.getDate() + 2);

    if (now > twoDaysAfterEvent && !req.user.role === 'admin') {
      return res.status(400).json({ message: 'The feedback window for this event has closed. Feedback can only be submitted within 2 days after an event ends.' });
    }

    // Check if user has already submitted feedback
    const existingFeedback = await db.query(
      'SELECT * FROM feedback WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );

    if (existingFeedback.rows.length > 0) {
      // Update existing feedback
      const updatedFeedback = await db.query(`
        UPDATE feedback
        SET rating = $1, content_quality = $2, organization = $3, venue_rating = $4, comments = $5, suggestions = $6
        WHERE event_id = $7 AND user_id = $8
        RETURNING *
      `, [rating, content_quality, organization, venue_rating, comments, suggestions, eventId, userId]);

      return res.status(200).json({
        message: 'Feedback updated successfully',
        feedback: updatedFeedback.rows[0]
      });
    }

    // Insert new feedback
    const newFeedback = await db.query(`
      INSERT INTO feedback (event_id, user_id, rating, content_quality, organization, venue_rating, comments, suggestions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [eventId, userId, rating, content_quality, organization, venue_rating, comments, suggestions]);

    // Create notification for the event creator that feedback was submitted (without revealing who)
    await db.query(`
      INSERT INTO notifications (user_id, event_id, message)
      VALUES ($1, $2, $3)
    `, [
      eventCheck.rows[0].created_by,
      eventId,
      `New anonymous feedback has been submitted for your event "${eventCheck.rows[0].title}"`
    ]);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: newFeedback.rows[0]
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback for an event (organizer view - anonymous)
const getEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists
    const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1', [eventId]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer or admin
    if (req.user.role !== 'admin' && eventCheck.rows[0].created_by !== userId) {
      return res.status(403).json({ message: 'Access denied. Only the event organizer or admin can view feedback.' });
    }

    // Get all feedback for the event (anonymized)
    const feedback = await db.query(`
      SELECT
        feedback_id,
        event_id,
        rating,
        content_quality,
        organization,
        venue_rating,
        comments,
        suggestions,
        created_at
      FROM feedback
      WHERE event_id = $1
      ORDER BY created_at DESC
    `, [eventId]);

    // Calculate average ratings
    let totalRating = 0;
    let totalContentQuality = 0;
    let totalOrganization = 0;
    let totalVenueRating = 0;
    let count = feedback.rows.length;

    feedback.rows.forEach(item => {
      totalRating += item.rating;
      totalContentQuality += item.content_quality;
      totalOrganization += item.organization;
      totalVenueRating += item.venue_rating;
    });

    const averageRatings = count > 0 ? {
      overall: (totalRating / count).toFixed(1),
      content_quality: (totalContentQuality / count).toFixed(1),
      organization: (totalOrganization / count).toFixed(1),
      venue_rating: (totalVenueRating / count).toFixed(1)
    } : null;

    res.status(200).json({
      feedback: feedback.rows,
      averageRatings,
      totalResponses: count
    });
  } catch (error) {
    console.error('Get event feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all feedback for organizer's events
const getOrganizerFeedback = async (req, res) => {
  try {
    console.log('getOrganizerFeedback called');
    const userId = req.user.id;
    console.log('User ID:', userId);

    // Check if user is an organizer or admin
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only organizers or admins can view this page.' });
    }

    // Get all events created by the organizer that have ended
    const eventsQuery = `
      SELECT
        e.event_id,
        e.title,
        e.date,
        e.time,
        (SELECT COUNT(*) FROM feedback f WHERE f.event_id = e.event_id) as feedback_count
      FROM events e
      WHERE e.created_by = $1
      AND (e.date < CURRENT_DATE OR (e.date = CURRENT_DATE AND e.time < CURRENT_TIME))
      ORDER BY e.date DESC, e.time DESC
    `;

    console.log('Executing query:', eventsQuery);
    console.log('With params:', [userId]);

    const eventsResult = await db.query(eventsQuery, [userId]);
    console.log('Events result:', eventsResult.rows);

    // For each event, get summary statistics
    const eventsWithStats = await Promise.all(eventsResult.rows.map(async (event) => {
      if (event.feedback_count === '0') {
        return {
          ...event,
          feedback_count: 0,
          average_rating: 0,
          has_feedback: false
        };
      }

      // Get average ratings for this event
      const statsQuery = `
        SELECT
          AVG(rating) as avg_rating,
          AVG(content_quality) as avg_content,
          AVG(organization) as avg_organization,
          AVG(venue_rating) as avg_venue,
          COUNT(*) as count
        FROM feedback
        WHERE event_id = $1
      `;

      const statsResult = await db.query(statsQuery, [event.event_id]);
      const stats = statsResult.rows[0];

      return {
        ...event,
        feedback_count: parseInt(event.feedback_count),
        average_rating: parseFloat(stats.avg_rating).toFixed(1),
        average_content: parseFloat(stats.avg_content).toFixed(1),
        average_organization: parseFloat(stats.avg_organization).toFixed(1),
        average_venue: parseFloat(stats.avg_venue).toFixed(1),
        has_feedback: parseInt(event.feedback_count) > 0
      };
    }));

    const response = {
      events: eventsWithStats,
      total_events: eventsWithStats.length,
      events_with_feedback: eventsWithStats.filter(e => e.has_feedback).length
    };

    console.log('Sending response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Get organizer feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user has submitted feedback for an event
const checkUserFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if user has already submitted feedback
    const existingFeedback = await db.query(
      'SELECT * FROM feedback WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );

    res.status(200).json({
      hasFeedback: existingFeedback.rows.length > 0,
      feedback: existingFeedback.rows[0] || null
    });
  } catch (error) {
    console.error('Check user feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send feedback notifications for completed events
const sendFeedbackNotifications = async (req, res) => {
  try {
    // This endpoint should be called by a scheduled job
    // For now, we'll make it admin-only
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format

    // Find events that have just ended (within the last day)
    const completedEvents = await db.query(`
      SELECT e.*, u.user_id as organizer_id
      FROM events e
      JOIN users u ON e.created_by = u.user_id
      WHERE e.status = 'approved'
      AND (e.date < $1 OR (e.date = $1 AND e.time < $2))
      AND e.date >= $3
    `, [today, currentTime, new Date(now - 24 * 60 * 60 * 1000).toISOString().split('T')[0]]);

    let notificationCount = 0;

    // For each completed event, send notifications to registered users who haven't submitted feedback
    for (const event of completedEvents.rows) {
      // Get all registrations for this event
      const registrations = await db.query(`
        SELECT r.user_id
        FROM registrations r
        LEFT JOIN feedback f ON r.event_id = f.event_id AND r.user_id = f.user_id
        WHERE r.event_id = $1
        AND r.status = 'confirmed'
        AND f.feedback_id IS NULL
      `, [event.event_id]);

      // Send notification to each registered user
      for (const registration of registrations.rows) {
        // Check if notification already exists
        const existingNotification = await db.query(`
          SELECT * FROM notifications
          WHERE user_id = $1 AND event_id = $2 AND message LIKE '%feedback%'
        `, [registration.user_id, event.event_id]);

        if (existingNotification.rows.length === 0) {
          await db.query(`
            INSERT INTO notifications (user_id, event_id, message)
            VALUES ($1, $2, $3)
          `, [
            registration.user_id,
            event.event_id,
            `Please provide feedback for the event "${event.title}" that you attended`
          ]);
          notificationCount++;
        }
      }
    }

    res.status(200).json({
      message: `Sent ${notificationCount} feedback notifications for completed events`
    });
  } catch (error) {
    console.error('Send feedback notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitFeedback,
  getEventFeedback,
  getOrganizerFeedback,
  checkUserFeedback,
  sendFeedbackNotifications
};
