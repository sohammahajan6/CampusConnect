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

async function deleteAllEvents() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    console.log('Deleting all event-related data...');
    
    // First, delete from registrations table (has foreign key to events)
    const registrationsResult = await client.query('DELETE FROM registrations');
    console.log(`Deleted ${registrationsResult.rowCount} registrations`);
    
    // Next, delete from notifications table (has foreign key to events)
    const notificationsResult = await client.query('DELETE FROM notifications');
    console.log(`Deleted ${notificationsResult.rowCount} notifications`);
    
    // Finally, delete from events table
    const eventsResult = await client.query('DELETE FROM events');
    console.log(`Deleted ${eventsResult.rowCount} events`);
    
    // Reset the event_id sequence to start from 1 again
    await client.query('ALTER SEQUENCE events_event_id_seq RESTART WITH 1');
    console.log('Reset event_id sequence to start from 1');
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('All event data has been deleted successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error deleting event data:', error);
  } finally {
    // Release client
    client.release();
    // Close pool
    pool.end();
  }
}

// Execute the deletion
deleteAllEvents();
