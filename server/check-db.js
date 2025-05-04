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

async function checkDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Checking database tables...');
    
    // Check users table
    const usersResult = await client.query('SELECT COUNT(*) FROM users');
    console.log(`Users table exists with ${usersResult.rows[0].count} records`);
    
    // Check departments table
    const deptsResult = await client.query('SELECT COUNT(*) FROM departments');
    console.log(`Departments table exists with ${deptsResult.rows[0].count} records`);
    
    // Check events table
    const eventsResult = await client.query('SELECT COUNT(*) FROM events');
    console.log(`Events table exists with ${eventsResult.rows[0].count} records`);
    
    // Check registrations table
    const regsResult = await client.query('SELECT COUNT(*) FROM registrations');
    console.log(`Registrations table exists with ${regsResult.rows[0].count} records`);
    
    // Check notifications table
    const notifsResult = await client.query('SELECT COUNT(*) FROM notifications');
    console.log(`Notifications table exists with ${notifsResult.rows[0].count} records`);
    
    console.log('Database check completed successfully!');
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    // Release client
    client.release();
    // Close pool
    pool.end();
  }
}

// Execute the check
checkDatabase();
