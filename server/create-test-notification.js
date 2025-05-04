const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get database connection string from .env
const connectionString = process.env.DATABASE_URL;

// Create a new pool
const pool = new Pool({
  connectionString,
});

async function createTestNotification() {
  const client = await pool.connect();
  
  try {
    console.log('Creating a test feedback notification...');
    
    // Get a student user ID
    const studentResult = await client.query(`
      SELECT user_id FROM users WHERE role = 'student' LIMIT 1
    `);
    
    if (studentResult.rows.length === 0) {
      console.error('No student user found. Please create a student user first.');
      return;
    }
    
    const studentId = studentResult.rows[0].user_id;
    
    // Get an event ID (any event will do for testing)
    const eventResult = await client.query(`
      SELECT event_id, title FROM events LIMIT 1
    `);
    
    if (eventResult.rows.length === 0) {
      console.error('No events found. Please create an event first.');
      return;
    }
    
    const eventId = eventResult.rows[0].event_id;
    const eventTitle = eventResult.rows[0].title;
    
    // Create the notification
    const message = `Please provide feedback for the event "${eventTitle}" that you attended`;
    
    const notificationResult = await client.query(`
      INSERT INTO notifications (user_id, event_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [studentId, eventId, message]);
    
    console.log('Created notification:', notificationResult.rows[0]);
    console.log(`Notification created for student ID ${studentId} for event ID ${eventId}`);
    
  } catch (error) {
    console.error('Error creating notification:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the function
createTestNotification();
