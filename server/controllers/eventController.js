const db = require('../utils/db');

// Get all events
const getAllEvents = async (req, res) => {
  try {
    console.log('Get all events request received');
    const { status, type, dept_id, search } = req.query;
    console.log('Query params:', { status, type, dept_id, search });

    const queryParams = [];
    let paramIndex = 1;

    // Get current date and time
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format

    let query = `
      SELECT e.*, d.dept_name, u.name as organizer_name,
      (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id AND r.status = 'confirmed') as participant_count
      FROM events e
      JOIN departments d ON e.dept_id = d.dept_id
      JOIN users u ON e.created_by = u.user_id
      WHERE (e.date > $${paramIndex} OR (e.date = $${paramIndex} AND e.time > $${paramIndex+1}))
    `;

    queryParams.push(today);
    queryParams.push(currentTime);
    paramIndex += 2;

    // Add filters if provided
    if (status) {
      query += ` AND e.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (type) {
      query += ` AND e.type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    if (dept_id) {
      query += ` AND e.dept_id = $${paramIndex}`;
      queryParams.push(dept_id);
      paramIndex++;
    }

    if (search) {
      query += ` AND (e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Handle status filter differently
    if (status) {
      // If status is explicitly provided in the query params, use that
      query += ` AND e.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    } else if (!req.user || req.user.role === 'student') {
      // Only show approved events to non-authenticated or regular users
      query += ` AND e.status = 'approved'`;
    }

    query += ` ORDER BY e.date ASC, e.time ASC`;

    console.log('Final query:', query);
    console.log('Query params:', queryParams);

    // Log current date and time for debugging
    const currentDate = new Date();
    console.log('Current date:', currentDate.toISOString());
    console.log('Current date only:', currentDate.toISOString().split('T')[0]);
    console.log('Current time only:', currentDate.toTimeString().split(' ')[0]);

    const events = await db.query(query, queryParams);
    console.log('Events found:', events.rows.length);

    // Log event dates for debugging
    if (events.rows.length > 0) {
      console.log('Sample event dates:');
      events.rows.slice(0, 3).forEach(event => {
        console.log(`Event ID ${event.event_id}: date=${event.date}, time=${event.time}`);
      });
    }

    res.status(200).json({
      events: events.rows
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await db.query(`
      SELECT e.*, d.dept_name, u.name as organizer_name,
      (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id AND r.status = 'confirmed') as participant_count
      FROM events e
      JOIN departments d ON e.dept_id = d.dept_id
      JOIN users u ON e.created_by = u.user_id
      WHERE e.event_id = $1
    `, [id]);

    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user can view this event (if it's not approved)
    if (event.rows[0].status !== 'approved') {
      // If not authenticated, deny access
      if (!req.user) {
        console.log('Access denied: User not authenticated');
        return res.status(403).json({ message: 'Access denied. This event is pending approval.' });
      }

      // If student and not the creator, deny access
      if (req.user.role === 'student' && req.user.id !== event.rows[0].created_by) {
        console.log('Access denied: Student not creator');
        console.log('User ID:', req.user.id, 'Creator ID:', event.rows[0].created_by);
        return res.status(403).json({ message: 'Access denied. This event is pending approval.' });
      }

      // If organizer and not the creator, deny access
      if (req.user.role === 'organizer' && req.user.id !== event.rows[0].created_by) {
        console.log('Access denied: Organizer not creator');
        console.log('User ID:', req.user.id, 'Creator ID:', event.rows[0].created_by);
        return res.status(403).json({ message: 'Access denied. This event is pending approval.' });
      }

      // Admin can always access
      console.log('Access granted to user:', req.user.id, 'Role:', req.user.role);
    }

    // Get participants
    const participants = await db.query(`
      SELECT u.user_id, u.name, u.email, r.status, r.registered_at
      FROM registrations r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.event_id = $1
      ORDER BY r.registered_at ASC
    `, [id]);

    res.status(200).json({
      event: event.rows[0],
      participants: participants.rows
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    console.log('Create event request received:', req.body);
    console.log('User info:', req.user);

    const {
      title,
      description,
      date,
      time,
      location,
      dept_id,
      type,
      max_participants
    } = req.body;

    // For backward compatibility
    const event_type = type;

    // Validate required fields
    if (!title || !date || !time || !location || !dept_id || !type) {
      console.log('Missing required fields:', { title, date, time, location, dept_id, type });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if department exists
    console.log('Checking department:', dept_id);
    const deptCheck = await db.query('SELECT * FROM departments WHERE dept_id = $1', [dept_id]);
    console.log('Department check result:', deptCheck.rows);

    if (deptCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid department' });
    }

    // Set initial status based on user role
    let status = 'pending';
    if (req.user.role === 'admin') {
      status = 'approved';
    }

    console.log('Inserting event with status:', status);

    // Create the event
    const newEvent = await db.query(`
      INSERT INTO events (
        title, description, date, time, location, created_by, dept_id, status, type, max_participants
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      title, description, date, time, location, req.user.id, dept_id, status, event_type, max_participants
    ]);

    console.log('Event created successfully:', newEvent.rows[0]);

    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent.rows[0]
    });
  } catch (error) {
    console.error('Create event error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      time,
      location,
      dept_id,
      type, // Changed from event_type to type
      max_participants
    } = req.body;

    console.log('Update event request received:', req.body);

    // Check if event exists
    const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1', [id]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user has permission to update
    if (req.user.role !== 'admin' && eventCheck.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update the event
    const updatedEvent = await db.query(`
      UPDATE events
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        date = COALESCE($3, date),
        time = COALESCE($4, time),
        location = COALESCE($5, location),
        dept_id = COALESCE($6, dept_id),
        type = COALESCE($7, type),
        max_participants = COALESCE($8, max_participants)
      WHERE event_id = $9
      RETURNING *
    `, [
      title, description, date, time, location, dept_id, type, max_participants, id
    ]);

    res.status(200).json({
      message: 'Event updated successfully',
      event: updatedEvent.rows[0]
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1', [id]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user has permission to delete
    if (req.user.role !== 'admin' && eventCheck.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete registrations first
    await db.query('DELETE FROM registrations WHERE event_id = $1', [id]);

    // Delete notifications
    await db.query('DELETE FROM notifications WHERE event_id = $1', [id]);

    // Delete the event
    await db.query('DELETE FROM events WHERE event_id = $1', [id]);

    res.status(200).json({
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve or reject an event
const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Check if event exists
    const eventCheck = await db.query('SELECT * FROM events WHERE event_id = $1', [id]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update the event status
    const updatedEvent = await db.query(`
      UPDATE events
      SET status = $1
      WHERE event_id = $2
      RETURNING *
    `, [status, id]);

    // Create notification for the event creator
    await db.query(`
      INSERT INTO notifications (user_id, event_id, message)
      VALUES ($1, $2, $3)
    `, [
      eventCheck.rows[0].created_by,
      id,
      `Your event "${eventCheck.rows[0].title}" has been ${status}`
    ]);

    res.status(200).json({
      message: `Event ${status} successfully`,
      event: updatedEvent.rows[0]
    });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register for an event
const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if event exists and is approved
    const eventCheck = await db.query(`
      SELECT * FROM events WHERE event_id = $1 AND status = 'approved'
    `, [id]);

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found or not approved' });
    }

    // Check if user is already registered
    const registrationCheck = await db.query(`
      SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2
    `, [id, userId]);

    if (registrationCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if event has reached max participants
    const participantCount = await db.query(`
      SELECT COUNT(*) FROM registrations WHERE event_id = $1 AND status = 'confirmed'
    `, [id]);

    let status = 'confirmed';
    if (eventCheck.rows[0].max_participants &&
        parseInt(participantCount.rows[0].count) >= eventCheck.rows[0].max_participants) {
      status = 'waitlisted';
    }

    // Register for the event
    const registration = await db.query(`
      INSERT INTO registrations (user_id, event_id, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, id, status]);

    // Create notification for the event creator
    await db.query(`
      INSERT INTO notifications (user_id, event_id, message)
      VALUES ($1, $2, $3)
    `, [
      eventCheck.rows[0].created_by,
      id,
      `A new user has registered for your event "${eventCheck.rows[0].title}"`
    ]);

    res.status(201).json({
      message: `Successfully registered for the event (Status: ${status})`,
      registration: registration.rows[0]
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel registration for an event
const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if registration exists
    const registrationCheck = await db.query(`
      SELECT r.*, e.title
      FROM registrations r
      JOIN events e ON r.event_id = e.event_id
      WHERE r.event_id = $1 AND r.user_id = $2
    `, [id, userId]);

    if (registrationCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Delete the registration
    await db.query(`
      DELETE FROM registrations
      WHERE event_id = $1 AND user_id = $2
    `, [id, userId]);

    // If a user was waitlisted, move the next waitlisted user to confirmed
    if (registrationCheck.rows[0].status === 'confirmed') {
      const nextWaitlisted = await db.query(`
        SELECT * FROM registrations
        WHERE event_id = $1 AND status = 'waitlisted'
        ORDER BY registered_at ASC
        LIMIT 1
      `, [id]);

      if (nextWaitlisted.rows.length > 0) {
        await db.query(`
          UPDATE registrations
          SET status = 'confirmed'
          WHERE reg_id = $1
        `, [nextWaitlisted.rows[0].reg_id]);

        // Notify the user who got moved from waitlist
        await db.query(`
          INSERT INTO notifications (user_id, event_id, message)
          VALUES ($1, $2, $3)
        `, [
          nextWaitlisted.rows[0].user_id,
          id,
          `You have been moved from the waitlist to confirmed for the event "${registrationCheck.rows[0].title}"`
        ]);
      }
    }

    res.status(200).json({
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's registered events
const getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const registeredEvents = await db.query(`
      SELECT e.*, d.dept_name, r.status as registration_status, r.registered_at
      FROM registrations r
      JOIN events e ON r.event_id = e.event_id
      JOIN departments d ON e.dept_id = d.dept_id
      WHERE r.user_id = $1
      ORDER BY e.date ASC, e.time ASC
    `, [userId]);

    res.status(200).json({
      events: registeredEvents.rows
    });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get events created by user
const getCreatedEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const createdEvents = await db.query(`
      SELECT e.*, d.dept_name,
      (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id AND r.status = 'confirmed') as participant_count
      FROM events e
      JOIN departments d ON e.dept_id = d.dept_id
      WHERE e.created_by = $1
      ORDER BY e.date ASC, e.time ASC
    `, [userId]);

    res.status(200).json({
      events: createdEvents.rows
    });
  } catch (error) {
    console.error('Get created events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  registerForEvent,
  cancelRegistration,
  getUserEvents,
  getCreatedEvents
};
