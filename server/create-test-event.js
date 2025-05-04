const db = require('./utils/db');

async function createTestEvent() {
  try {
    console.log('Creating a test event with a past date...');
    
    // Get organizer user ID (assuming user with role 'organizer' exists)
    const organizerResult = await db.query(`
      SELECT user_id FROM users WHERE role = 'organizer' LIMIT 1
    `);
    
    if (organizerResult.rows.length === 0) {
      console.error('No organizer user found. Please create an organizer user first.');
      return;
    }
    
    const organizerId = organizerResult.rows[0].user_id;
    
    // Create a past event (yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const eventResult = await db.query(`
      INSERT INTO events (
        title, description, date, time, location, max_participants, 
        created_by, dept_id, event_type, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING *
    `, [
      'Test Past Event for Feedback',
      'This is a test event created to test the feedback system',
      pastDate,
      '14:00:00', // 2 PM
      'Virtual',
      50,
      organizerId,
      1, // Assuming department ID 1 exists
      'Workshop',
      'approved' // Auto-approve for testing
    ]);
    
    const eventId = eventResult.rows[0].event_id;
    console.log(`Created test event with ID: ${eventId}`);
    
    // Get student user ID (assuming user with role 'student' exists)
    const studentResult = await db.query(`
      SELECT user_id FROM users WHERE role = 'student' LIMIT 1
    `);
    
    if (studentResult.rows.length === 0) {
      console.error('No student user found. Please create a student user first.');
      return;
    }
    
    const studentId = studentResult.rows[0].user_id;
    
    // Register the student for the event
    await db.query(`
      INSERT INTO registrations (
        user_id, event_id, status, registered_at
      ) VALUES (
        $1, $2, $3, $4
      )
    `, [
      studentId,
      eventId,
      'confirmed',
      new Date()
    ]);
    
    console.log(`Registered student (ID: ${studentId}) for the event`);
    console.log('Test setup completed successfully!');
    
  } catch (error) {
    console.error('Error creating test event:', error);
  } finally {
    process.exit();
  }
}

// Execute the function
createTestEvent();
